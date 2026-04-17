using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Pascholotto.Application.Configuration;
using Pascholotto.Application.Interfaces;
using Pascholotto.Infrastructure.Persistence;
using Pascholotto.Infrastructure.Services;
using QuestPDF.Infrastructure;

namespace Pascholotto.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddPascholottoInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("PascholottoDb")
            ?? throw new InvalidOperationException("Connection string 'PascholottoDb' was not found.");

        QuestPDF.Settings.License = LicenseType.Community;

        services.Configure<JwtOptions>(options =>
        {
            var section = configuration.GetSection(JwtOptions.SectionName);
            options.Issuer = section["Issuer"] ?? options.Issuer;
            options.Audience = section["Audience"] ?? options.Audience;
            options.SigningKey = section["SigningKey"] ?? options.SigningKey;

            if (int.TryParse(section["ExpirationMinutes"], out var expirationMinutes))
            {
                options.ExpirationMinutes = expirationMinutes;
            }
        });
        services.AddSingleton(TimeProvider.System);
        services.AddScoped<PasswordHasher>();
        services.AddScoped<ITokenService, JwtTokenService>();
        services.AddScoped<IBoletoPdfGenerator, QuestPdfBoletoPdfGenerator>();
        services.AddScoped<BoletoCodeGenerator>();
        services.AddScoped<DatabaseSeeder>();

        services.AddDbContext<PascholottoDbContext>(options => options.UseSqlServer(connectionString));

        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IContractService, ContractService>();
        services.AddScoped<IDebtService, DebtService>();
        services.AddScoped<IAgreementService, AgreementService>();

        return services;
    }

    public static async Task InitializeDatabaseAsync(this IServiceProvider serviceProvider)
    {
        const int maxAttempts = 10;

        for (var attempt = 1; attempt <= maxAttempts; attempt++)
        {
            try
            {
                using var scope = serviceProvider.CreateScope();
                var dbContext = scope.ServiceProvider.GetRequiredService<PascholottoDbContext>();
                await dbContext.Database.EnsureCreatedAsync();

                var seeder = scope.ServiceProvider.GetRequiredService<DatabaseSeeder>();
                await seeder.SeedAsync();
                return;
            }
            catch when (attempt < maxAttempts)
            {
                await Task.Delay(TimeSpan.FromSeconds(5));
            }
        }
    }
}
