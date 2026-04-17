namespace Pascholotto.Domain;

public sealed class DebtCalculation
{
    public Guid Id { get; set; }
    public Guid ContractId { get; set; }
    public Contract? Contract { get; set; }
    public Guid PerformedByUserId { get; set; }
    public User? PerformedByUser { get; set; }
    public DateOnly CalculationDate { get; set; }
    public decimal TotalPrincipal { get; set; }
    public decimal TotalPenalty { get; set; }
    public decimal TotalInterest { get; set; }
    public decimal TotalAmount { get; set; }
    public DateTime CreatedAtUtc { get; set; }
    public ICollection<DebtCalculationItem> Items { get; set; } = new List<DebtCalculationItem>();
}
