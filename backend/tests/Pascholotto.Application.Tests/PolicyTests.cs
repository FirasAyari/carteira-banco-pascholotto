using Pascholotto.Application.Exceptions;
using Pascholotto.Application.Rules;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace Pascholotto.Application.Tests;

[TestClass]
public sealed class PolicyTests
{
    [TestMethod]
    public void DebtCalculationPolicy_ShouldApplyPenaltyAndInterestOnlyToOverdueInstallments()
    {
        var calculationDate = new DateOnly(2026, 4, 16);
        InstallmentDebtSnapshot[] installments =
        [
            new InstallmentDebtSnapshot(Guid.NewGuid(), 1, new DateOnly(2026, 3, 16), 100m),
            new InstallmentDebtSnapshot(Guid.NewGuid(), 2, new DateOnly(2026, 4, 20), 200m)
        ];

        var result = DebtCalculationPolicy.Calculate(calculationDate, installments);

        Assert.AreEqual(300m, result.TotalPrincipal);
        Assert.AreEqual(2m, result.TotalPenalty);
        Assert.AreEqual(1.03m, result.TotalInterest);
        Assert.AreEqual(303.03m, result.TotalAmount);
        Assert.AreEqual(31, result.Items[0].DaysOverdue);
        Assert.AreEqual(0m, result.Items[1].PenaltyAmount);
        Assert.AreEqual(0m, result.Items[1].InterestAmount);
    }

    [TestMethod]
    public void AgreementPlanPolicy_ShouldReserveDownPaymentAndAdjustLastInstallment()
    {
        var result = AgreementPlanPolicy.Build(1000m, 4, 100m, new DateOnly(2026, 4, 25));

        Assert.AreEqual(4, result.InstallmentCount);
        Assert.AreEqual(100m, result.DownPaymentAmount);
        Assert.AreEqual(900m, result.FinancedAmount);
        Assert.AreEqual(100m, result.Installments[0].Amount);
        Assert.IsTrue(result.Installments[0].IsDownPayment);
        Assert.AreEqual(300m, result.Installments[1].Amount);
        Assert.AreEqual(300m, result.Installments[2].Amount);
        Assert.AreEqual(300m, result.Installments[3].Amount);
        Assert.AreEqual(1000m, result.Installments.Sum(item => item.Amount));
    }

    [TestMethod]
    public void AgreementPlanPolicy_ShouldRejectDownPaymentWhenSingleInstallment()
    {
        try
        {
            AgreementPlanPolicy.Build(500m, 1, 50m, new DateOnly(2026, 4, 25));
            Assert.Fail("Expected a validation exception.");
        }
        catch (ValidationException)
        {
        }
    }
}
