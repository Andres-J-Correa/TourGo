using sib_api_v3_sdk.Api;
using sib_api_v3_sdk.Client;
using TourGo.Data;
using TourGo.Data.Providers;
using TourGo.Services;
using TourGo.Services.Customers;
using TourGo.Services.Email;
using TourGo.Services.Finances;
using TourGo.Services.Hotels;
using TourGo.Services.Interfaces;
using TourGo.Services.Interfaces.Email;
using TourGo.Services.Interfaces.Hotels;
using TourGo.Services.Interfaces.Security;
using TourGo.Services.Interfaces.Users;
using TourGo.Services.Security;
using TourGo.Services.Users;
using TourGo.Web.Api.StartUp.DependencyInjection;
using TourGo.Web.Core.Services;


namespace TourGo.Web.StartUp
{
    public class DependencyInjection
    {
        public static void ConfigureServices(IServiceCollection services, IConfiguration configuration)
        {
            if (configuration is IConfigurationRoot)
            {
                services.AddSingleton<IConfigurationRoot>(configuration as IConfigurationRoot);   // IConfigurationRoot
            }

            services.AddSingleton<IConfiguration>(configuration);   // IConfiguration explicitly

            string sqlConnString = configuration.GetConnectionString("Sql");
            string mySqlConnString = configuration.GetConnectionString("MySql");
            // https://docs.microsoft.com/en-us/aspnet/core/fundamentals/dependency-injection?view=aspnetcore-2.2

            services.AddSingleton<IWebAuthenticationService<int>, WebAuthenticationService>();

            services.AddSingleton<ISqlDataProvider, SqlDataProvider>(delegate (IServiceProvider provider)
            {
                return new SqlDataProvider(sqlConnString);
            }
            );

            services.AddSingleton<IMySqlDataProvider, MySqlDataProvider>(delegate (IServiceProvider provider)
            {
                return new MySqlDataProvider(mySqlConnString);
            });

            services.AddSingleton<IIdentityProvider<int>, WebAuthenticationService>();
            services.AddSingleton<IHttpContextAccessor, HttpContextAccessor>();

            services.AddSingleton<IUserService, UserService>();
            services.AddSingleton<ICacheService,MemoryCacheDefault>(delegate (IServiceProvider provider)
            {
                return MemoryCacheDefault.Instance;
            });

            services.AddSingleton<TransactionalEmailsApi>(provider =>
            {
                Configuration.Default.ApiKey["api-key"] = configuration.GetSection("BrevoConfig:ApiKey").Value;
                return new TransactionalEmailsApi();
            });

            services.AddSingleton<IEmailService, EmailService>();
            services.AddSingleton<ITemplateLoader, TemplateLoader>();
            services.AddSingleton<IUserTokenService, UserTokenService>();
            services.AddSingleton<IUserAuthService, UserAuthService>();
            services.AddSingleton<IBookingService, BookingService>();
            services.AddSingleton<ISecureEntities<int,object>, EntityAuthService>();
            services.AddSingleton<IHotelService, HotelService>();
            services.AddSingleton<IRoomService, RoomService>();
            services.AddSingleton<IExtraChargeService, ExtraChargeService>();
            services.AddSingleton<ICustomerService, CustomerService>();
            services.AddSingleton<ITransactionService, TransactionService>();
            services.AddSingleton<IInvoiceService, InvoiceService>();
            services.AddSingleton<IErrorLoggingService, ErrorLoggingService>();

            GetAllEntities().ForEach(tt =>
            {
                IConfigureDependencyInjection idi = Activator.CreateInstance(tt) as IConfigureDependencyInjection;

                //This will not error by way of being null. BUT if the code within the method does
                // then we would rather have the error loadly on startup then worry about debuging the issues as it runs
                idi.ConfigureServices(services, configuration);
            });
        }

        public static List<Type> GetAllEntities()
        {
            return AppDomain.CurrentDomain.GetAssemblies().SelectMany(x => x.GetTypes())
                 .Where(x => typeof(IConfigureDependencyInjection).IsAssignableFrom(x) && !x.IsInterface && !x.IsAbstract)
                 .ToList();
        }

        public static void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
        }
    }
}