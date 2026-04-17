namespace Pascholotto.Domain;

public sealed class BoletoDocument
{
    public Guid Id { get; set; }
    public Guid AgreementId { get; set; }
    public Agreement? Agreement { get; set; }
    public Guid AgreementInstallmentId { get; set; }
    public AgreementInstallment? AgreementInstallment { get; set; }
    public string DocumentNumber { get; set; } = string.Empty;
    public string PayerName { get; set; } = string.Empty;
    public string PayerDocument { get; set; } = string.Empty;
    public string LineDigitable { get; set; } = string.Empty;
    public string Barcode { get; set; } = string.Empty;
    public byte[] PdfContent { get; set; } = Array.Empty<byte>();
    public DateTime GeneratedAtUtc { get; set; }
}
