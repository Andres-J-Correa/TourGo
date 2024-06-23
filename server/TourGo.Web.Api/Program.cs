using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Logging.Console;

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

            logging.AddSimpleConsole(options => {
                options.IncludeScopes = true;
                options.ColorBehavior = LoggerColorBehavior.Disabled;
            });

            logging.AddDebug();
        }

        private static void ConfigConfiguration(WebHostBuilderContext context, IConfigurationBuilder config)
        {
            IConfigurationBuilder root = config.SetBasePath(context.HostingEnvironment.ContentRootPath);

            //the settings in the env settings will override the appsettings.json values, recursively at the key level.
            // where the key could be nested. this would allow very fine tuned control over the settings
            IConfigurationBuilder appSettings = root.AddJsonFile("appsettings.json", optional: false, reloadOnChange: true);

            string jsonFileName = $"appsettings.{context.HostingEnvironment.EnvironmentName}.json";
            IConfigurationBuilder envSettings = appSettings
                .AddJsonFile(jsonFileName, optional: true, reloadOnChange: true);
        }


    }
}
