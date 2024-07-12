using TourGo.Models;
using TourGo.Models.Domain.Users;
using TourGo.Models.Enums;
using TourGo.Models.Requests.Users;

namespace TourGo.Services.Interfaces.Users
{
    public interface IUserService
    {
        int Create(UserAddRequest request);
        bool UserExists(string email);
        bool PhoneExists(string phone);
        IUserAuthData Get(string email);
        IUserAuthData Get(int userId);
        void ChangePassword(int userId, string password);
    }
}