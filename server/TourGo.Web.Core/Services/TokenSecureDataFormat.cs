using Microsoft.AspNetCore.Authentication;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace TourGo.Web.Core.Services
{
    public class TokenSecureDataFormat : ISecureDataFormat<AuthenticationTicket>, ISecureDataFormat<AuthenticationProperties>
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

        public string Protect(AuthenticationProperties data)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_secret);
            SecurityTokenDescriptor tokenDescriptor = new SecurityTokenDescriptor
            {
                Audience = _config.Audience,

                Expires = DateTime.UtcNow.AddDays(_expirationDays),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };
            // Subject = data.Principal. ClaimsIdentity
            tokenDescriptor.Issuer = _config.Issuer;
            var claims = data.Items.Select(a => new Claim(a.Key, a.Value));

            tokenDescriptor.Subject = new ClaimsIdentity(claims);



            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        public string Protect(AuthenticationProperties data, string purpose)
        {
            return Protect(data);
        }

        AuthenticationProperties ISecureDataFormat<AuthenticationProperties>.Unprotect(string protectedText)
        {
            
            JwtSecurityTokenHandler tokenHandler = new JwtSecurityTokenHandler();

            TokenValidationParameters tp = new TokenValidationParameters();

            tp.ValidIssuer = _config.Issuer;
            tp.ValidAudience = _config.Audience;
            tp.ClockSkew = TimeSpan.FromMinutes(0);
            tp.RequireExpirationTime = true;
            tp.IssuerSigningKey = GetSymmetricSecurityKey(_secret);

            SecurityToken token = null;
            //AuthenticationTicket auth = null;
            JwtSecurityToken unvalidatedToken = null;
            AuthenticationProperties props = null;
            try
            {
                unvalidatedToken = tokenHandler.ReadJwtToken(protectedText);
                ClaimsPrincipal claimsP = tokenHandler.ValidateToken(protectedText, tp, out token);

                var kvp = claimsP.Claims.Select((sc => new KeyValuePair<string, string>(sc.Type, sc.Value)));

                Dictionary<string, string> dict = new Dictionary<string, string>(kvp);

                props = new AuthenticationProperties(dict);


            }
            catch (Exception ex)
            {
                //TODO: Replace this with proper logging
                // If you are getting an exception here delete your aut cookie and log in again.
                Console.WriteLine(ex.ToString());

                //throw;
            }

            //props.Items.TryGetValue()

            return props;
        }

        AuthenticationProperties ISecureDataFormat<AuthenticationProperties>.Unprotect(string protectedText, string purpose)
        {
            return (this as ISecureDataFormat<AuthenticationProperties>).Unprotect(protectedText);
        }

        #region - ISecureDataFormat<AuthenticationTicket> -
        public string Protect(AuthenticationTicket data)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_secret);
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Audience = _config.Audience,

                Expires = DateTime.UtcNow.AddDays(_expirationDays),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };
            // Subject = data.Principal. ClaimsIdentity
            tokenDescriptor.Issuer = _config.Issuer;
            tokenDescriptor.Subject = new ClaimsIdentity(data.Principal.Claims);

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        public string Protect(AuthenticationTicket data, string purpose)
        {
            return Protect(data);
        }

        public AuthenticationTicket Unprotect(string protectedText)
        {
            JwtSecurityTokenHandler tokenHandler = new JwtSecurityTokenHandler();

            TokenValidationParameters tp = new TokenValidationParameters();

            tp.ValidIssuer = _config.Issuer;
            tp.ValidAudience = _config.Audience;
            tp.ClockSkew = TimeSpan.FromMinutes(0);
            tp.RequireExpirationTime = true;
            tp.IssuerSigningKey = GetSymmetricSecurityKey(_secret);

            SecurityToken token = null;
            AuthenticationTicket auth = null;
            JwtSecurityToken unvalidatedToken = null;

            try
            {
                unvalidatedToken = tokenHandler.ReadJwtToken(protectedText);
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

        public AuthenticationTicket Unprotect(string protectedText, string purpose)
        {
            return Unprotect(protectedText);
        }

        private SigningCredentials GetSigningCredentials(string tokenSecret)
        {
            SymmetricSecurityKey symmetricKey = GetSymmetricSecurityKey(tokenSecret);
            var signingCredentials = new SigningCredentials(symmetricKey, SecurityAlgorithms.HmacSha256);

            return signingCredentials;
        }

        private SymmetricSecurityKey GetSymmetricSecurityKey(string jwtSecret)
        {
            return new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret));
        }



        #endregion


    }
}