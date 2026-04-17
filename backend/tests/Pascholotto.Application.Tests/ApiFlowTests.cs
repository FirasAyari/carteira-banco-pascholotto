using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Security.Claims;
using System.Text.Encodings.Web;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Storage;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Pascholotto.Application.DTOs;
using Pascholotto.Infrastructure.Persistence;

namespace Pascholotto.Application.Tests;

public sealed class ApiFlowTests : IClassFixture<PascholottoApiFactory>
{
    private readonly PascholottoApiFactory _factory;

    public ApiFlowTests(PascholottoApiFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task FullNegotiationFlow_ShouldCreateAgreementAndGeneratePdf()
    {
        using var client = _factory.CreateClient(new WebApplicationFactoryClientOptions
        {
            AllowAutoRedirect = false,
            BaseAddress = new Uri("https://localhost")
        });

        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue(TestAuthHandler.SchemeName);

        var contracts = await client.GetFromJsonAsync<List<ContractSummaryResponse>>("/api/contracts?contractNumber=BP-2026-001");
        Assert.NotNull(contracts);
        var contract = Assert.Single(contracts!);

        var debtResponse = await client.PostAsJsonAsync(
            $"/api/contracts/{contract.Id}/debt-calculations",
            new DebtCalculationRequest(null));
        Assert.Equal(HttpStatusCode.OK, debtResponse.StatusCode);

        var debtPayload = await debtResponse.Content.ReadFromJsonAsync<DebtCalculationResponse>();
        Assert.NotNull(debtPayload);
        Assert.True(debtPayload!.TotalAmount > 0);

        var firstDueDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(10));
        var createRequest = new CreateAgreementRequest(debtPayload.Id, 4, 100m, firstDueDate);

        var simulationResponse = await client.PostAsJsonAsync(
            $"/api/contracts/{contract.Id}/agreements/simulate",
            new AgreementSimulationRequest(debtPayload.Id, 4, 100m, firstDueDate));
        Assert.Equal(HttpStatusCode.OK, simulationResponse.StatusCode);

        var createResponse = await client.PostAsJsonAsync($"/api/contracts/{contract.Id}/agreements", createRequest);
        Assert.Equal(HttpStatusCode.Created, createResponse.StatusCode);

        var agreementPayload = await createResponse.Content.ReadFromJsonAsync<AgreementDetailResponse>();
        Assert.NotNull(agreementPayload);
        Assert.Equal(4, agreementPayload!.Installments.Count);

        var boletos = await client.GetFromJsonAsync<List<BoletoSummaryResponse>>($"/api/agreements/{agreementPayload.Id}/boletos");
        Assert.NotNull(boletos);
        Assert.Equal(4, boletos!.Count);

        var pdfResponse = await client.GetAsync($"/api/agreements/{agreementPayload.Id}/boletos/{agreementPayload.Installments[0].Id}/pdf");
        Assert.Equal(HttpStatusCode.OK, pdfResponse.StatusCode);
        Assert.Equal("application/pdf", pdfResponse.Content.Headers.ContentType?.MediaType);
    }

    [Fact]
    public async Task SecondActiveAgreement_ShouldBeRejected()
    {
        using var client = _factory.CreateClient(new WebApplicationFactoryClientOptions
        {
            BaseAddress = new Uri("https://localhost")
        });

        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue(TestAuthHandler.SchemeName);

        var contracts = await client.GetFromJsonAsync<List<ContractSummaryResponse>>("/api/contracts?contractNumber=BP-2026-002");
        var contract = Assert.Single(contracts!);

        var debtResponse = await client.PostAsJsonAsync(
            $"/api/contracts/{contract.Id}/debt-calculations",
            new DebtCalculationRequest(null));
        var debtPayload = await debtResponse.Content.ReadFromJsonAsync<DebtCalculationResponse>();

        var firstDueDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(12));
        var createRequest = new CreateAgreementRequest(debtPayload!.Id, 3, 0m, firstDueDate);

        var firstCreate = await client.PostAsJsonAsync($"/api/contracts/{contract.Id}/agreements", createRequest);
        Assert.Equal(HttpStatusCode.Created, firstCreate.StatusCode);

        var secondCreate = await client.PostAsJsonAsync($"/api/contracts/{contract.Id}/agreements", createRequest);
        Assert.Equal(HttpStatusCode.BadRequest, secondCreate.StatusCode);
    }

    [Fact]
    public async Task DebtCalculationWithPastDate_ShouldBeRejected()
    {
        using var client = _factory.CreateClient(new WebApplicationFactoryClientOptions
        {
            BaseAddress = new Uri("https://localhost")
        });

        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue(TestAuthHandler.SchemeName);

        var contracts = await client.GetFromJsonAsync<List<ContractSummaryResponse>>("/api/contracts?contractNumber=BP-2026-001");
        var contract = Assert.Single(contracts!);

        var response = await client.PostAsJsonAsync(
            $"/api/contracts/{contract.Id}/debt-calculations",
            new DebtCalculationRequest(DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-1))));

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }
}

public sealed class PascholottoApiFactory : WebApplicationFactory<Program>
{
    private readonly string _databaseName = $"PascholottoTests-{Guid.NewGuid():N}";
    private readonly InMemoryDatabaseRoot _databaseRoot = new();

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureServices(services =>
        {
            services.RemoveAll(typeof(DbContextOptions<PascholottoDbContext>));
            services.RemoveAll(typeof(PascholottoDbContext));
            services.RemoveAll(typeof(IDbContextOptionsConfiguration<PascholottoDbContext>));

            services.AddDbContext<PascholottoDbContext>(options =>
                options.UseInMemoryDatabase(_databaseName, _databaseRoot));

            services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = TestAuthHandler.SchemeName;
                options.DefaultChallengeScheme = TestAuthHandler.SchemeName;
                options.DefaultScheme = TestAuthHandler.SchemeName;
            }).AddScheme<AuthenticationSchemeOptions, TestAuthHandler>(TestAuthHandler.SchemeName, _ => { });
        });
    }
}

public sealed class TestAuthHandler(
    IOptionsMonitor<AuthenticationSchemeOptions> options,
    ILoggerFactory logger,
    UrlEncoder encoder)
    : AuthenticationHandler<AuthenticationSchemeOptions>(options, logger, encoder)
{
    public const string SchemeName = "Test";

    protected override Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        var identity = new ClaimsIdentity(
        [
            new Claim(ClaimTypes.NameIdentifier, "11111111-1111-1111-1111-111111111111"),
            new Claim(ClaimTypes.Name, "Test Operator"),
            new Claim(ClaimTypes.Role, "Operator")
        ], SchemeName);

        var principal = new ClaimsPrincipal(identity);
        var ticket = new AuthenticationTicket(principal, SchemeName);
        return Task.FromResult(AuthenticateResult.Success(ticket));
    }
}
