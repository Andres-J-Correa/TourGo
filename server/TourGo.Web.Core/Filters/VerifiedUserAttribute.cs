using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace TourGo.Web.Core.Filters
{
    public class VerifiedUserAttribute : TypeFilterAttribute
    {

        public VerifiedUserAttribute()
            : base(typeof(VerifiedUserFilterImplementation))
        {
        }

        public class VerifiedUserFilterImplementation : IAsyncActionFilter
        {
            public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
            {
                if (context.HttpContext.User.Identity != null && context.HttpContext.User.Identity.IsAuthenticated &&
                    context.HttpContext.User.Claims.Any(c => c.Type == "https://tourgo.site/claims/isverified" && string.Equals(c.Value, "true", StringComparison.OrdinalIgnoreCase)))
                {
                    await next();
                }
                else
                {
                    context.Result = new StatusCodeResult(StatusCodes.Status403Forbidden);
                }
            }
        }
    }
}
