namespace Pascholotto.Application.DTOs;

public sealed record LoginRequest(string Username, string Password);

public sealed record UserProfileResponse(Guid Id, string Username, string DisplayName, string Role);

public sealed record LoginResponse(string AccessToken, DateTime ExpiresAtUtc, UserProfileResponse User);
