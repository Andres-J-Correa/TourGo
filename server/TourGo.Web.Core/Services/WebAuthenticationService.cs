using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Http;
using System.Reflection;
using System.Security.Claims;
using System.Security.Principal;
using TourGo.Models;
using TourGo.Services;
using TourGo.Models.Domain.Users;
using TourGo.Models.Interfaces;

namespace TourGo.Web.Core.Services
{
    public class WebAuthenticationService : IWebAuthenticationService<int>
    {
        private readonly static string _title = null;
        private IHttpContextAccessor _contextAccessor;

        static WebAuthenticationService()
        {
            _title = GetApplicationName();
        }

        public WebAuthenticationService(IHttpContextAccessor httpContext)
        {
            this._contextAccessor = httpContext;
        }

        public async Task LogInAsync(IUserAuthData user, params Claim[] extraClaims)
        {
            ClaimsIdentity identity = ExtractClaims(user, extraClaims);

            AuthenticationProperties props = new AuthenticationProperties
            {
                IsPersistent = true,
                IssuedUtc = DateTime.UtcNow,
                ExpiresUtc = DateTime.UtcNow.AddDays(60),
                AllowRefresh = true
            };

            ClaimsPrincipal principal = new ClaimsPrincipal(identity);

            await _contextAccessor.HttpContext
                .SignInAsync(AuthenticationDefaults.AuthenticationScheme, principal, props);
        }

        public async Task LogInAsyncV2(IUserAuthDataV2 user, params Claim[] extraClaims)
        {
            ClaimsIdentity identity = ExtractClaims(user, extraClaims);
            AuthenticationProperties props = new AuthenticationProperties
            {
                IsPersistent = true,
                IssuedUtc = DateTime.UtcNow,
                ExpiresUtc = DateTime.UtcNow.AddDays(60),
                AllowRefresh = true
            };
            ClaimsPrincipal principal = new ClaimsPrincipal(identity);
            await _contextAccessor.HttpContext
                .SignInAsync(AuthenticationDefaults.AuthenticationScheme, principal, props);
        }
        public static ClaimsIdentity ExtractClaims(IUserAuthDataV2 user, Claim[] extraClaims, string originalIssuer = null)
        {
            ClaimsIdentity identity = new ClaimsIdentity(
                CookieAuthenticationDefaults.AuthenticationScheme,
                ClaimsIdentity.DefaultNameClaimType,
                ClaimsIdentity.DefaultRoleClaimType);

            // Only store non-PII claims
            identity.AddClaim(new Claim(ClaimTypes.NameIdentifier, user.Id.ToString(), ClaimValueTypes.String, _title, originalIssuer));
            identity.AddClaim(new Claim("https://tourgo.site/claims/isverified", user.IsVerified.ToString(), ClaimValueTypes.Boolean, _title, originalIssuer));

            if (user.Roles != null && user.Roles.Any())
            {
                foreach (string singleRole in user.Roles)
                {
                    identity.AddClaim(new Claim(ClaimsIdentity.DefaultRoleClaimType, singleRole, ClaimValueTypes.String, _title, originalIssuer));
                }
            }

            if (extraClaims != null)
            {
                foreach (var claim in extraClaims)
                {
                    var existingClaims = identity.FindAll(claim.Type).ToList();
                    foreach (var existing in existingClaims)
                    {
                        identity.RemoveClaim(existing);
                    }
                    identity.AddClaim(claim);
                }
            }

            return identity;
        }

        public async Task LogOutAsync()
        {
            await _contextAccessor.HttpContext.SignOutAsync(AuthenticationDefaults.AuthenticationScheme);
        }

        public bool IsLoggedIn()
        {
            return _contextAccessor.HttpContext.User.Identity.IsAuthenticated;
        }

        /// <summary>
        /// Only call this when the user IsLoggedIn
        /// </summary>
        /// <returns></returns>
        public int GetCurrentUserId()
        {
            return GetId(_contextAccessor.HttpContext.User.Identity).Value;
        }

        public IUserAuthData GetCurrentUser()
        {
            IUserAuthData baseUser = null;

            if (IsLoggedIn())
            {
                ClaimsIdentity claimsIdentity = _contextAccessor.HttpContext.User.Identity as ClaimsIdentity;

                if (claimsIdentity != null)
                {
                    baseUser = ExtractUser(claimsIdentity);
                }
            }

            return baseUser;
        }

        private static UserBase ExtractUser(ClaimsIdentity identity)
        {
            UserBase baseUser = new UserBase();
            List<string> roles = null;

            foreach (var claim in identity.Claims)
            {
                switch (claim.Type)
                {
                    case ClaimTypes.NameIdentifier:
                        int id = 0;

                        if (Int32.TryParse(claim.Value, out id))
                        {
                            baseUser.Id = id;
                        }

                        break;

                    case ClaimTypes.Name:
                        baseUser.FirstName = claim.Value;
                        break;

                    case ClaimTypes.Surname:
                        baseUser.LastName = claim.Value;
                        break;

                    case ClaimTypes.Email:
                        baseUser.Email = claim.Value;
                        break;

                    case ClaimTypes.Role:
                        if (roles == null)
                        {
                            roles = new List<string>();
                        }

                        roles.Add(claim.Value);

                        break;

                    case "https://tourgo.site/claims/isverified":
                        bool isVerified;
                        if (Boolean.TryParse(claim.Value, out isVerified))
                        {
                            baseUser.IsVerified = isVerified;
                        }
                        break;

                    case ClaimTypes.MobilePhone:
                        baseUser.Phone = claim.Value;
                        break;

                    default:

                        break;
                }
            }

            baseUser.Roles = roles;

            return baseUser;
        }

        private static int? GetId(IIdentity identity)
        {
            if (identity == null) { throw new ArgumentNullException("identity"); }
            if (!identity.IsAuthenticated) { throw new InvalidOperationException("The current IIdentity is not Authenticated"); }
            ClaimsIdentity ci = identity as ClaimsIdentity;

            int idParsed = 0;

            if (ci != null)
            {
                Claim claim = ci.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);

                if (claim != null && Int32.TryParse(claim.Value, out idParsed))
                {
                    return idParsed;
                }
            }
            return null;
        }

        private static string GetApplicationName()
        {
            var entryAssembly = Assembly.GetExecutingAssembly();

            var titleAttribute = entryAssembly.GetCustomAttributes(typeof(AssemblyTitleAttribute), false).FirstOrDefault() as AssemblyTitleAttribute;

            return titleAttribute == null ? entryAssembly.GetName().Name : titleAttribute.Title;
        }
    }
}