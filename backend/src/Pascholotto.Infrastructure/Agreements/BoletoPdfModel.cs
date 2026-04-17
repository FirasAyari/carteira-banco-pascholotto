namespace Pascholotto.Infrastructure.Services;

internal sealed record BoletoPdfModel(
    string CustomerName,
    string CustomerDocument,
    string ContractNumber,
    Guid AgreementId,
    int InstallmentNumber,
    decimal Amount,
    DateOnly DueDate,
    string DocumentNumber,
    string LineDigitable,
    string Barcode,
    DateTime GeneratedAtUtc);
