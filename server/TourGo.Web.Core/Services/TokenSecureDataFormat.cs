using Microsoft.AspNetCore.Authentication;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace TourGo.Web.Core.Services
{
    public class TokenSecureDataFormat : ISecureDataFormat<AuthenticationTicket> 
    {
        private readonly string _secret;
        private readonly int _expirationDays;
        private readonly JsonWebTokenConfig _config;
        private readonly string _authSchema;

        public TokenSecureDataFormat(JsonWebTokenConfig config, string authSchema)
        {
            _secret = config.Secret;
            _expirationDays = config.ExpirationDays;
            _config = config;
            _authSchema = authSchema;
        }

        public string Protect(AuthenticationTicket data)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_secret);
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Audience = _config.Audience,
                Issuer = _config.Issuer,
                Expires = DateTime.UtcNow.AddDays(_expirationDays),
                Subject = new ClaimsIdentity(data.Principal.Claims),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        public string Protect(AuthenticationTicket data, string ? purpose)
        {
            return Protect(data);
        }

        public AuthenticationTicket Unprotect(string protectedText)
        {
            TokenValidationParameters tp = new TokenValidationParameters()
            {
                ValidIssuer = _config.Issuer,
                ValidAudience = _config.Audience,
                ClockSkew = TimeSpan.FromMinutes(5),
                IssuerSigningKey = GetSymmetricSecurityKey(_secret),
                RequireExpirationTime = true,
                ValidateAudience = true,
                ValidateIssuer = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true
            };

            SecurityToken token = null;
            AuthenticationTicket auth = null;

            try
            {
                JwtSecurityTokenHandler tokenHandler = new JwtSecurityTokenHandler();
                JwtSecurityToken unvalidatedToken = tokenHandler.ReadJwtToken(protectedText);
                ClaimsPrincipal claimsP = tokenHandler.ValidateToken(protectedText, tp, out token);

                auth = new AuthenticationTicket(claimsP, _authSchema);

            }
            catch (Exception ex)
            {
                //TODO: Replace this with proper logging
                // If you are getting an exception here delete your aut cookie and log in again.
                Console.WriteLine(ex.ToString());

                throw;
            }
            return auth;
        }

        public AuthenticationTicket Unprotect(string? protectedText, string? purpose)
        {
            return Unprotect(protectedText);
        }

        private SigningCredentials GetSigningCredentials(string tokenSecret)
        {
            SymmetricSecurityKey symmetricKey = GetSymmetricSecurityKey(tokenSecret);
            var signingCredentials = new SigningCredentials(symmetricKey, SecurityAlgorithms.HmacSha256);

            return signingCredentials;
        }

        private static SymmetricSecurityKey GetSymmetricSecurityKey(string jwtSecret)
        {
            return new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret));
        }

    }
}