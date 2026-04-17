namespace Pascholotto.Application.Configuration;

public sealed class JwtOptions
{
    public const string SectionName = "Jwt";

    public string Issuer { get; set; } = "Pascholotto.Api";
    public string Audience { get; set; } = "Pascholotto.Frontend";
    public string SigningKey { get; set; } = "super-secret-development-key-change-me-now";
    public int ExpirationMinutes { get; set; } = 120;
}
