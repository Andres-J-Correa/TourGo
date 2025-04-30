using TourGo.Models.Requests;
using TourGo.Services.Interfaces;

namespace TourGo.Web.Api.Middleware
{
    public class ErrorLoggingMiddleware
    {
        private readonly RequestDelegate _next;

        public ErrorLoggingMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task Invoke(HttpContext context, IErrorLoggingService errorLoggingService)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {

                ErrorLogRequest error = new()
                {
                    Message = ex.Message,
                    StackTrace = ex.StackTrace ?? "",
                    Source = ex.Source ?? "",
                    Path = context.Request.Path,
                    Method = context.Request.Method

                };

                errorLoggingService.LogError(error);

                context.Response.StatusCode = 500;
                await context.Response.WriteAsync("An internal error occurred.");
            }
        }
    }

}
