namespace Goalz.Core.DTOs;

public record StartGameResult(bool Success, string? Error = null)
{
    public static StartGameResult Ok()            => new(true);
    public static StartGameResult Fail(string r)  => new(false, r);
}
