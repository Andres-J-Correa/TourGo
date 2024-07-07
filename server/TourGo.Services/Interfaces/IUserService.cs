using TourGo.Models.Requests.Users;

namespace TourGo.Services
{
    public interface IUserService
    {
        int Create(UserAddRequest request);
        Task<bool> LogInAsync(string email, string password);
        Task<bool> LogInTest(string email, string password, int id, string[] roles = null);
        bool UserExists(string email);
        bool PhoneExists(string phone);
    }
}