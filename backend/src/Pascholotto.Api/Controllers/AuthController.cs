using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Pascholotto.Application.DTOs;
using Pascholotto.Application.Interfaces;

namespace Pascholotto.Api.Controllers;

[AllowAnonymous]
[Route("api/auth")]
public sealed class AuthController(IAuthService authService) : BaseApiController
{
    [HttpPost("login")]
    [ProducesResponseType<LoginResponse>(StatusCodes.Status200OK)]
    public async Task<ActionResult<LoginResponse>> Login([FromBody] LoginRequest request, CancellationToken cancellationToken)
    {
        var response = await authService.LoginAsync(request, cancellationToken);
        return Ok(response);
    }
}
