namespace Pascholotto.Domain;

public sealed class Contract
{
    public Guid Id { get; set; }
    public string ContractNumber { get; set; } = string.Empty;
    public string CustomerName { get; set; } = string.Empty;
    public string CustomerDocument { get; set; } = string.Empty;
    public string Portfolio { get; set; } = "Banco Pascholotto";
    public string Status { get; set; } = "Active";
    public DateTime CreatedAtUtc { get; set; }
    public ICollection<Installment> Installments { get; set; } = new List<Installment>();
    public ICollection<DebtCalculation> DebtCalculations { get; set; } = new List<DebtCalculation>();
    public ICollection<Agreement> Agreements { get; set; } = new List<Agreement>();
}
