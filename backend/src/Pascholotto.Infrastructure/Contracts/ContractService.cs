using Microsoft.EntityFrameworkCore;
using Pascholotto.Application.DTOs;
using Pascholotto.Application.Exceptions;
using Pascholotto.Application.Interfaces;
using Pascholotto.Domain;
using Pascholotto.Infrastructure.Persistence;

namespace Pascholotto.Infrastructure.Services;

internal sealed class ContractService(PascholottoDbContext dbContext) : IContractService
{
    public async Task<IReadOnlyList<ContractSummaryResponse>> SearchAsync(string? document, string? contractNumber, CancellationToken cancellationToken)
    {
        var query = dbContext.Contracts
            .AsNoTracking()
            .Include(item => item.Installments)
            .Where(item => item.Portfolio == "Banco Pascholotto");

        if (!string.IsNullOrWhiteSpace(document))
        {
            query = query.Where(item => item.CustomerDocument.Contains(document.Trim()));
        }

        if (!string.IsNullOrWhiteSpace(contractNumber))
        {
            query = query.Where(item => item.ContractNumber.Contains(contractNumber.Trim()));
        }

        var contracts = await query
            .OrderBy(item => item.CustomerName)
            .Take(50)
            .ToListAsync(cancellationToken);

        return contracts
            .Select(item => new ContractSummaryResponse(
                item.Id,
                item.ContractNumber,
                item.CustomerName,
                item.CustomerDocument,
                item.Portfolio,
                item.Status,
                item.Installments
                    .Where(installment => installment.Status != InstallmentStatus.Paid)
                    .Select(installment => installment.PrincipalAmount - installment.PaidAmount)
                    .DefaultIfEmpty(0m)
                    .Sum(),
                item.Installments.Count(installment => installment.Status != InstallmentStatus.Paid)))
            .ToList();
    }

    public async Task<ContractDetailResponse> GetByIdAsync(Guid contractId, CancellationToken cancellationToken)
    {
        var contract = await dbContext.Contracts
            .AsNoTracking()
            .Include(item => item.Installments)
            .Include(item => item.Agreements)
            .SingleOrDefaultAsync(item => item.Id == contractId && item.Portfolio == "Banco Pascholotto", cancellationToken);

        if (contract is null)
        {
            throw new NotFoundException("Contract was not found.");
        }

        return new ContractDetailResponse(
            contract.Id,
            contract.ContractNumber,
            contract.CustomerName,
            contract.CustomerDocument,
            contract.Portfolio,
            contract.Status,
            contract.Installments
                .Where(item => item.Status != InstallmentStatus.Paid)
                .Sum(item => item.PrincipalAmount - item.PaidAmount),
            contract.Agreements.FirstOrDefault(item => item.Status == AgreementStatus.Active)?.Id,
            contract.Installments
                .OrderBy(item => item.Number)
                .Select(item => new InstallmentResponse(
                    item.Id,
                    item.Number,
                    item.DueDate,
                    item.PrincipalAmount,
                    item.PaidAmount,
                    item.Status.ToString()))
                .ToList());
    }
}
