using Pascholotto.Application.DTOs;

namespace Pascholotto.Application.Interfaces;

public interface IAgreementService
{
    Task<AgreementSimulationResponse> SimulateAsync(Guid contractId, AgreementSimulationRequest request, CancellationToken cancellationToken);
    Task<AgreementDetailResponse> CreateAsync(Guid contractId, Guid operatorId, CreateAgreementRequest request, CancellationToken cancellationToken);
    Task<AgreementDetailResponse> GetByIdAsync(Guid agreementId, CancellationToken cancellationToken);
    Task<IReadOnlyList<BoletoSummaryResponse>> GetBoletosAsync(Guid agreementId, CancellationToken cancellationToken);
    Task<(byte[] Content, string FileName)> DownloadBoletoAsync(Guid agreementId, Guid installmentId, CancellationToken cancellationToken);
}
