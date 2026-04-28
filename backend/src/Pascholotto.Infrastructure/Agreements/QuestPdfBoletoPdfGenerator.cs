using System.Globalization;
using System.Text;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace Pascholotto.Infrastructure.Services;

internal sealed class QuestPdfBoletoPdfGenerator : IBoletoPdfGenerator
{
    public byte[] Generate(BoletoPdfModel model)
    {
        return Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(28);
                page.DefaultTextStyle(TextStyle.Default.FontFamily("Arial").FontSize(10));

                page.Header().Column(column =>
                {
                    column.Item().Text("Banco Pascholotto").FontSize(20).Bold();
                    column.Item().Text("Boleto de acordo").FontSize(12);
                    column.Item().PaddingTop(8).Text($"Linha digitavel: {model.LineDigitable}").Bold();
                });

                page.Content().Column(column =>
                {
                    column.Spacing(12);
                    column.Item().Border(1).Padding(12).Column(content =>
                    {
                        content.Spacing(6);
                        content.Item().Text("Cedente: Pascholotto Servicos Financeiros");
                        content.Item().Text($"Sacado: {model.CustomerName} ({model.CustomerDocument})");
                        content.Item().Text($"Contrato: {model.ContractNumber}");
                        content.Item().Text($"Acordo: {model.AgreementId}");
                        content.Item().Text($"Parcela: {model.InstallmentNumber:00}");
                        content.Item().Text($"Documento: {model.DocumentNumber}");
                        content.Item().Text($"Vencimento: {model.DueDate:dd/MM/yyyy}");
                        content.Item().Text($"Valor: {model.Amount.ToString("C", CultureInfo.GetCultureInfo("pt-BR"))}");
                    });

                    column.Item().Border(1).Padding(12).Column(content =>
                    {
                        content.Spacing(8);
                        content.Item().Text("Codigo de barras").Bold();
                        content.Item().Text(model.Barcode).FontFamily("Courier New").FontSize(14);
                        content.Item().Text(BuildBarcodeVisual(model.Barcode)).FontFamily("Courier New").FontSize(10);
                    });
                });

                page.Footer().AlignCenter().Text($"Gerado em {model.GeneratedAtUtc:dd/MM/yyyy HH:mm} UTC").FontSize(9);
            });
        }).GeneratePdf();
    }

    private static string BuildBarcodeVisual(string barcode)
    {
        var builder = new StringBuilder(barcode.Length * 2);
        foreach (var digit in barcode)
        {
            builder.Append((digit - '0') % 2 == 0 ? "||" : "|:");
        }

        return builder.ToString();
    }
}
