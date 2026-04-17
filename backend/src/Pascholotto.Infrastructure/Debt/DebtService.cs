using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Pascholotto.Application.DTOs;
using Pascholotto.Application.Exceptions;
using Pascholotto.Application.Interfaces;
using Pascholotto.Application.Rules;
using Pascholotto.Domain;
using Pascholotto.Infrastructure.Persistence;

namespace Pascholotto.Infrastructure.Services;

internal sealed class DebtService(PascholottoDbContext dbContext, TimeProvider timeProvider) : IDebtService
{
    public async Task<DebtCalculationResponse> CalculateAsync(Guid contractId, Guid operatorId, DebtCalculationRequest request, CancellationToken cancellationToken)
    {
        var contract = await dbContext.Contracts
            .Include(item => item.Installments)
            .SingleOrDefaultAsync(item => item.Id == contractId && item.Portfolio == "Banco Pascholotto", cancellationToken);

        if (contract is null)
        {
            throw new NotFoundException("Contract was not found.");
        }

        var today = DateOnly.FromDateTime(timeProvider.GetUtcNow().UtcDateTime);
        var calculationDate = request.CalculationDate ?? today;
        ValidateCalculationDate(calculationDate, today);

        var snapshots = contract.Installments
            .Where(item => item.Status is InstallmentStatus.Open or InstallmentStatus.Overdue)
            .Select(item => new InstallmentDebtSnapshot(
                item.Id,
                item.Number,
                item.DueDate,
                item.PrincipalAmount - item.PaidAmount))
            .ToList();

        var result = DebtCalculationPolicy.Calculate(calculationDate, snapshots);
        var createdAt = timeProvider.GetUtcNow().UtcDateTime;
        var calculation = new DebtCalculation
        {
            Id = Guid.NewGuid(),
            ContractId = contractId,
            PerformedByUserId = operatorId,
            CalculationDate = calculationDate,
            TotalPrincipal = result.TotalPrincipal,
            TotalPenalty = result.TotalPenalty,
            TotalInterest = result.TotalInterest,
            TotalAmount = result.TotalAmount,
            CreatedAtUtc = createdAt,
            Items = result.Items.Select(item => new DebtCalculationItem
            {
                Id = Guid.NewGuid(),
                InstallmentId = item.InstallmentId,
                InstallmentNumber = item.InstallmentNumber,
                DueDate = item.DueDate,
                DaysOverdue = item.DaysOverdue,
                PrincipalAmount = item.PrincipalAmount,
                PenaltyAmount = item.PenaltyAmount,
                InterestAmount = item.InterestAmount,
                TotalAmount = item.TotalAmount
            }).ToList()
        };

        dbContext.DebtCalculations.Add(calculation);
        dbContext.AuditEvents.Add(new AuditEvent
        {
            Id = Guid.NewGuid(),
            ContractId = contractId,
            DebtCalculationId = calculation.Id,
            PerformedByUserId = operatorId,
            EventType = "DebtCalculated",
            PayloadJson = JsonSerializer.Serialize(new
            {
                calculation.TotalPrincipal,
                calculation.TotalPenalty,
                calculation.TotalInterest,
                calculation.TotalAmount,
                calculation.CalculationDate
            }),
            CreatedAtUtc = createdAt
        });

        await dbContext.SaveChangesAsync(cancellationToken);

        return new DebtCalculationResponse(
            calculation.Id,
            contractId,
            calculation.CalculationDate,
            calculation.TotalPrincipal,
            calculation.TotalPenalty,
            calculation.TotalInterest,
            calculation.TotalAmount,
            calculation.Items
                .OrderBy(item => item.InstallmentNumber)
                .Select(item => new DebtCalculationItemResponse(
                    item.InstallmentId,
                    item.InstallmentNumber,
                    item.DueDate,
                    item.DaysOverdue,
                    item.PrincipalAmount,
                    item.PenaltyAmount,
                    item.InterestAmount,
                    item.TotalAmount))
                .ToList());
    }

    private static void ValidateCalculationDate(DateOnly calculationDate, DateOnly today)
    {
        if (calculationDate < today)
        {
            throw new ValidationException("The calculation date cannot be in the past.");
        }
    }
}
