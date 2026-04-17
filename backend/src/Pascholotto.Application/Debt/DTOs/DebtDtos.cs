namespace Pascholotto.Application.DTOs;

public sealed record DebtCalculationRequest(DateOnly? CalculationDate);

public sealed record DebtCalculationItemResponse(
    Guid InstallmentId,
    int InstallmentNumber,
    DateOnly DueDate,
    int DaysOverdue,
    decimal PrincipalAmount,
    decimal PenaltyAmount,
    decimal InterestAmount,
    decimal TotalAmount);

public sealed record DebtCalculationResponse(
    Guid Id,
    Guid ContractId,
    DateOnly CalculationDate,
    decimal TotalPrincipal,
    decimal TotalPenalty,
    decimal TotalInterest,
    decimal TotalAmount,
    IReadOnlyList<DebtCalculationItemResponse> Items);
