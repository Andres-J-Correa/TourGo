using Microsoft.AspNetCore.Authentication.Cookies;

namespace TourGo.Web.Core.Services
{
    internal static class AuthenticationDefaults
    {
        public const string AuthenticationScheme = CookieAuthenticationDefaults.AuthenticationScheme;
    }
}