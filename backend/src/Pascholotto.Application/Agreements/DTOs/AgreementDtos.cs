namespace Pascholotto.Application.DTOs;

public sealed record AgreementSimulationRequest(
    Guid DebtCalculationId,
    int InstallmentCount,
    decimal DownPaymentAmount,
    DateOnly FirstDueDate);

public sealed record CreateAgreementRequest(
    Guid DebtCalculationId,
    int InstallmentCount,
    decimal DownPaymentAmount,
    DateOnly FirstDueDate);

public sealed record AgreementInstallmentPlanResponse(
    int Number,
    DateOnly DueDate,
    decimal Amount,
    bool IsDownPayment);

public sealed record AgreementSimulationResponse(
    Guid ContractId,
    Guid DebtCalculationId,
    int InstallmentCount,
    decimal TotalAmount,
    decimal DownPaymentAmount,
    decimal FinancedAmount,
    DateOnly FirstDueDate,
    IReadOnlyList<AgreementInstallmentPlanResponse> Installments);

public sealed record BoletoSummaryResponse(
    Guid AgreementInstallmentId,
    string DocumentNumber,
    string LineDigitable,
    string Barcode,
    DateTime GeneratedAtUtc);

public sealed record AuditEventResponse(
    Guid Id,
    string EventType,
    string PerformedBy,
    DateTime CreatedAtUtc,
    string PayloadJson);

public sealed record AgreementInstallmentResponse(
    Guid Id,
    int Number,
    DateOnly DueDate,
    decimal Amount,
    string Status,
    BoletoSummaryResponse? Boleto);

public sealed record AgreementDetailResponse(
    Guid Id,
    Guid ContractId,
    string ContractNumber,
    string CustomerName,
    string CustomerDocument,
    string Status,
    DateOnly FirstDueDate,
    int InstallmentCount,
    decimal DownPaymentAmount,
    decimal FinancedAmount,
    decimal TotalAmount,
    DateTime CreatedAtUtc,
    IReadOnlyList<AgreementInstallmentResponse> Installments,
    IReadOnlyList<AuditEventResponse> AuditTrail);
