using Pascholotto.Application.DTOs;

namespace Pascholotto.Application.Interfaces;

public interface IContractService
{
    Task<IReadOnlyList<ContractSummaryResponse>> SearchAsync(string? document, string? contractNumber, CancellationToken cancellationToken);
    Task<ContractDetailResponse> GetByIdAsync(Guid contractId, CancellationToken cancellationToken);
}
