using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Pascholotto.Application.DTOs;
using Pascholotto.Application.Exceptions;
using Pascholotto.Application.Interfaces;
using Pascholotto.Application.Rules;
using Pascholotto.Domain;
using Pascholotto.Infrastructure.Persistence;

namespace Pascholotto.Infrastructure.Services;

internal sealed class AgreementService(
    PascholottoDbContext dbContext,
    TimeProvider timeProvider,
    BoletoCodeGenerator boletoCodeGenerator,
    IBoletoPdfGenerator boletoPdfGenerator) : IAgreementService
{
    public async Task<AgreementSimulationResponse> SimulateAsync(Guid contractId, AgreementSimulationRequest request, CancellationToken cancellationToken)
    {
        var contract = await dbContext.Contracts
            .AsNoTracking()
            .SingleOrDefaultAsync(item => item.Id == contractId && item.Portfolio == "Banco Pascholotto", cancellationToken);

        if (contract is null)
        {
            throw new NotFoundException("Contract was not found.");
        }

        var debtCalculation = await dbContext.DebtCalculations
            .AsNoTracking()
            .SingleOrDefaultAsync(item => item.Id == request.DebtCalculationId && item.ContractId == contractId, cancellationToken);

        if (debtCalculation is null)
        {
            throw new NotFoundException("Debt calculation was not found for this contract.");
        }

        await EnsureNoActiveAgreementAsync(contractId, cancellationToken);
        ValidateFirstDueDate(request.FirstDueDate);

        var plan = AgreementPlanPolicy.Build(
            debtCalculation.TotalAmount,
            request.InstallmentCount,
            request.DownPaymentAmount,
            request.FirstDueDate);

        return ToSimulationResponse(contractId, debtCalculation.Id, plan);
    }

    public async Task<AgreementDetailResponse> CreateAsync(Guid contractId, Guid operatorId, CreateAgreementRequest request, CancellationToken cancellationToken)
    {
        var contract = await dbContext.Contracts
            .SingleOrDefaultAsync(item => item.Id == contractId && item.Portfolio == "Banco Pascholotto", cancellationToken);

        if (contract is null)
        {
            throw new NotFoundException("Contract was not found.");
        }

        var debtCalculation = await dbContext.DebtCalculations
            .SingleOrDefaultAsync(item => item.Id == request.DebtCalculationId && item.ContractId == contractId, cancellationToken);

        if (debtCalculation is null)
        {
            throw new NotFoundException("Debt calculation was not found for this contract.");
        }

        await EnsureNoActiveAgreementAsync(contractId, cancellationToken);
        ValidateFirstDueDate(request.FirstDueDate);

        var plan = AgreementPlanPolicy.Build(
            debtCalculation.TotalAmount,
            request.InstallmentCount,
            request.DownPaymentAmount,
            request.FirstDueDate);

        await using var transaction = dbContext.Database.IsRelational()
            ? await dbContext.Database.BeginTransactionAsync(cancellationToken)
            : null;

        var now = timeProvider.GetUtcNow().UtcDateTime;
        var agreement = new Agreement
        {
            Id = Guid.NewGuid(),
            ContractId = contractId,
            DebtCalculationId = debtCalculation.Id,
            CreatedByUserId = operatorId,
            Status = AgreementStatus.Active,
            InstallmentCount = plan.InstallmentCount,
            FirstDueDate = plan.FirstDueDate,
            DownPaymentAmount = plan.DownPaymentAmount,
            FinancedAmount = plan.FinancedAmount,
            TotalAmount = plan.TotalAmount,
            CreatedAtUtc = now
        };

        foreach (var planInstallment in plan.Installments)
        {
            var agreementInstallment = new AgreementInstallment
            {
                Id = Guid.NewGuid(),
                AgreementId = agreement.Id,
                Number = planInstallment.Number,
                DueDate = planInstallment.DueDate,
                Amount = planInstallment.Amount,
                Status = AgreementInstallmentStatus.Pending
            };

            var boletoInfo = boletoCodeGenerator.Generate(
                contract.ContractNumber,
                agreement.Id,
                agreementInstallment.Number,
                agreementInstallment.Amount,
                agreementInstallment.DueDate);

            var pdf = boletoPdfGenerator.Generate(new BoletoPdfModel(
                contract.CustomerName,
                contract.CustomerDocument,
                contract.ContractNumber,
                agreement.Id,
                agreementInstallment.Number,
                agreementInstallment.Amount,
                agreementInstallment.DueDate,
                boletoInfo.DocumentNumber,
                boletoInfo.LineDigitable,
                boletoInfo.Barcode,
                now));

            agreement.Installments.Add(agreementInstallment);
            agreement.Boletos.Add(new BoletoDocument
            {
                Id = Guid.NewGuid(),
                AgreementId = agreement.Id,
                AgreementInstallmentId = agreementInstallment.Id,
                DocumentNumber = boletoInfo.DocumentNumber,
                PayerName = contract.CustomerName,
                PayerDocument = contract.CustomerDocument,
                LineDigitable = boletoInfo.LineDigitable,
                Barcode = boletoInfo.Barcode,
                PdfContent = pdf,
                GeneratedAtUtc = now
            });
        }

        dbContext.Agreements.Add(agreement);
        dbContext.AuditEvents.AddRange(
            new AuditEvent
            {
                Id = Guid.NewGuid(),
                ContractId = contractId,
                DebtCalculationId = debtCalculation.Id,
                AgreementId = agreement.Id,
                PerformedByUserId = operatorId,
                EventType = "AgreementCreated",
                PayloadJson = JsonSerializer.Serialize(new
                {
                    agreement.InstallmentCount,
                    agreement.DownPaymentAmount,
                    agreement.FinancedAmount,
                    agreement.TotalAmount,
                    agreement.FirstDueDate
                }),
                CreatedAtUtc = now
            },
            new AuditEvent
            {
                Id = Guid.NewGuid(),
                ContractId = contractId,
                AgreementId = agreement.Id,
                PerformedByUserId = operatorId,
                EventType = "BoletosGenerated",
                PayloadJson = JsonSerializer.Serialize(new
                {
                    Count = agreement.Boletos.Count,
                    agreement.TotalAmount
                }),
                CreatedAtUtc = now
            });

        await dbContext.SaveChangesAsync(cancellationToken);

        if (transaction is not null)
        {
            await transaction.CommitAsync(cancellationToken);
        }

        return await GetByIdAsync(agreement.Id, cancellationToken);
    }

    public async Task<AgreementDetailResponse> GetByIdAsync(Guid agreementId, CancellationToken cancellationToken)
    {
        var agreement = await dbContext.Agreements
            .AsNoTracking()
            .Include(item => item.Contract)
            .Include(item => item.Installments)
                .ThenInclude(item => item.BoletoDocument)
            .SingleOrDefaultAsync(item => item.Id == agreementId, cancellationToken);

        if (agreement is null || agreement.Contract is null)
        {
            throw new NotFoundException("Agreement was not found.");
        }

        var auditTrail = await dbContext.AuditEvents
            .AsNoTracking()
            .Where(item => item.AgreementId == agreementId)
            .Include(item => item.PerformedByUser)
            .OrderByDescending(item => item.CreatedAtUtc)
            .Select(item => new AuditEventResponse(
                item.Id,
                item.EventType,
                item.PerformedByUser != null ? item.PerformedByUser.DisplayName : "System",
                item.CreatedAtUtc,
                item.PayloadJson))
            .ToListAsync(cancellationToken);

        return new AgreementDetailResponse(
            agreement.Id,
            agreement.ContractId,
            agreement.Contract.ContractNumber,
            agreement.Contract.CustomerName,
            agreement.Contract.CustomerDocument,
            agreement.Status.ToString(),
            agreement.FirstDueDate,
            agreement.InstallmentCount,
            agreement.DownPaymentAmount,
            agreement.FinancedAmount,
            agreement.TotalAmount,
            agreement.CreatedAtUtc,
            agreement.Installments
                .OrderBy(item => item.Number)
                .Select(item => new AgreementInstallmentResponse(
                    item.Id,
                    item.Number,
                    item.DueDate,
                    item.Amount,
                    item.Status.ToString(),
                    item.BoletoDocument is null
                        ? null
                        : new BoletoSummaryResponse(
                            item.Id,
                            item.BoletoDocument.DocumentNumber,
                            item.BoletoDocument.LineDigitable,
                            item.BoletoDocument.Barcode,
                            item.BoletoDocument.GeneratedAtUtc)))
                .ToList(),
            auditTrail);
    }

    public async Task<IReadOnlyList<BoletoSummaryResponse>> GetBoletosAsync(Guid agreementId, CancellationToken cancellationToken)
    {
        var agreementExists = await dbContext.Agreements
            .AsNoTracking()
            .AnyAsync(item => item.Id == agreementId, cancellationToken);

        if (!agreementExists)
        {
            throw new NotFoundException("Agreement was not found.");
        }

        return await dbContext.BoletoDocuments
            .AsNoTracking()
            .Where(item => item.AgreementId == agreementId)
            .OrderBy(item => item.AgreementInstallment!.Number)
            .Select(item => new BoletoSummaryResponse(
                item.AgreementInstallmentId,
                item.DocumentNumber,
                item.LineDigitable,
                item.Barcode,
                item.GeneratedAtUtc))
            .ToListAsync(cancellationToken);
    }

    public async Task<(byte[] Content, string FileName)> DownloadBoletoAsync(Guid agreementId, Guid installmentId, CancellationToken cancellationToken)
    {
        var boleto = await dbContext.BoletoDocuments
            .AsNoTracking()
            .SingleOrDefaultAsync(
                item => item.AgreementId == agreementId && item.AgreementInstallmentId == installmentId,
                cancellationToken);

        if (boleto is null)
        {
            throw new NotFoundException("Boleto PDF was not found.");
        }

        return (boleto.PdfContent, $"{boleto.DocumentNumber}.pdf");
    }

    private async Task EnsureNoActiveAgreementAsync(Guid contractId, CancellationToken cancellationToken)
    {
        var hasActiveAgreement = await dbContext.Agreements
            .AsNoTracking()
            .AnyAsync(item => item.ContractId == contractId && item.Status == AgreementStatus.Active, cancellationToken);

        if (hasActiveAgreement)
        {
            throw new ValidationException("The contract already has an active agreement.");
        }
    }

    private void ValidateFirstDueDate(DateOnly firstDueDate)
    {
        var today = DateOnly.FromDateTime(timeProvider.GetUtcNow().UtcDateTime);
        if (firstDueDate < today.AddDays(7) || firstDueDate > today.AddDays(30))
        {
            throw new ValidationException("The first due date must be between D+7 and D+30.");
        }
    }

    private static AgreementSimulationResponse ToSimulationResponse(Guid contractId, Guid debtCalculationId, AgreementPlanResult plan)
    {
        return new AgreementSimulationResponse(
            contractId,
            debtCalculationId,
            plan.InstallmentCount,
            plan.TotalAmount,
            plan.DownPaymentAmount,
            plan.FinancedAmount,
            plan.FirstDueDate,
            plan.Installments
                .Select(item => new AgreementInstallmentPlanResponse(item.Number, item.DueDate, item.Amount, item.IsDownPayment))
                .ToList());
    }
}
