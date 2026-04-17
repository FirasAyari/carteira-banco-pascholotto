namespace Pascholotto.Domain;

public sealed class Installment
{
    public Guid Id { get; set; }
    public Guid ContractId { get; set; }
    public Contract? Contract { get; set; }
    public int Number { get; set; }
    public DateOnly DueDate { get; set; }
    public decimal PrincipalAmount { get; set; }
    public decimal PaidAmount { get; set; }
    public InstallmentStatus Status { get; set; }
}
