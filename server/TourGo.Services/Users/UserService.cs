using Microsoft.Extensions.Options;
using MySql.Data.MySqlClient;
using Newtonsoft.Json;
using System.Data;
using TourGo.Data;
using TourGo.Data.Extensions;
using TourGo.Data.Providers;
using TourGo.Models;
using TourGo.Models.Domain.Users;
using TourGo.Models.Interfaces;
using TourGo.Models.Requests.Users;
using TourGo.Services.Interfaces.Users;

namespace TourGo.Services.Users
{
    public class UserService : IUserService
    {
        private readonly IMySqlDataProvider _mySqlDataProvider;

        public UserService(IMySqlDataProvider dataProvider)
        {
            _mySqlDataProvider = dataProvider;
        }

        public int Create(UserAddRequest request, string publicId)
        {
            int userId = 0;
            string proc = "users_insert_v2";
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
                coll.AddWithValue("p_email", request.Email.ToLower());
                coll.AddWithNullableString("p_phone", request.Phone);
                coll.AddWithValue("p_providerId", request.AuthProvider);
                coll.AddWithValue("p_providerUserId", authProviderUserId);
                coll.AddWithValue("p_passwordHash", hashedPassword);
                coll.AddOutputParameter("p_newId", MySqlDbType.Int32);
                coll.AddWithValue("p_publicId", publicId);

            }, (returnColl) =>
            {
                int.TryParse(returnColl["p_newId"].Value.ToString(), out userId);
            });

            return userId;
        }

        public void Update(UserUpdateRequest request, string userId)
        {
            string proc = "users_update_v2";
            _mySqlDataProvider.ExecuteNonQuery(proc, (coll) =>
            {
                coll.AddWithValue("p_firstName", request.FirstName);
                coll.AddWithValue("p_lastName", request.LastName);
                coll.AddWithNullableString("p_phone", request.Phone);
                coll.AddWithValue("p_userId", userId);
            });
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
            string proc = "users_select_base_by_email_v4";
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

        public IUserAuthDataV2? GetAuth(string email)
        {
            string proc = "users_select_auth_by_email_v2";
            UserBase? user = null;
            _mySqlDataProvider.ExecuteCmd(proc, (coll) =>
            {
                coll.AddWithValue("p_email", email);
            }, (reader, set) =>
            {
                int index = 0;
                user = new UserBase();
                user.Id = reader.GetSafeString(index++);
                user.Roles = reader.DeserializeObject<List<string>>(index++);
                user.IsVerified = reader.GetSafeBool(index++);
            });
            return user;
        }
        
        public IUserAuthData GetByPublicId(string publicId)
        {
            string proc = "users_select_base_by_public_id";
            UserBase user = null;
            _mySqlDataProvider.ExecuteCmd(proc, (coll) =>
            {
                coll.AddWithValue("p_publicId", publicId);
            }, (reader, set) =>
            {
                int index = 0;
                user = MapBaseUser(reader, ref index);
            });
            return user;
        }
        
        public UserBase GetPII(string userId)
        {
            string proc = "users_select_pii_by_id_v2";
            UserBase user = new UserBase();
            _mySqlDataProvider.ExecuteCmd(proc, (coll) =>
            {
                coll.AddWithValue("p_userId", userId);
            }, (reader, set) =>
            {
                int index = 0;
                user.Id = userId;
                user.FirstName = reader.GetSafeString(index++);
                user.LastName = reader.GetSafeString(index++);
                user.Email = reader.GetSafeString(index++);
                user.Phone = reader.GetSafeString(index++);
            });
            return user;
        }
        public void ResetPassword(string userId, string password)
        {

            string hashedPassword = GetHashedPassword(password);

            string proc = "users_auth_upsert_password_v2";

            _mySqlDataProvider.ExecuteNonQuery(proc, (coll) =>
            {
                coll.AddWithValue("p_userId", userId);
                coll.AddWithValue("p_newPassword", hashedPassword);
            });
        }

        public void UpdateIsVerified(string userId, bool isVerified)
        {
            string proc = "users_update_is_verified_by_id_v2";
            _mySqlDataProvider.ExecuteNonQuery(proc, (coll) =>
            {
                coll.AddWithValue("p_userId", userId);
                coll.AddWithValue("p_isVerified", isVerified);
            });
        }

        public List<string>? GetAvailablePublicIds(List<string> possibleIds)
        {
            string proc = "users_select_available_public_ids";
            List<string>? availableIds = null;

            _mySqlDataProvider.ExecuteCmd(proc, (coll) =>
            {
                coll.AddWithValue("p_jsonData", JsonConvert.SerializeObject(possibleIds));
            }, (reader, set) =>
            {
                int index = 0;
                string availableId = reader.GetSafeString(index++);
                availableIds ??= new List<string>();
                availableIds.Add(availableId);
            });

            return availableIds;
        }

        private static UserBase MapBaseUser(IDataReader reader, ref int index)
        {
            UserBase user = new UserBase();
            user.Id = reader.GetSafeString(index++);
            user.FirstName = reader.GetSafeString(index++);
            user.LastName = reader.GetSafeString(index++);
            user.Email = reader.GetSafeString(index++);
            user.Roles = reader.DeserializeObject<List<string>>(index++);
            user.IsVerified = reader.GetSafeBool(index++);
            user.Phone = reader.GetSafeString(index++);
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