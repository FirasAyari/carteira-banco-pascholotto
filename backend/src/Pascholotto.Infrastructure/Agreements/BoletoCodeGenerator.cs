using System.Globalization;

namespace Pascholotto.Infrastructure.Services;

internal sealed class BoletoCodeGenerator
{
    public BoletoInfo Generate(string contractNumber, Guid agreementId, int installmentNumber, decimal amount, DateOnly dueDate)
    {
        var numericContract = DigitsOnly(contractNumber).PadLeft(10, '0');
        var agreementDigits = new string(agreementId.ToString("N").Where(char.IsDigit).ToArray()).PadLeft(15, '0');
        var dueFactor = ((dueDate.DayNumber - new DateOnly(2025, 1, 1).DayNumber) % 10000 + 10000) % 10000;
        var amountText = ((long)(amount * 100)).ToString("0000000000", CultureInfo.InvariantCulture);
        var baseBarcode = $"3419{dueFactor:0000}{amountText}{numericContract[..10]}{agreementDigits[..15]}{installmentNumber:00}";
        var normalizedBase = baseBarcode[..43];
        var checkDigit = Mod11(normalizedBase);
        var barcode = $"{normalizedBase[..4]}{checkDigit}{normalizedBase[4..]}";
        var lineDigitable = BuildLineDigitable(barcode);
        var documentNumber = $"BOL-{contractNumber}-{installmentNumber:00}";

        return new BoletoInfo(documentNumber, lineDigitable, barcode);
    }

    private static string BuildLineDigitable(string barcode)
    {
        var field1 = AppendMod10(barcode[..9]);
        var field2 = AppendMod10(barcode.Substring(9, 10));
        var field3 = AppendMod10(barcode.Substring(19, 10));
        var field4 = barcode.Substring(29, 5);
        var field5 = barcode.Substring(34, 10);

        return $"{field1[..5]}.{field1[5..]} {field2[..5]}.{field2[5..]} {field3[..5]}.{field3[5..]} {field4} {field5}";
    }

    private static string AppendMod10(string value) => value + Mod10(value);

    private static int Mod10(string value)
    {
        var sum = 0;
        var multiplier = 2;

        for (var index = value.Length - 1; index >= 0; index--)
        {
            var total = (value[index] - '0') * multiplier;
            sum += total > 9 ? (total / 10) + (total % 10) : total;
            multiplier = multiplier == 2 ? 1 : 2;
        }

        var remainder = sum % 10;
        return remainder == 0 ? 0 : 10 - remainder;
    }

    private static int Mod11(string value)
    {
        var sum = 0;
        var multiplier = 2;

        for (var index = value.Length - 1; index >= 0; index--)
        {
            sum += (value[index] - '0') * multiplier;
            multiplier = multiplier == 9 ? 2 : multiplier + 1;
        }

        var remainder = sum % 11;
        var digit = 11 - remainder;
        return digit is 0 or 10 or 11 ? 1 : digit;
    }

    private static string DigitsOnly(string value) => new(value.Where(char.IsDigit).ToArray());
}
