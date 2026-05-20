using System.Security.Cryptography;

namespace Goalz.Core.Utils
{
    public static class CodeGenerator
    {
        public static long GeneratePartyCode()
        {
            return RandomNumberGenerator.GetInt32(100000, 999999);
        }
    }
}
