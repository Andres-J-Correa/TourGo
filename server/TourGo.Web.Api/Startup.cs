using TourGo.Web.Core;
using TourGo.Web.StartUp;

namespace TourGo.Web.Api
{
    public class Startup
    {
        public IConfiguration Configuration { get; }

        public Startup(IConfiguration configuration) 
        {
            Configuration = configuration;
        }

        public void ConfigureServices(IServiceCollection services)
        {
            ConfigureAppSettings(services);
            DependencyInjection.ConfigureServices(services, Configuration);
            Cors.ConfigureServices(services);
            Authentication.ConfigureServices(services, Configuration);
            MVC.ConfigureServices(services);
            SPA.ConfigureServices(services);
        }

        private void ConfigureAppSettings(IServiceCollection services)
        {
            services.AddOptions();
            services.Configure<SecurityConfig>(Configuration.GetSection("SecurityConfig"));
            services.Configure<JsonWebTokenConfig>(Configuration.GetSection("JsonWebTokenConfig"));
        }

        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }

            app.UseRouting();

            Cors.Configure(app, env);
            Authentication.Configure(app, env);

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
            });

            if (!env.IsDevelopment())
            {
                app.UseHttpsRedirection();
                app.UseDeveloperExceptionPage();
                app.UseHsts();
            }

            MVC.Configure(app, env);

            SPA.Configure(app, env);
        }
    }
}
