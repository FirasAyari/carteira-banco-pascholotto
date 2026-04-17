using Microsoft.EntityFrameworkCore;
using Pascholotto.Application.DTOs;
using Pascholotto.Application.Exceptions;
using Pascholotto.Application.Interfaces;
using Pascholotto.Infrastructure.Persistence;

namespace Pascholotto.Infrastructure.Services;

internal sealed class AuthService(
    PascholottoDbContext dbContext,
    PasswordHasher passwordHasher,
    ITokenService tokenService) : IAuthService
{
    public async Task<LoginResponse> LoginAsync(LoginRequest request, CancellationToken cancellationToken)
    {
        var user = await dbContext.Users
            .AsNoTracking()
            .SingleOrDefaultAsync(item => item.Username == request.Username.Trim(), cancellationToken);

        if (user is null || !passwordHasher.Verify(request.Password, user.PasswordHash))
        {
            throw new AuthenticationException("Invalid credentials.");
        }

        var token = tokenService.Create(user);
        return new LoginResponse(
            token.Token,
            token.ExpiresAtUtc,
            new UserProfileResponse(user.Id, user.Username, user.DisplayName, user.Role));
    }
}
