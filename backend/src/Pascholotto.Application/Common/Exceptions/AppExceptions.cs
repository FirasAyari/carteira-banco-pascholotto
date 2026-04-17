namespace Pascholotto.Application.Exceptions;

public abstract class AppException(string message) : Exception(message);

public sealed class NotFoundException(string message) : AppException(message);

public sealed class ValidationException(string message) : AppException(message);

public sealed class AuthenticationException(string message) : AppException(message);
