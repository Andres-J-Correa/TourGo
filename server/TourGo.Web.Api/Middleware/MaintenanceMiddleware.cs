namespace TourGo.Web.Api.Middleware
{
    public class MaintenanceMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly IConfiguration _configuration;

        public MaintenanceMiddleware(RequestDelegate next, IConfiguration configuration)
        {
            _next = next;
            _configuration = configuration;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            bool isMaintenanceMode = _configuration.GetValue<bool>("MaintenanceMode");

            if (isMaintenanceMode)
            {
                context.Response.StatusCode = StatusCodes.Status503ServiceUnavailable;
                context.Response.ContentType = "text/html";

                await context.Response.WriteAsync(@"
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Under Maintenance</title>
                </head>
                <body>
                    <h1>Website Under Maintenance</h1>
                    <p>We are performing scheduled maintenance. Please try again later.</p>
                </body>
                </html>
                ");

                return;
            }

            await _next(context);
        }
    }
}
