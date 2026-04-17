namespace Pascholotto.Domain;

public sealed class AuditEvent
{
    public Guid Id { get; set; }
    public Guid? ContractId { get; set; }
    public Guid? DebtCalculationId { get; set; }
    public Guid? AgreementId { get; set; }
    public Guid PerformedByUserId { get; set; }
    public User? PerformedByUser { get; set; }
    public string EventType { get; set; } = string.Empty;
    public string PayloadJson { get; set; } = string.Empty;
    public DateTime CreatedAtUtc { get; set; }
}
