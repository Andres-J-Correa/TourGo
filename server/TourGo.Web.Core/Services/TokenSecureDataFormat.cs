using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;
using System.Text;

namespace TourGo.Web.Core.Services
{
    public class TokenSecureDataFormat : ISecureDataFormat<AuthenticationTicket>
    {
        private readonly string _secret;
        private readonly int _expirationDays;
        private readonly JsonWebTokenConfig _config;
        private readonly ILogger<TokenSecureDataFormat> _logger;

        public TokenSecureDataFormat(JsonWebTokenConfig config, string authSchema, ILogger<TokenSecureDataFormat> logger)
        {
            _secret = config.Secret;
            _expirationDays = config.ExpirationDays;
            _config = config;
            _logger = logger;
        }

        public string Protect(AuthenticationTicket data)
        {
            var tokenHandler = new JsonWebTokenHandler();
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Audience = _config.Audience,
                Issuer = _config.Issuer,
                Expires = DateTime.UtcNow.AddDays(_expirationDays),
                Subject = new ClaimsIdentity(data.Principal.Claims),
                SigningCredentials = GetSigningCredentials(_secret)
            };

            return tokenHandler.CreateToken(tokenDescriptor);
        }

        public string Protect(AuthenticationTicket data, string? purpose) => Protect(data);

        public AuthenticationTicket Unprotect(string protectedText) => UnprotectAsync(protectedText).GetAwaiter().GetResult();

        public AuthenticationTicket Unprotect(string? protectedText, string? purpose) => Unprotect(protectedText);

        private async Task<AuthenticationTicket> UnprotectAsync(string protectedText)
        {
            TokenValidationParameters tp = new TokenValidationParameters()
            {
                ValidIssuer = _config.Issuer,
                ValidAudience = _config.Audience,
                ClockSkew = TimeSpan.Zero,
                IssuerSigningKey = GetSymmetricSecurityKey(_secret),
                RequireExpirationTime = true,
                ValidateAudience = true,
                ValidateIssuer = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true
            };

            try
            {
                var tokenHandler = new JsonWebTokenHandler();
                var validationResult = await tokenHandler.ValidateTokenAsync(protectedText, tp);

                if (validationResult.IsValid)
                {
                    _logger.LogInformation("Cookie validation success");
                    var claimsPrincipal = validationResult.ClaimsIdentity;
                    var principal = new ClaimsPrincipal(claimsPrincipal);
                    return new AuthenticationTicket(principal, CookieAuthenticationDefaults.AuthenticationScheme);
                }
                else
                {
                    throw new SecurityTokenException("Token validation failed.");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Exception during token validation");
                throw;
            }
        }

        private SigningCredentials GetSigningCredentials(string tokenSecret)
        {
            SymmetricSecurityKey symmetricKey = GetSymmetricSecurityKey(tokenSecret);
            return new SigningCredentials(symmetricKey, SecurityAlgorithms.HmacSha256Signature);
        }

        private static SymmetricSecurityKey GetSymmetricSecurityKey(string jwtSecret)
        {
            return new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret));
        }
    }
}
