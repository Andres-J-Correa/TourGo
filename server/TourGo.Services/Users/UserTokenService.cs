using System.Data;
using TourGo.Data;
using TourGo.Data.Providers;
using TourGo.Models.Domain.Users;
using TourGo.Models.Enums;
using TourGo.Services.Interfaces.Users;

namespace TourGo.Services.Users
{
    public class UserTokenService : IUserTokenService
    {
        private readonly IMySqlDataProvider _mySqlDataProvider;

        public UserTokenService(IMySqlDataProvider mySqlDataProvider)
        {
            _mySqlDataProvider = mySqlDataProvider;
        }

   
        public UserToken? GetUserToken(string token)
        {
            UserToken? userToken = null;
            string proc = "users_tokens_select_by_token_v2";

            _mySqlDataProvider.ExecuteCmd(proc, (coll) =>
            {
                coll.AddWithValue("p_token", token);
            }, (reader, set) =>
            {
                int index = 0;
                userToken = MapUserToken(reader, ref index);
            });

            return userToken;
        }

        public UserToken? GetUserToken(string userId, UserTokenTypeEnum tokenType)
        {
            string proc = "users_tokens_select_by_user_id_type_id_v2";
            UserToken? userToken = null;
            _mySqlDataProvider.ExecuteCmd(proc, (coll) =>
            {
                coll.AddWithValue("p_userId", userId);
                coll.AddWithValue("p_typeId", (int)tokenType);
            }, (reader, set) =>
            {
                int index = 0;
                userToken = MapUserToken(reader, ref index);
            });

            return userToken;
        }

        public Guid CreateToken(string userId, UserTokenTypeEnum tokenType, DateTime expirationDate)
        {
            Guid guid = Guid.NewGuid();
            string proc = "users_tokens_insert_v3";

            _mySqlDataProvider.ExecuteNonQuery(proc, (coll) =>
            {
                coll.AddWithValue("p_userId", userId);
                coll.AddWithValue("p_token", guid.ToString());
                coll.AddWithValue("p_tokenTypeId", (int)tokenType);
                coll.AddWithValue("p_expiration", expirationDate);
            });

            return guid;
        }

        public void DeleteUserToken(UserToken userToken)
        {
            string proc = "users_tokens_delete_v2";

            _mySqlDataProvider.ExecuteNonQuery(proc, (coll) =>
            {
                coll.AddWithValue("p_userId", userToken.UserId);
                coll.AddWithValue("p_tokenTypeId", (int)userToken.TokenType);
                coll.AddWithValue("p_token", userToken.Token);
            });
        }

        private static UserToken MapUserToken(IDataReader reader, ref int index)
        {
            UserToken userToken = new UserToken();
            userToken.Token = reader.GetSafeString(index++);
            userToken.UserId = reader.GetSafeInt32(index++);
            userToken.TokenType = (UserTokenTypeEnum)reader.GetSafeInt32(index++);
            userToken.Expiration = reader.GetSafeDateTime(index++);
            return userToken;
        }

    }
}
