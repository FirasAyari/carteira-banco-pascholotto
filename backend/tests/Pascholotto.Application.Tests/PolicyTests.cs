using Pascholotto.Application.Exceptions;
using Pascholotto.Application.Rules;

namespace Pascholotto.Application.Tests;

public sealed class PolicyTests
{
    [Fact]
    public void DebtCalculationPolicy_ShouldApplyPenaltyAndInterestOnlyToOverdueInstallments()
    {
        var calculationDate = new DateOnly(2026, 4, 16);
        InstallmentDebtSnapshot[] installments =
        [
            new InstallmentDebtSnapshot(Guid.NewGuid(), 1, new DateOnly(2026, 3, 16), 100m),
            new InstallmentDebtSnapshot(Guid.NewGuid(), 2, new DateOnly(2026, 4, 20), 200m)
        ];

        var result = DebtCalculationPolicy.Calculate(calculationDate, installments);

        Assert.Equal(300m, result.TotalPrincipal);
        Assert.Equal(2m, result.TotalPenalty);
        Assert.Equal(1.03m, result.TotalInterest);
        Assert.Equal(303.03m, result.TotalAmount);
        Assert.Equal(31, result.Items[0].DaysOverdue);
        Assert.Equal(0m, result.Items[1].PenaltyAmount);
        Assert.Equal(0m, result.Items[1].InterestAmount);
    }

    [Fact]
    public void AgreementPlanPolicy_ShouldReserveDownPaymentAndAdjustLastInstallment()
    {
        var result = AgreementPlanPolicy.Build(1000m, 4, 100m, new DateOnly(2026, 4, 25));

        Assert.Equal(4, result.InstallmentCount);
        Assert.Equal(100m, result.DownPaymentAmount);
        Assert.Equal(900m, result.FinancedAmount);
        Assert.Equal(100m, result.Installments[0].Amount);
        Assert.True(result.Installments[0].IsDownPayment);
        Assert.Equal(300m, result.Installments[1].Amount);
        Assert.Equal(300m, result.Installments[2].Amount);
        Assert.Equal(300m, result.Installments[3].Amount);
        Assert.Equal(1000m, result.Installments.Sum(item => item.Amount));
    }

    [Fact]
    public void AgreementPlanPolicy_ShouldRejectDownPaymentWhenSingleInstallment()
    {
        Assert.Throws<ValidationException>(() =>
            AgreementPlanPolicy.Build(500m, 1, 50m, new DateOnly(2026, 4, 25)));
    }
}
