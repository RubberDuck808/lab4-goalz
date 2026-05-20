using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Goalz.Core.Interfaces;
using Microsoft.IdentityModel.Tokens;

namespace Goalz.Api.Services
{
    public class JwtService : IJwtService
    {
        private readonly SymmetricSecurityKey _key;
        private readonly string _issuer;
        private readonly string _audience;

        public JwtService(IConfiguration config)
        {
            var secret = config["Jwt:Secret"]
                ?? throw new InvalidOperationException("Jwt:Secret is not configured. Set it via user-secrets or environment variable Jwt__Secret.");

            if (secret.Length < 32)
                throw new InvalidOperationException("Jwt:Secret must be at least 32 characters.");

            _key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
            _issuer   = config["Jwt:Issuer"]   ?? "goalz-api";
            _audience = config["Jwt:Audience"] ?? "goalz-mobile";
        }

        public string Generate(string username, string role)
        {
            var creds = new SigningCredentials(_key, SecurityAlgorithms.HmacSha256);
            var token = new JwtSecurityToken(
                issuer: _issuer,
                audience: _audience,
                claims:
                [
                    new Claim(JwtRegisteredClaimNames.Sub, username),
                    new Claim("role", role),
                ],
                expires: DateTime.UtcNow.AddHours(24),
                signingCredentials: creds
            );
            return new JwtSecurityTokenHandler().WriteToken(token);
        }

    }
}
