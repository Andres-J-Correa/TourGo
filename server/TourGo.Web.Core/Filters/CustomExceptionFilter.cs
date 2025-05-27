using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using TourGo.Models.Requests;
using TourGo.Services.Interfaces;
using TourGo.Web.Models.Responses;

namespace TourGo.Web.Core.Filters
{
    public class CustomExceptionFilter : IExceptionFilter
    {
        private readonly IErrorLoggingService  _errorLoggingService;
        public CustomExceptionFilter(IErrorLoggingService errorLoggingService)
        {
            _errorLoggingService = errorLoggingService ?? throw new ArgumentNullException(nameof(errorLoggingService));
        }

        public void OnException(ExceptionContext context)
        {
            var request = context.HttpContext.Request;

            _errorLoggingService.LogError(new ErrorLogRequest
            {
                Message = context.Exception.Message,
                StackTrace = context.Exception.StackTrace ?? "",
                Source = context.Exception.Source ?? "",
                Path = request.Path,
                Method = request.Method
            });

            ErrorResponse errorResponse = new ErrorResponse();

            context.Result = new ObjectResult(errorResponse)
            {
                StatusCode = StatusCodes.Status500InternalServerError
            };

            context.ExceptionHandled = true;
        }
    }
}
