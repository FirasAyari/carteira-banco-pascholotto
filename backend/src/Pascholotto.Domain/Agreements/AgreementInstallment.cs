namespace Pascholotto.Domain;

public sealed class AgreementInstallment
{
    public Guid Id { get; set; }
    public Guid AgreementId { get; set; }
    public Agreement? Agreement { get; set; }
    public int Number { get; set; }
    public DateOnly DueDate { get; set; }
    public decimal Amount { get; set; }
    public AgreementInstallmentStatus Status { get; set; }
    public BoletoDocument? BoletoDocument { get; set; }
}
