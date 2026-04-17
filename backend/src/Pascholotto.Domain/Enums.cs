namespace Pascholotto.Domain;

public enum InstallmentStatus
{
    Open = 1,
    Overdue = 2,
    Paid = 3
}

public enum AgreementStatus
{
    Active = 1,
    Cancelled = 2,
    Settled = 3
}

public enum AgreementInstallmentStatus
{
    Pending = 1,
    Paid = 2,
    Cancelled = 3
}
