using TourGo.Models;
using TourGo.Models.Domain.Users;
using TourGo.Models.Enums;
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
        Guid CreateToken(int userId, UserTokenTypeEnum tokenType, DateTime expirationDate);
        IUserAuthData Get(string email);
        UserToken GetUserToken(string token);
        void ChangePassword(int userId, string password);
        void DeleteUserToken(UserToken userToken);
    }
}