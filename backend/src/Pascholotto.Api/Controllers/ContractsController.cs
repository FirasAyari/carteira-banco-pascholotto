using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Pascholotto.Application.DTOs;
using Pascholotto.Application.Interfaces;

namespace Pascholotto.Api.Controllers;

[Authorize]
[Route("api/contracts")]
public sealed class ContractsController(
    IContractService contractService,
    IDebtService debtService,
    IAgreementService agreementService) : BaseApiController
{
    [HttpGet]
    [ProducesResponseType<IReadOnlyList<ContractSummaryResponse>>(StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<ContractSummaryResponse>>> Search(
        [FromQuery] string? document,
        [FromQuery] string? contractNumber,
        CancellationToken cancellationToken)
    {
        var response = await contractService.SearchAsync(document, contractNumber, cancellationToken);
        return Ok(response);
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType<ContractDetailResponse>(StatusCodes.Status200OK)]
    public async Task<ActionResult<ContractDetailResponse>> GetById(Guid id, CancellationToken cancellationToken)
    {
        var response = await contractService.GetByIdAsync(id, cancellationToken);
        return Ok(response);
    }

    [HttpPost("{id:guid}/debt-calculations")]
    [ProducesResponseType<DebtCalculationResponse>(StatusCodes.Status200OK)]
    public async Task<ActionResult<DebtCalculationResponse>> CalculateDebt(
        Guid id,
        [FromBody] DebtCalculationRequest request,
        CancellationToken cancellationToken)
    {
        var response = await debtService.CalculateAsync(id, GetCurrentUserId(), request, cancellationToken);
        return Ok(response);
    }

    [HttpPost("{id:guid}/agreements/simulate")]
    [ProducesResponseType<AgreementSimulationResponse>(StatusCodes.Status200OK)]
    public async Task<ActionResult<AgreementSimulationResponse>> SimulateAgreement(
        Guid id,
        [FromBody] AgreementSimulationRequest request,
        CancellationToken cancellationToken)
    {
        var response = await agreementService.SimulateAsync(id, request, cancellationToken);
        return Ok(response);
    }

    [HttpPost("{id:guid}/agreements")]
    [ProducesResponseType<AgreementDetailResponse>(StatusCodes.Status201Created)]
    public async Task<ActionResult<AgreementDetailResponse>> CreateAgreement(
        Guid id,
        [FromBody] CreateAgreementRequest request,
        CancellationToken cancellationToken)
    {
        var response = await agreementService.CreateAsync(id, GetCurrentUserId(), request, cancellationToken);
        return CreatedAtAction(nameof(AgreementsController.GetById), "Agreements", new { id = response.Id }, response);
    }
}
