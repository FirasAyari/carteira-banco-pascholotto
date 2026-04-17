namespace Pascholotto.Domain;

public sealed class DebtCalculationItem
{
    public Guid Id { get; set; }
    public Guid DebtCalculationId { get; set; }
    public DebtCalculation? DebtCalculation { get; set; }
    public Guid InstallmentId { get; set; }
    public Installment? Installment { get; set; }
    public int InstallmentNumber { get; set; }
    public DateOnly DueDate { get; set; }
    public int DaysOverdue { get; set; }
    public decimal PrincipalAmount { get; set; }
    public decimal PenaltyAmount { get; set; }
    public decimal InterestAmount { get; set; }
    public decimal TotalAmount { get; set; }
}
