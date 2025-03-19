using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Authorization;
using TourGo.Web.Core.Filters;
using TourGo.Web.Models.Enums;
using TourGo.Web.Models.Responses;

namespace TourGo.Web.StartUp
{
    public abstract class MVC
    {
        public static void ConfigureServices(IServiceCollection services)
        {
            IMvcBuilder mvc = services.AddControllersWithViews(o =>
            {
                var policy = new AuthorizationPolicyBuilder()
                    .RequireAuthenticatedUser()
                    .Build();

                o.Filters.Add(new AuthorizeFilter(policy));
                o.Filters.Add(typeof(ModelBindAttribute));
            });

            Action<ApiBehaviorOptions> setUpApiBehavior = apiBehaviorOptions =>
            {
                apiBehaviorOptions.InvalidModelStateResponseFactory = ErrorResponseFactory;
            };
            mvc.ConfigureApiBehaviorOptions(setUpApiBehavior);
        }

        public static void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            //app.UseMvc();
        }

        private static BadRequestObjectResult ErrorResponseFactory(ActionContext arg)
        {
            ErrorResponse err = new ErrorResponse(arg.ModelState.Values
                        .SelectMany(e => e.Errors)
                        .Select(e => e.ErrorMessage));

            var result = new BadRequestObjectResult(err);

            result.ContentTypes.Add("application/json");

            return result;
        }
    }
}