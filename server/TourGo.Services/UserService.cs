using MySql.Data.MySqlClient;
using MySqlX.XDevAPI.Common;
using System.Data;
using System.Security.Claims;
using TourGo.Data;
using TourGo.Data.Extensions;
using TourGo.Data.Providers;
using TourGo.Models;
using TourGo.Models.Domain.Users;
using TourGo.Models.Enums;
using TourGo.Models.Requests.Users;

namespace TourGo.Services
{
    public class UserService : IUserService
    {
        private IAuthenticationService<int> _authenticationService;
        private IMySqlDataProvider _mySqlDataProvider;

        public UserService(IAuthenticationService<int> authSerice, IMySqlDataProvider dataProvider)
        {
            _authenticationService = authSerice;
            _mySqlDataProvider = dataProvider;
        }

        public async Task<bool> LogInAsync(string email, string password)
        {
            bool isSuccessful = false;

            bool isValidCredentials = IsValidCredentials(email, password);

            if (isValidCredentials)
            {
                IUserAuthData response = Get(email);

                if (response != null)
                {
                    await _authenticationService.LogInAsync(response);
                    isSuccessful = true;
                }
            }
            return isSuccessful;
        }

        public async Task<bool> LogInTest(string email, string password, int id, string[] roles = null)
        {
            bool isSuccessful = false;
            var testRoles = new[] { "User", "Super", "Content Manager" };

            var allRoles = roles == null ? testRoles : testRoles.Concat(roles);

            IUserAuthData response = new UserBase
            {
                Id = id,
                FirstName = email,
                LastName = email,
                Email = email,
                Roles = allRoles
            };

            Claim fullName = new Claim("CustomClaim", "test val");
            await _authenticationService.LogInAsync(response, new Claim[] { fullName });

            return isSuccessful;
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

            _mySqlDataProvider.ExecuteNonQuery(proc, (MySqlParameterCollection coll) =>
            {
                coll.AddWithValue("p_firstName", request.FirstName);
                coll.AddWithValue("p_lastName", request.LastName);
                coll.AddWithValue("p_email", request.Email);
                coll.AddWithValue("p_phone", request.Phone);
                coll.AddWithValue("p_providerId", request.AuthProvider);
                coll.AddWithValue("p_providerUserId", authProviderUserId);
                coll.AddWithValue("p_roleId", request.Role);
                coll.AddWithValue("p_passwordHash", hashedPassword);
                coll.AddOutputParameter("p_insertedParameter", SqlDbType.Int);

            }, (MySqlParameterCollection returnColl) =>
            {
                int.TryParse(returnColl["p_insertedParameter"].Value.ToString(), out userId);
            });

            return userId;
        }

        public bool UserExists(string email)
        {
            string proc = "users_exists";
            bool result = false;

            _mySqlDataProvider.ExecuteCmd(proc, (MySqlParameterCollection coll) =>
            {
                coll.AddWithValue("p_email", email);
            }, (IDataReader reader, short set) =>
            {
                result = reader.GetSafeBool(0);
            });

            return result;
        }

        public bool PhoneExists(string phone)
        {
            string proc = "users_phone_exists";
            bool result = false;

            _mySqlDataProvider.ExecuteCmd(proc, (MySqlParameterCollection coll) =>
            {
                coll.AddWithValue("p_phone", phone);
            }, (IDataReader reader, short set) =>
            {
                result = reader.GetSafeBool(0);
            });

            return result;
        }

        public UserToken GetUserToken(string token)
        {
            UserToken userToken = null;
            string proc = "users_tokens_select_byToken";

            _mySqlDataProvider.ExecuteCmd(proc, (MySqlParameterCollection coll) =>
            {
                coll.AddWithValue("p_token", token);
            }, (IDataReader reader, short set) =>
            {
                int index = 0;
                userToken = MapUserToken(reader, ref index);
            });

            return userToken;
        }

        public Guid CreateToken( int userId, UserTokenTypeEnum tokenType, DateTime expirationDate)
        {
            Guid guid = Guid.NewGuid();
            string proc = "users_tokens_insert";

            _mySqlDataProvider.ExecuteNonQuery(proc, (MySqlParameterCollection coll) =>
            {
                coll.AddWithValue("p_userId", userId);
                coll.AddWithValue("p_token", guid.ToString());
                coll.AddWithValue("p_tokenTypeId", (int)tokenType);
                coll.AddWithValue("p_expiration", expirationDate);
            });

            return guid;
        }
    
        public IUserAuthData Get (string email)
        {
            string proc = "users_selectBase_ByEmail";
            UserBase user = null;

            _mySqlDataProvider.ExecuteCmd(proc, (MySqlParameterCollection coll) =>
            {
                coll.AddWithValue("p_email", email);
            }, (IDataReader reader, short set) =>
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

            _mySqlDataProvider.ExecuteNonQuery(proc, (MySqlParameterCollection coll) =>
            {
                coll.AddWithValue("p_userId", userId);
                coll.AddWithValue("p_newPassword", hashedPassword);
            });
        }

        public void DeleteUserToken (UserToken userToken)
        {
            string proc = "users_tokens_delete";


            _mySqlDataProvider.ExecuteNonQuery(proc, (MySqlParameterCollection coll) =>
            {
                coll.AddWithValue("p_userId", userToken.UserId);
                coll.AddWithValue("p_tokenTypeId", (int)userToken.TokenType);
                coll.AddWithValue("p_token", userToken.Token);
            });
        }

        private bool IsValidCredentials(string email, string password)
        {
            string proc = "users_get_hashPassword_byEmail";
            string passwordFromDb = null;
            bool isValidCredentials = false;

            _mySqlDataProvider.ExecuteCmd(proc, (MySqlParameterCollection coll) =>
            {
                coll.AddWithValue("p_email", email);

            }, (IDataReader reader, short set) =>
            {
                passwordFromDb = reader.GetSafeString(0);
            });

            if (passwordFromDb != null)
            {
                isValidCredentials = BCrypt.BCryptHelper.CheckPassword(password, passwordFromDb);
            }

            return isValidCredentials;
        }

        private static UserBase MapBaseUser(IDataReader reader, ref int index)
        {
            UserBase user = new UserBase();
            user.Id = reader.GetSafeInt32(index++);
            user.FirstName = reader.GetSafeString(index++);
            user.LastName = reader.GetSafeString(index++);
            user.Email = reader.GetSafeString(index++);
            user.Roles = reader.DeserializeObject<List<string>>(index++);
            return user;
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

        private static string GetHashedPassword(string password)
        {
            string hashedPassword;
            string salt = BCrypt.BCryptHelper.GenerateSalt();
            hashedPassword = BCrypt.BCryptHelper.HashPassword(password, salt);
            return hashedPassword;
        }
    }
}