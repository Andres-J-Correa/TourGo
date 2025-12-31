using Grafana.OpenTelemetry;
using OpenTelemetry;
using OpenTelemetry.Logs;
using OpenTelemetry.Resources;

namespace TourGo.Web.Api
{
    public class Program
    {
        public static void Main(string[] args)
        {
            CreateWebHostBuilder(args).Build().Run();
        }

        public static IHostBuilder CreateWebHostBuilder(string[] args)
        {
            return Host.CreateDefaultBuilder(args)
                .ConfigureWebHostDefaults(webBuilder =>
                {
                    webBuilder.UseSetting(WebHostDefaults.DetailedErrorsKey, "true")
                    .UseContentRoot(Directory.GetCurrentDirectory())
                    .UseIISIntegration()
                    .ConfigureAppConfiguration(ConfigConfiguration)
                    .ConfigureLogging(ConfigureLogging)
                    .UseStartup<Startup>();

                });
        }

        private static void ConfigureLogging(WebHostBuilderContext context, ILoggingBuilder logging)
        {
            logging.AddConfiguration(context.Configuration.GetSection("Logging"));
            logging.AddOpenTelemetry(options =>
            {
                options.UseGrafana();
                options.IncludeScopes = true;

                if(context.HostingEnvironment.IsDevelopment())
                {
                    options.AddConsoleExporter();
                }

            });

            if (!context.HostingEnvironment.IsDevelopment())
            {
                logging.AddSimpleConsole();
            }

                logging.AddDebug();
        }

        private static void ConfigConfiguration(WebHostBuilderContext context, IConfigurationBuilder config)
        {
            config.SetBasePath(context.HostingEnvironment.ContentRootPath)
                  .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
                  .AddJsonFile($"appsettings.{context.HostingEnvironment.EnvironmentName}.json", optional: true, reloadOnChange: true)
                  .AddEnvironmentVariables();
        }
    }
}
