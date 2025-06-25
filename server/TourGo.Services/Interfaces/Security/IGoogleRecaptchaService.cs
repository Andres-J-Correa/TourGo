namespace TourGo.Services.Interfaces.Security
{
    public interface IGoogleRecaptchaService
    {
        Task<bool> VerifyTokenAsync(string token);
    }
}