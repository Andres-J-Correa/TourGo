using Microsoft.AspNetCore.Mvc;

namespace TourGo.Web.StartUp
{
    public class Cors
    {
        public static void ConfigureServices(IServiceCollection services)
        {
            services.AddCors(options =>
            {
                options.AddPolicy("AllowSpecificOrigins", builder =>
                {
                    builder
                        .WithOrigins(
                            "http://localhost:3000",          // React dev server
                            "https://tourgo.site",        // Production frontend
                            "https://tourgo.space"        // Stage frontend
                        )
                        .AllowAnyHeader()
                        .AllowAnyMethod()
                        .AllowCredentials()
                        .WithExposedHeaders("Content-Disposition"); 
                    ;
                });
            });

            var optison = new MvcOptions();

            services.Configure<MvcOptions>(options =>
            {
                //options.Filters.Add(new CorsAuthorizationFilterFactory("AllowAllCors"));
            });
        }

        public static void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            app.UseCors("AllowSpecificOrigins");
        }
    }
}