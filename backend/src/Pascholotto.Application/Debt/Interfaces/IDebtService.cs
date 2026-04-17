using Pascholotto.Application.DTOs;

namespace Pascholotto.Application.Interfaces;

public interface IDebtService
{
    Task<DebtCalculationResponse> CalculateAsync(Guid contractId, Guid operatorId, DebtCalculationRequest request, CancellationToken cancellationToken);
}
