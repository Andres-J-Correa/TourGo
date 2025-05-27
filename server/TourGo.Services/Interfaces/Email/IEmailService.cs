using TourGo.Models;
using TourGo.Models.Domain.Users;

namespace TourGo.Services.Interfaces.Email
{
    public interface IEmailService
    {
        Task UserPasswordReset(IUserAuthData user, string token);
        Task UserEmailVerification(IUserAuthData user, string token);
    }
}