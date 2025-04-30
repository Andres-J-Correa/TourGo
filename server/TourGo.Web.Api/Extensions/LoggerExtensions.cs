using TourGo.Models.Requests;
using TourGo.Services.Interfaces;

namespace TourGo.Web.Api.Extensions
{
    public static class LoggerExtensions
    {
        public static void LogErrorWithDb(this ILogger logger, Exception ex, IErrorLoggingService errorLogService, HttpContext context)
        {
            logger.LogError(ex, ex.Message);

            errorLogService.LogError(new ErrorLogRequest
            {
                Message = ex.Message,
                StackTrace = ex.StackTrace ?? "",
                Source = ex.Source ?? "",
                Path = context.Request.Path,
                Method = context.Request.Method
            });
        }
    }
}
