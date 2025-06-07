using TourGo.Models;
using TourGo.Models.Requests.Users;

namespace TourGo.Services.Interfaces.Users
{
    public interface IUserAuthService
    {
        bool IsLoginBlocked(string email);
        Task<bool> LogInAsync(string email, string password);
        Task<bool> LogInTest(string email, string password, int id, string[] roles = null);
        void RestartFailedAttempts(int userId);
        void ChangePassword(IUserAuthData user, UserPasswordChangeRequest model);
    }
}