namespace TourGo.Services.Interfaces.Security
{
    public interface IPublicIdGeneratorService
    {
        List<string> GenerateSecureId();
    }
}