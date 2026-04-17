using Microsoft.EntityFrameworkCore;
using Pascholotto.Domain;
using Pascholotto.Infrastructure.Persistence;

namespace Pascholotto.Infrastructure.Services;

public sealed class DatabaseSeeder(
    PascholottoDbContext dbContext,
    PasswordHasher passwordHasher,
    TimeProvider timeProvider)
{
    public async Task SeedAsync()
    {
        if (!await dbContext.Users.AnyAsync())
        {
            dbContext.Users.Add(new User
            {
                Id = Guid.NewGuid(),
                Username = "operador",
                DisplayName = "Operador Pascholotto",
                PasswordHash = passwordHasher.Hash("Pascholotto123!"),
                Role = "Operator",
                CreatedAtUtc = timeProvider.GetUtcNow().UtcDateTime
            });
        }

        if (await dbContext.Contracts.AnyAsync())
        {
            await dbContext.SaveChangesAsync();
            return;
        }

        var createdAt = timeProvider.GetUtcNow().UtcDateTime;
        var contractA = new Contract
        {
            Id = Guid.NewGuid(),
            ContractNumber = "BP-2026-001",
            CustomerName = "Marina Costa",
            CustomerDocument = "12345678901",
            Portfolio = "Banco Pascholotto",
            Status = "Active",
            CreatedAtUtc = createdAt
        };

        var contractB = new Contract
        {
            Id = Guid.NewGuid(),
            ContractNumber = "BP-2026-002",
            CustomerName = "Carlos Souza",
            CustomerDocument = "98765432100",
            Portfolio = "Banco Pascholotto",
            Status = "Active",
            CreatedAtUtc = createdAt
        };

        dbContext.Contracts.AddRange(contractA, contractB);
        dbContext.Installments.AddRange(
            new Installment
            {
                Id = Guid.NewGuid(),
                ContractId = contractA.Id,
                Number = 1,
                DueDate = new DateOnly(2026, 1, 10),
                PrincipalAmount = 500m,
                PaidAmount = 0m,
                Status = InstallmentStatus.Overdue
            },
            new Installment
            {
                Id = Guid.NewGuid(),
                ContractId = contractA.Id,
                Number = 2,
                DueDate = new DateOnly(2026, 2, 10),
                PrincipalAmount = 500m,
                PaidAmount = 0m,
                Status = InstallmentStatus.Overdue
            },
            new Installment
            {
                Id = Guid.NewGuid(),
                ContractId = contractA.Id,
                Number = 3,
                DueDate = new DateOnly(2026, 5, 10),
                PrincipalAmount = 500m,
                PaidAmount = 0m,
                Status = InstallmentStatus.Open
            },
            new Installment
            {
                Id = Guid.NewGuid(),
                ContractId = contractA.Id,
                Number = 4,
                DueDate = new DateOnly(2026, 6, 10),
                PrincipalAmount = 500m,
                PaidAmount = 500m,
                Status = InstallmentStatus.Paid
            },
            new Installment
            {
                Id = Guid.NewGuid(),
                ContractId = contractB.Id,
                Number = 1,
                DueDate = new DateOnly(2026, 3, 15),
                PrincipalAmount = 720m,
                PaidAmount = 0m,
                Status = InstallmentStatus.Overdue
            },
            new Installment
            {
                Id = Guid.NewGuid(),
                ContractId = contractB.Id,
                Number = 2,
                DueDate = new DateOnly(2026, 4, 15),
                PrincipalAmount = 720m,
                PaidAmount = 0m,
                Status = InstallmentStatus.Open
            });

        await dbContext.SaveChangesAsync();
    }
}
