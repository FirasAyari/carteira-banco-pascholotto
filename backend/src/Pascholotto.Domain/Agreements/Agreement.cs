namespace Pascholotto.Domain;

public sealed class Agreement
{
    public Guid Id { get; set; }
    public Guid ContractId { get; set; }
    public Contract? Contract { get; set; }
    public Guid DebtCalculationId { get; set; }
    public DebtCalculation? DebtCalculation { get; set; }
    public Guid CreatedByUserId { get; set; }
    public User? CreatedByUser { get; set; }
    public AgreementStatus Status { get; set; }
    public int InstallmentCount { get; set; }
    public DateOnly FirstDueDate { get; set; }
    public decimal DownPaymentAmount { get; set; }
    public decimal FinancedAmount { get; set; }
    public decimal TotalAmount { get; set; }
    public DateTime CreatedAtUtc { get; set; }
    public ICollection<AgreementInstallment> Installments { get; set; } = new List<AgreementInstallment>();
    public ICollection<BoletoDocument> Boletos { get; set; } = new List<BoletoDocument>();
}
