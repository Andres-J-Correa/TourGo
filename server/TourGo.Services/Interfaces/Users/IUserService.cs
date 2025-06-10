using TourGo.Models;
using TourGo.Models.Domain.Users;
using TourGo.Models.Enums;
using TourGo.Models.Interfaces;
using TourGo.Models.Requests.Users;

namespace TourGo.Services.Interfaces.Users
{
    public interface IUserService
    {
        int Create(UserAddRequest request, string publicId);
        void Update(UserUpdateRequest request, string userId);
        bool UserExists(string email);
        bool PhoneExists(string phone);
        IUserAuthData Get(string email);
        IUserAuthData GetByPublicId(string publicId);
        void ResetPassword(string userId, string password);
        void UpdateIsVerified(string userId, bool isVerified);
        IUserAuthDataV2? GetAuth(string email);
        UserBase GetPII(string userId);
        List<string>? GetAvailablePublicIds(List<string> possibleIds);
    }
}