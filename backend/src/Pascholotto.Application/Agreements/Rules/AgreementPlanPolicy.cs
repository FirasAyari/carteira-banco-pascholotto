using Pascholotto.Application.Exceptions;

namespace Pascholotto.Application.Rules;

public sealed record AgreementPlanInstallment(int Number, DateOnly DueDate, decimal Amount, bool IsDownPayment);

public sealed record AgreementPlanResult(
    int InstallmentCount,
    decimal TotalAmount,
    decimal DownPaymentAmount,
    decimal FinancedAmount,
    DateOnly FirstDueDate,
    IReadOnlyList<AgreementPlanInstallment> Installments);

public static class AgreementPlanPolicy
{
    public static AgreementPlanResult Build(decimal totalAmount, int installmentCount, decimal downPaymentAmount, DateOnly firstDueDate)
    {
        if (totalAmount <= 0)
        {
            throw new ValidationException("Agreement total amount must be greater than zero.");
        }

        if (installmentCount is < 1 or > 12)
        {
            throw new ValidationException("Agreement installment count must be between 1 and 12.");
        }

        if (downPaymentAmount < 0)
        {
            throw new ValidationException("Down payment amount cannot be negative.");
        }

        if (downPaymentAmount >= totalAmount)
        {
            throw new ValidationException("Down payment amount must be lower than the total agreement amount.");
        }

        if (downPaymentAmount > 0 && installmentCount < 2)
        {
            throw new ValidationException("A down payment requires at least 2 installments.");
        }

        var installments = new List<AgreementPlanInstallment>(installmentCount);
        var remainingAmount = totalAmount;
        var remainingInstallments = installmentCount;

        if (downPaymentAmount > 0)
        {
            var roundedDownPayment = DebtCalculationPolicy.RoundCurrency(downPaymentAmount);
            installments.Add(new AgreementPlanInstallment(1, firstDueDate, roundedDownPayment, true));
            remainingAmount = DebtCalculationPolicy.RoundCurrency(totalAmount - roundedDownPayment);
            remainingInstallments--;
        }

        if (remainingInstallments == 0)
        {
            throw new ValidationException("The agreement must contain at least one financed installment.");
        }

        var baseAmount = DebtCalculationPolicy.RoundCurrency(remainingAmount / remainingInstallments);
        var scheduleStart = installments.Count == 0 ? 1 : 2;

        for (var number = scheduleStart; number <= installmentCount; number++)
        {
            var dueDate = firstDueDate.AddMonths(number - 1);
            var amount = number == installmentCount
                ? DebtCalculationPolicy.RoundCurrency(totalAmount - installments.Sum(item => item.Amount))
                : baseAmount;

            installments.Add(new AgreementPlanInstallment(number, dueDate, amount, false));
        }

        return new AgreementPlanResult(
            installmentCount,
            DebtCalculationPolicy.RoundCurrency(totalAmount),
            DebtCalculationPolicy.RoundCurrency(downPaymentAmount),
            DebtCalculationPolicy.RoundCurrency(totalAmount - downPaymentAmount),
            firstDueDate,
            installments);
    }
}
