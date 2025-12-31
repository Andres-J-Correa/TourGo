using System.Diagnostics;
using System.Security.Claims;

namespace TourGo.Web.Api.Middleware
{
    public class UserTelemetryMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<UserTelemetryMiddleware> _logger;

        public UserTelemetryMiddleware(RequestDelegate next, ILogger<UserTelemetryMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {

            var userId = context.User.FindFirst(ClaimTypes.Sid)?.Value ?? "Anonymous";

            using (_logger.BeginScope(new Dictionary<string, object>
            {
                ["UserId"] = userId
            }))
            {
                await _next(context);
            }
        }
    }
}
