using Pascholotto.Application.Exceptions;

namespace Pascholotto.Application.Rules;

public sealed record InstallmentDebtSnapshot(Guid InstallmentId, int Number, DateOnly DueDate, decimal PrincipalAmount);

public sealed record InstallmentDebtBreakdown(
    Guid InstallmentId,
    int InstallmentNumber,
    DateOnly DueDate,
    int DaysOverdue,
    decimal PrincipalAmount,
    decimal PenaltyAmount,
    decimal InterestAmount,
    decimal TotalAmount);

public sealed record DebtBreakdownResult(
    decimal TotalPrincipal,
    decimal TotalPenalty,
    decimal TotalInterest,
    decimal TotalAmount,
    IReadOnlyList<InstallmentDebtBreakdown> Items);

public static class DebtCalculationPolicy
{
    private const decimal PenaltyRate = 0.02m;
    private const decimal MonthlyInterestRate = 0.01m;

    public static DebtBreakdownResult Calculate(DateOnly calculationDate, IEnumerable<InstallmentDebtSnapshot> installments)
    {
        var source = installments.ToList();
        if (source.Count == 0)
        {
            throw new ValidationException("The contract has no open installments to calculate.");
        }

        var items = new List<InstallmentDebtBreakdown>(source.Count);
        decimal totalPrincipal = 0;
        decimal totalPenalty = 0;
        decimal totalInterest = 0;

        foreach (var installment in source.OrderBy(item => item.Number))
        {
            var daysOverdue = Math.Max(0, calculationDate.DayNumber - installment.DueDate.DayNumber);
            var penalty = daysOverdue > 0 ? RoundCurrency(installment.PrincipalAmount * PenaltyRate) : 0m;
            var interest = daysOverdue > 0
                ? RoundCurrency(installment.PrincipalAmount * MonthlyInterestRate * daysOverdue / 30m)
                : 0m;
            var total = RoundCurrency(installment.PrincipalAmount + penalty + interest);

            totalPrincipal += installment.PrincipalAmount;
            totalPenalty += penalty;
            totalInterest += interest;

            items.Add(new InstallmentDebtBreakdown(
                installment.InstallmentId,
                installment.Number,
                installment.DueDate,
                daysOverdue,
                installment.PrincipalAmount,
                penalty,
                interest,
                total));
        }

        totalPrincipal = RoundCurrency(totalPrincipal);
        totalPenalty = RoundCurrency(totalPenalty);
        totalInterest = RoundCurrency(totalInterest);

        return new DebtBreakdownResult(
            totalPrincipal,
            totalPenalty,
            totalInterest,
            RoundCurrency(totalPrincipal + totalPenalty + totalInterest),
            items);
    }

    public static decimal RoundCurrency(decimal value) => decimal.Round(value, 2, MidpointRounding.AwayFromZero);
}
