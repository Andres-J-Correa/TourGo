using AspNetCoreRateLimit;
using Grafana.OpenTelemetry;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.Localization;
using OpenTelemetry;
using OpenTelemetry.Metrics;
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;
using Org.BouncyCastle.Crypto.Operators;
using Quartz;
using System.Globalization;
using TourGo.Models.Domain.Config;
using TourGo.Models.Domain.Config.Emails;
using TourGo.Services;
using TourGo.Web.Api.Extensions;
using TourGo.Web.Api.Hubs;
using TourGo.Web.Api.Middleware;
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
            services.AddLocalization(options => options.ResourcesPath = "Resources");
            services.AddMemoryCache();
            ConfigureAppSettings(services);
            DependencyInjection.ConfigureServices(services, Configuration);
            Cors.ConfigureServices(services);
            Authentication.ConfigureServices(services, Configuration);
            MVC.ConfigureServices(services);
            SPA.ConfigureServices(services);
            services.AddInMemoryRateLimiting();
            services.AddQuartz(q =>
            {
                //for trivial jobs
                q.AddQuartzJobsFromConfig(Configuration, typeof(Program).Assembly);
            });
            services.AddQuartzHostedService(options =>
            {
                options.WaitForJobsToComplete = true;
            });
            services.AddSignalR();

            bool isDevelopment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") == "Development";
            
            if (!isDevelopment)
            {
                services.AddOpenTelemetry()
                        .WithMetrics(metrics =>
                        {
                            metrics.AddAspNetCoreInstrumentation()
                            .AddHttpClientInstrumentation()
                            .UseGrafana();
                        })
                        .WithTracing(tracing =>
                        {
                            tracing.AddAspNetCoreInstrumentation()
                            .AddHttpClientInstrumentation()
                            .UseGrafana(options =>
                            {
                                options.Instrumentations.Remove(Instrumentation.MySqlData);
                            });
                        });
            }
            
        }

        private void ConfigureAppSettings(IServiceCollection services)
        {
            services.AddOptions();
            services.Configure<SecurityConfig>(Configuration.GetSection("SecurityConfig"));
            services.Configure<JsonWebTokenConfig>(Configuration.GetSection("JsonWebTokenConfig"));
            services.Configure<BrevoConfig>(Configuration.GetSection("BrevoConfig"));
            services.Configure<EmailConfig>(Configuration.GetSection("EmailConfig"));
            services.Configure<AuthConfig>(Configuration.GetSection("AuthConfig"));
            services.Configure<AWSS3Config>(Configuration.GetSection("AWSS3Config"));
            services.Configure<EncryptionConfig>(Configuration.GetSection("EncryptionConfig"));
            services.Configure<UsersPublicIdConfig>(Configuration.GetSection("UsersPublicIdConfig"));
            services.Configure<HotelsPublicIdConfig>(Configuration.GetSection("HotelsPublicIdConfig"));
            services.Configure<BookingsPublicIdConfig>(Configuration.GetSection("BookingsPublicIdConfig"));
            services.Configure<TransactionsPublicIdConfig>(Configuration.GetSection("TransactionsPublicIdConfig")); 
            services.Configure<GoogleRecaptchaConfig>(Configuration.GetSection("GoogleRecaptchaConfig"));
        }

        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (!env.IsDevelopment())
            {
                var forwardOptions = new ForwardedHeadersOptions
                {
                    ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto
                };

                // Clear the default "KnownNetworks" and "KnownProxies" 
                // This allows the headers to be accepted from the Docker bridge
                forwardOptions.KnownNetworks.Clear();
                forwardOptions.KnownProxies.Clear();

                app.UseForwardedHeaders(forwardOptions);
                app.UseHsts();
            }

            app.UseRequestLocalization(new RequestLocalizationOptions
            {
                DefaultRequestCulture = new RequestCulture("en"),
                SupportedCultures = new[] { new CultureInfo("en"), new CultureInfo("es") },
                SupportedUICultures = new[] { new CultureInfo("en"), new CultureInfo("es") }
            });

            app.UseIpRateLimiting();
            app.UseMiddleware<ErrorLoggingMiddleware>();
            app.UseMiddleware<MaintenanceMiddleware>();

            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }

            app.UseRouting();



            Cors.Configure(app, env);
            Authentication.Configure(app, env);
            app.UseMiddleware<UserTelemetryMiddleware>();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
                endpoints.MapHub<TaskRemindersHub>("/hubs/task-reminders");
            });

            MVC.Configure(app, env);

            SPA.Configure(app, env);

        }
    }
}
