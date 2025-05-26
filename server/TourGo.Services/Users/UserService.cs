using Microsoft.Extensions.Options;
using MySql.Data.MySqlClient;
using System.Data;
using TourGo.Data;
using TourGo.Data.Extensions;
using TourGo.Data.Providers;
using TourGo.Models;
using TourGo.Models.Domain.Config;
using TourGo.Models.Domain.Users;
using TourGo.Models.Requests.Users;
using TourGo.Services.Interfaces.Users;

namespace TourGo.Services.Users
{
    public class UserService : IUserService
    {
        private readonly IWebAuthenticationService<int> _webAuthService;
        private readonly IMySqlDataProvider _mySqlDataProvider;
        private readonly AuthConfig _authConfig;


        public UserService(IWebAuthenticationService<int> authService, IMySqlDataProvider dataProvider, IOptions<AuthConfig> authOptions)
        {
            _webAuthService = authService;
            _mySqlDataProvider = dataProvider;
            _authConfig = authOptions.Value;
        }

        public int Create(UserAddRequest request)
        {
            int userId = 0;
            string proc = "users_insert";
            string hashedPassword = GetHashedPassword(request.Password);
            string authProviderUserId;

            switch (request.AuthProvider)
            {
                default:
                    authProviderUserId = request.Email;
                    break;
            }

            _mySqlDataProvider.ExecuteNonQuery(proc, (coll) =>
            {
                coll.AddWithValue("p_firstName", request.FirstName);
                coll.AddWithValue("p_lastName", request.LastName);
                coll.AddWithValue("p_email", request.Email);
                coll.AddWithValue("p_phone", request.Phone);
                coll.AddWithValue("p_providerId", request.AuthProvider);
                coll.AddWithValue("p_providerUserId", authProviderUserId);
                coll.AddWithValue("p_passwordHash", hashedPassword);
                coll.AddOutputParameter("p_newId", MySqlDbType.Int32);

            }, (returnColl) =>
            {
                int.TryParse(returnColl["p_newId"].Value.ToString(), out userId);
            });

            return userId;
        }

        public bool UserExists(string email)
        {
            string proc = "users_exists";
            bool result = false;

            _mySqlDataProvider.ExecuteCmd(proc, (coll) =>
            {
                coll.AddWithValue("p_email", email);
            }, (reader, set) =>
            {
                result = reader.GetSafeBool(0);
            });

            return result;
        }

        public bool PhoneExists(string phone)
        {
            string proc = "users_phone_exists";
            bool result = false;

            _mySqlDataProvider.ExecuteCmd(proc, (coll) =>
            {
                coll.AddWithValue("p_phone", phone);
            }, (reader, set) =>
            {
                result = reader.GetSafeBool(0);
            });

            return result;
        }

        public IUserAuthData Get(string email)
        {
            string proc = "users_selectBase_by_email_v2";
            UserBase user = null;

            _mySqlDataProvider.ExecuteCmd(proc, (coll) =>
            {
                coll.AddWithValue("p_email", email);
            }, (reader, set) =>
            {
                int index = 0;
                user = MapBaseUser(reader, ref index);
            });

            return user;
        }

        public IUserAuthData Get(int userId)
        {
            string proc = "users_selectBase_by_id_v2";
            UserBase user = null;

            _mySqlDataProvider.ExecuteCmd(proc, (coll) =>
            {
                coll.AddWithValue("p_userId", userId);
            }, (reader, set) =>
            {
                int index = 0;
                user = MapBaseUser(reader, ref index);
            });

            return user;
        }

        public void ChangePassword(int userId, string password)
        {

            string hashedPassword = GetHashedPassword(password);

            string proc = "users_auth_upsert_password";

            _mySqlDataProvider.ExecuteNonQuery(proc, (coll) =>
            {
                coll.AddWithValue("p_userId", userId);
                coll.AddWithValue("p_newPassword", hashedPassword);
            });
        }

        public void UpdateIsVerified(int userId, bool isVerified)
        {
            string proc = "users_update_is_verified_by_id";
            _mySqlDataProvider.ExecuteNonQuery(proc, (coll) =>
            {
                coll.AddWithValue("p_userId", userId);
                coll.AddWithValue("p_isVerified", isVerified);
            });
        }

        private static UserBase MapBaseUser(IDataReader reader, ref int index)
        {
            UserBase user = new UserBase();
            user.Id = reader.GetSafeInt32(index++);
            user.FirstName = reader.GetSafeString(index++);
            user.LastName = reader.GetSafeString(index++);
            user.Email = reader.GetSafeString(index++);
            user.Roles = reader.DeserializeObject<List<string>>(index++);
            user.IsVerified = reader.GetSafeBool(index++);
            return user;
        }

        private static string GetHashedPassword(string password)
        {
            string hashedPassword;
            string salt = BCrypt.BCryptHelper.GenerateSalt();
            hashedPassword = BCrypt.BCryptHelper.HashPassword(password, salt);
            return hashedPassword;
        }
    }
}