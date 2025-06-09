using TourGo.Models.Domain.Users;
using TourGo.Models.Enums;

namespace TourGo.Services.Interfaces.Users
{
    public interface IUserTokenService
    {
        Guid CreateToken(string userId, UserTokenTypeEnum tokenType, DateTime expirationDate);
        void DeleteUserToken(UserToken userToken);
        UserToken? GetUserToken(string token);
        UserToken? GetUserToken(string userId, UserTokenTypeEnum tokenType);
    }
}