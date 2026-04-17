using Pascholotto.Application.Exceptions;

namespace Pascholotto.Api.Middleware;

public sealed class ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (AppException exception)
        {
            await WriteProblemAsync(context, exception, GetStatusCode(exception), logger);
        }
        catch (Exception exception)
        {
            await WriteProblemAsync(context, exception, StatusCodes.Status500InternalServerError, logger);
        }
    }

    private static async Task WriteProblemAsync(HttpContext context, Exception exception, int statusCode, ILogger logger)
    {
        logger.LogError(exception, "Request failed with status code {StatusCode}", statusCode);

        context.Response.StatusCode = statusCode;
        context.Response.ContentType = "application/json";

        await context.Response.WriteAsJsonAsync(new
        {
            title = "Request failed",
            status = statusCode,
            detail = exception.Message,
            traceId = context.TraceIdentifier
        });
    }

    private static int GetStatusCode(AppException exception) => exception switch
    {
        AuthenticationException => StatusCodes.Status401Unauthorized,
        NotFoundException => StatusCodes.Status404NotFound,
        ValidationException => StatusCodes.Status400BadRequest,
        _ => StatusCodes.Status400BadRequest
    };
}
