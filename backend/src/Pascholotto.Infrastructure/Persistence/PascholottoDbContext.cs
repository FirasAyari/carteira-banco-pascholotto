using Microsoft.EntityFrameworkCore;
using Pascholotto.Domain;

namespace Pascholotto.Infrastructure.Persistence;

public sealed class PascholottoDbContext(DbContextOptions<PascholottoDbContext> options) : DbContext(options)
{
    public DbSet<Agreement> Agreements => Set<Agreement>();
    public DbSet<AgreementInstallment> AgreementInstallments => Set<AgreementInstallment>();
    public DbSet<AuditEvent> AuditEvents => Set<AuditEvent>();
    public DbSet<BoletoDocument> BoletoDocuments => Set<BoletoDocument>();
    public DbSet<Contract> Contracts => Set<Contract>();
    public DbSet<DebtCalculation> DebtCalculations => Set<DebtCalculation>();
    public DbSet<DebtCalculationItem> DebtCalculationItems => Set<DebtCalculationItem>();
    public DbSet<Installment> Installments => Set<Installment>();
    public DbSet<User> Users => Set<User>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Contract>(entity =>
        {
            entity.ToTable("Contracts");
            entity.HasKey(item => item.Id);
            entity.Property(item => item.ContractNumber).HasMaxLength(50);
            entity.Property(item => item.CustomerName).HasMaxLength(120);
            entity.Property(item => item.CustomerDocument).HasMaxLength(20);
            entity.Property(item => item.Portfolio).HasMaxLength(80);
            entity.Property(item => item.Status).HasMaxLength(30);
            entity.HasIndex(item => item.ContractNumber).IsUnique();
        });

        modelBuilder.Entity<Installment>(entity =>
        {
            entity.ToTable("Installments");
            entity.HasKey(item => item.Id);
            entity.Property(item => item.PrincipalAmount).HasPrecision(18, 2);
            entity.Property(item => item.PaidAmount).HasPrecision(18, 2);
            entity.Property(item => item.Status).HasConversion<string>().HasMaxLength(20);
            entity.HasOne(item => item.Contract)
                .WithMany(item => item.Installments)
                .HasForeignKey(item => item.ContractId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.ToTable("Users");
            entity.HasKey(item => item.Id);
            entity.Property(item => item.Username).HasMaxLength(40);
            entity.Property(item => item.DisplayName).HasMaxLength(120);
            entity.Property(item => item.PasswordHash).HasMaxLength(256);
            entity.Property(item => item.Role).HasMaxLength(20);
            entity.HasIndex(item => item.Username).IsUnique();
        });

        modelBuilder.Entity<DebtCalculation>(entity =>
        {
            entity.ToTable("DebtCalculations");
            entity.HasKey(item => item.Id);
            entity.Property(item => item.TotalPrincipal).HasPrecision(18, 2);
            entity.Property(item => item.TotalPenalty).HasPrecision(18, 2);
            entity.Property(item => item.TotalInterest).HasPrecision(18, 2);
            entity.Property(item => item.TotalAmount).HasPrecision(18, 2);
            entity.HasOne(item => item.Contract)
                .WithMany(item => item.DebtCalculations)
                .HasForeignKey(item => item.ContractId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(item => item.PerformedByUser)
                .WithMany()
                .HasForeignKey(item => item.PerformedByUserId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<DebtCalculationItem>(entity =>
        {
            entity.ToTable("DebtCalculationItems");
            entity.HasKey(item => item.Id);
            entity.Property(item => item.PrincipalAmount).HasPrecision(18, 2);
            entity.Property(item => item.PenaltyAmount).HasPrecision(18, 2);
            entity.Property(item => item.InterestAmount).HasPrecision(18, 2);
            entity.Property(item => item.TotalAmount).HasPrecision(18, 2);
            entity.HasOne(item => item.DebtCalculation)
                .WithMany(item => item.Items)
                .HasForeignKey(item => item.DebtCalculationId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(item => item.Installment)
                .WithMany()
                .HasForeignKey(item => item.InstallmentId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Agreement>(entity =>
        {
            entity.ToTable("Agreements");
            entity.HasKey(item => item.Id);
            entity.Property(item => item.Status).HasConversion<string>().HasMaxLength(20);
            entity.Property(item => item.DownPaymentAmount).HasPrecision(18, 2);
            entity.Property(item => item.FinancedAmount).HasPrecision(18, 2);
            entity.Property(item => item.TotalAmount).HasPrecision(18, 2);
            entity.HasOne(item => item.Contract)
                .WithMany(item => item.Agreements)
                .HasForeignKey(item => item.ContractId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(item => item.DebtCalculation)
                .WithMany()
                .HasForeignKey(item => item.DebtCalculationId)
                .OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(item => item.CreatedByUser)
                .WithMany()
                .HasForeignKey(item => item.CreatedByUserId)
                .OnDelete(DeleteBehavior.Restrict);
            entity.HasIndex(item => new { item.ContractId, item.Status });
        });

        modelBuilder.Entity<AgreementInstallment>(entity =>
        {
            entity.ToTable("AgreementInstallments");
            entity.HasKey(item => item.Id);
            entity.Property(item => item.Amount).HasPrecision(18, 2);
            entity.Property(item => item.Status).HasConversion<string>().HasMaxLength(20);
            entity.HasOne(item => item.Agreement)
                .WithMany(item => item.Installments)
                .HasForeignKey(item => item.AgreementId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<BoletoDocument>(entity =>
        {
            entity.ToTable("BoletoDocuments");
            entity.HasKey(item => item.Id);
            entity.Property(item => item.DocumentNumber).HasMaxLength(50);
            entity.Property(item => item.PayerName).HasMaxLength(120);
            entity.Property(item => item.PayerDocument).HasMaxLength(20);
            entity.Property(item => item.LineDigitable).HasMaxLength(80);
            entity.Property(item => item.Barcode).HasMaxLength(60);
            entity.HasOne(item => item.Agreement)
                .WithMany(item => item.Boletos)
                .HasForeignKey(item => item.AgreementId)
                .OnDelete(DeleteBehavior.NoAction);
            entity.HasOne(item => item.AgreementInstallment)
                .WithOne(item => item.BoletoDocument)
                .HasForeignKey<BoletoDocument>(item => item.AgreementInstallmentId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasIndex(item => item.DocumentNumber).IsUnique();
        });

        modelBuilder.Entity<AuditEvent>(entity =>
        {
            entity.ToTable("AuditEvents");
            entity.HasKey(item => item.Id);
            entity.Property(item => item.EventType).HasMaxLength(60);
            entity.Property(item => item.PayloadJson).HasMaxLength(4000);
            entity.HasOne(item => item.PerformedByUser)
                .WithMany()
                .HasForeignKey(item => item.PerformedByUserId)
                .OnDelete(DeleteBehavior.Restrict);
            entity.HasIndex(item => item.ContractId);
            entity.HasIndex(item => item.AgreementId);
            entity.HasIndex(item => item.DebtCalculationId);
        });
    }
}
