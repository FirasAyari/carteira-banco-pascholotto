using Pascholotto.Domain;

namespace Pascholotto.Infrastructure.Services;

internal interface ITokenService
{
    (string Token, DateTime ExpiresAtUtc) Create(User user);
}
