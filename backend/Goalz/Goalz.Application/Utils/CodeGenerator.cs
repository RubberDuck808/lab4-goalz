namespace Goalz.Core.Utils
{
    public static class CodeGenerator
    {
    public static long GeneratePartyCode()
    {
        var random = new Random();
        return random.NextInt64(100000, 999999);
    }
    }
}
