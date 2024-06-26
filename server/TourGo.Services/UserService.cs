using MySql.Data.MySqlClient;
using MySqlX.XDevAPI.Common;
using System.Data;
using System.Security.Claims;
using TourGo.Data;
using TourGo.Data.Extensions;
using TourGo.Data.Providers;
using TourGo.Models;
using TourGo.Models.Domain;
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
                Id = id
                ,
                Name = email
                ,
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
            string salt = BCrypt.BCryptHelper.GenerateSalt();
            string hashedPassword = BCrypt.BCryptHelper.HashPassword(request.Password, salt);
            string authProviderUserId;

            switch (request.AuthProvider)
            {
                default:
                    authProviderUserId = request.Email;
                    break;
            }

            _mySqlDataProvider.ExecuteNonQuery(proc, (MySqlParameterCollection coll) =>
            {
                coll.AddWithValue("p_name", request.Name);
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
    
        private IUserAuthData Get (string email)
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

        private static UserBase MapBaseUser(IDataReader reader, ref int index)
        {
            UserBase user = new UserBase();
            user.Id = reader.GetSafeInt32(index++);
            user.Name = reader.GetSafeString(index++);
            user.Roles = reader.DeserializeObject<List<string>>(index++);
            return user;
        }
    }
}