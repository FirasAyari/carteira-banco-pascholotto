using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Pascholotto.Application.DTOs;
using Pascholotto.Application.Interfaces;

namespace Pascholotto.Api.Controllers;

[Authorize]
[Route("api/agreements")]
public sealed class AgreementsController(IAgreementService agreementService) : BaseApiController
{
    [HttpGet("{id:guid}")]
    [ProducesResponseType<AgreementDetailResponse>(StatusCodes.Status200OK)]
    public async Task<ActionResult<AgreementDetailResponse>> GetById(Guid id, CancellationToken cancellationToken)
    {
        var response = await agreementService.GetByIdAsync(id, cancellationToken);
        return Ok(response);
    }

    [HttpGet("{id:guid}/boletos")]
    [ProducesResponseType<IReadOnlyList<BoletoSummaryResponse>>(StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<BoletoSummaryResponse>>> GetBoletos(Guid id, CancellationToken cancellationToken)
    {
        var response = await agreementService.GetBoletosAsync(id, cancellationToken);
        return Ok(response);
    }

    [HttpGet("{id:guid}/boletos/{installmentId:guid}/pdf")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> DownloadBoleto(Guid id, Guid installmentId, CancellationToken cancellationToken)
    {
        var (content, fileName) = await agreementService.DownloadBoletoAsync(id, installmentId, cancellationToken);
        return File(content, "application/pdf", fileName);
    }
}
