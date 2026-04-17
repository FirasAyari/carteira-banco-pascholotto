using Pascholotto.Application.DTOs;

namespace Pascholotto.Application.Interfaces;

public interface IAuthService
{
    Task<LoginResponse> LoginAsync(LoginRequest request, CancellationToken cancellationToken);
}
