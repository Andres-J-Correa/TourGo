
namespace TourGo.Web.Api.StartUp.DependencyInjection
{
    public interface IConfigureDependencyInjection
    {
        void ConfigureServices(IServiceCollection services, IConfiguration configuration);
    }
}