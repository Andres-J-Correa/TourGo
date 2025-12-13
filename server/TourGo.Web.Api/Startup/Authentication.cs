using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using System.Net;
using TourGo.Web.Core;
using TourGo.Web.Core.Services;

namespace TourGo.Web.StartUp
{
    public class Authentication
    {
        public static void ConfigureServices(IServiceCollection services, IConfiguration configuration)
        {
            SetUpCookieAuth(services, configuration);
        }

        public static void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            app.UseAuthentication();
            app.UseAuthorization();
        }

        private static void SetUpCookieAuth(IServiceCollection services, IConfiguration configuration)
        {

            SecurityConfig security = new SecurityConfig();
            JsonWebTokenConfig jsonWebTokenConfig = new JsonWebTokenConfig();

            configuration.GetSection("SecurityConfig").Bind(security);
            configuration.GetSection("JsonWebTokenConfig").Bind(jsonWebTokenConfig);

            CookieBuilder cookie = new CookieBuilder();
            cookie.Domain = security.AppDomain;
            cookie.Name = security.CookieName;
            cookie.HttpOnly = true;
            cookie.Path = "/";
            cookie.SameSite = SameSiteMode.None;
            cookie.SecurePolicy = CookieSecurePolicy.Always;
            cookie.MaxAge = TimeSpan.FromDays(security.CookieDays);

            // If you don't want the cookie to be automatically authenticated and assigned to
            // HttpContext.User, remove the CookieAuthenticationDefaults.AuthenticationScheme
            // parameter passed to AddAuthentication.
            services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
            .AddCookie(options =>
            {
                options.Cookie = cookie;
                options.SlidingExpiration = true;
                options.TicketDataFormat = new TokenSecureDataFormat(jsonWebTokenConfig, "Cookies", services.BuildServiceProvider().GetRequiredService<ILogger<TokenSecureDataFormat>>());
                options.AccessDeniedPath = "/unauthorized";
                options.LoginPath = "/login";
                options.LogoutPath = "/logout";
                options.Events = new CookieAuthenticationEvents();
                options.Events.OnRedirectToAccessDenied = RedirectContext;
                options.Events.OnRedirectToLogin = RedirectContext;
            });

            services.AddAuthorization(authorizeOptions =>
            {
                authorizeOptions.AddPolicy("defaultpolicy", b =>
                {
                    b.AddAuthenticationSchemes(CookieAuthenticationDefaults.AuthenticationScheme);
                    b.RequireAuthenticatedUser();
                });
            });
        }

        private static Task RedirectContext(RedirectContext<CookieAuthenticationOptions> context)
        {
            // If we need to treat ajx request differently this is where we do it. for now, it is the same.
            if (IsAjaxRequest(context.Request) || IsApi(context.Request) || IsHub(context.Request))
            {
                //context.Response.Headers["Location"] = context.RedirectUri;
                context.Response.StatusCode = (int)HttpStatusCode.Unauthorized;
            }
            else
            {
                context.Response.Headers["Location"] = context.RedirectUri;
                context.Response.StatusCode = (int)HttpStatusCode.TemporaryRedirect;
            }

            return Task.CompletedTask;
        }

        private static bool IsAjaxRequest(HttpRequest request)
        {
            if (!string.Equals(request.Query["X-Requested-With"], "XMLHttpRequest", StringComparison.Ordinal))
                return string.Equals(request.Headers["X-Requested-With"], "XMLHttpRequest", StringComparison.Ordinal);

            return true;
        }

        private static bool IsApi(HttpRequest request)
        {
            var path = request.Path.Value?.ToLower();
            return path != null && path.StartsWith("/api");

        }

        private static bool IsHub(HttpRequest request)
        {
            var path = request.Path.Value?.ToLower();
            return path != null && path.StartsWith("/hubs");
        }
    }
}