using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;

namespace Pascholotto.Api.Controllers;

[ApiController]
public abstract class BaseApiController : ControllerBase
{
    protected Guid GetCurrentUserId()
    {
        var value = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return Guid.TryParse(value, out var userId)
            ? userId
            : throw new InvalidOperationException("Authenticated user id is missing.");
    }
}
