namespace Pascholotto.Application.DTOs;

public sealed record ContractSummaryResponse(
    Guid Id,
    string ContractNumber,
    string CustomerName,
    string CustomerDocument,
    string Portfolio,
    string Status,
    decimal OpenBalance,
    int OpenInstallments);

public sealed record InstallmentResponse(
    Guid Id,
    int Number,
    DateOnly DueDate,
    decimal PrincipalAmount,
    decimal PaidAmount,
    string Status);

public sealed record ContractDetailResponse(
    Guid Id,
    string ContractNumber,
    string CustomerName,
    string CustomerDocument,
    string Portfolio,
    string Status,
    decimal OpenBalance,
    Guid? ActiveAgreementId,
    IReadOnlyList<InstallmentResponse> Installments);
