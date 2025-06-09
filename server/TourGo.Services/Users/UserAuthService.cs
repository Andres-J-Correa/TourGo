using System.Security.Claims;
using TourGo.Data.Providers;
using TourGo.Models.Domain.Users;
using TourGo.Models;
using MySql.Data.MySqlClient;
using Microsoft.Extensions.Options;
using TourGo.Data.Extensions;
using TourGo.Models.Domain.Config;
using TourGo.Services.Interfaces.Users;
using TourGo.Models.Interfaces;
using TourGo.Models.Requests.Users;

namespace TourGo.Services.Users
{
    public class UserAuthService : IUserAuthService
    {
        private readonly IUserService _userService;
        private readonly IMySqlDataProvider _mySqlDataProvider;
        private readonly IWebAuthenticationService<string> _webAuthService;
        private readonly AuthConfig _authConfig;

        public UserAuthService(IMySqlDataProvider dataProvider, IWebAuthenticationService<string> authService, IUserService userService, IOptions<AuthConfig> authOptions)
        {
            _mySqlDataProvider = dataProvider;
            _webAuthService = authService;
            _userService = userService;
            _authConfig = authOptions.Value;
        }

        public async Task<bool> LogInAsync(string email, string password)
        {
            bool isSuccessful = false;

            bool isValidCredentials = IsValidCredentials(email, password);

            if (isValidCredentials)
            {
                IUserAuthDataV2? response = _userService.GetAuth(email);

                if (response != null)
                {
                    await _webAuthService.LogInAsyncV2(response);
                    RestartFailedAttempts(response.PublicId);
                    isSuccessful = true;
                }
            }
            else
            {
                IncrementFailedAttempts(email);
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
                PublicId = id.ToString(),
                FirstName = email,
                LastName = email,
                Email = email,
                Roles = allRoles,
                IsVerified = false
            };

            Claim fullName = new Claim("CustomClaim", "test val");
            await _webAuthService.LogInAsync(response, new Claim[] { fullName });

            return isSuccessful;
        }

        public bool IsLoginBlocked(string email)
        {
            bool isBlocked = GetFailedAttempts(email) >= _authConfig.MaxFailedAttempts;

            return isBlocked;
        }

        public void ChangePassword(IUserAuthData user, UserPasswordChangeRequest model)
        {
            bool isValidCredentials = IsValidCredentials(user.Email, model.OldPassword);

            if (isValidCredentials)
            {
                _userService.ResetPassword(user.PublicId, model.Password);
            } else
            {
                throw new UnauthorizedAccessException("Invalid credentials provided for password change.");
            }
        }

        public void RestartFailedAttempts(string publicId)
        {
            string proc = "users_auth_restart_failed_attempts_by_user_public_id";

            _mySqlDataProvider.ExecuteNonQuery(proc, (coll) =>
            {
                coll.AddWithValue("p_userId", publicId);
            });
        }

        private bool IsValidCredentials(string email, string password)
        {
            bool isValid = false;
            string? passwordFromDb = GetPasswordHash(email);

            if (passwordFromDb != null)
            {
                isValid = BCrypt.BCryptHelper.CheckPassword(password, passwordFromDb);
            }

            return isValid;
        }

        private string? GetPasswordHash(string email)
        {
            string proc = "users_auth_get_hashPassword_byEmail";
            string? password = null;

            _mySqlDataProvider.ExecuteNonQuery(proc, (coll) =>
            {
                coll.AddWithValue("p_email", email);
                coll.AddOutputParameter("p_passwordHash", MySqlDbType.VarChar);
            }, (returnColl) =>
            {
                object passwordHash = returnColl["p_passwordHash"].Value;

                if (passwordHash != null)
                {
                    password = passwordHash.ToString();
                }
            });

            return password;
        }

        private byte GetFailedAttempts(string email)
        {
            string proc = "users_auth_get_failedAttempts_byEmail";
            byte attempts = 0;

            _mySqlDataProvider.ExecuteNonQuery(proc, (coll) =>
            {
                coll.AddWithValue("p_email", email);
                coll.AddOutputParameter("p_failedAttempts", MySqlDbType.Byte);
            }, (returnColl) =>
            {
                object failedAttempts = returnColl["p_failedAttempts"].Value;

                bool parseSuccess = byte.TryParse(failedAttempts.ToString(), out attempts);

                if (!parseSuccess) throw new Exception("Error Parsing FailedAttempts");

            });

            return attempts;
        }

        private void IncrementFailedAttempts(string email)
        {
            string proc = "users_auth_increment_failed_attempts";
            _mySqlDataProvider.ExecuteNonQuery(proc, (coll) =>
            {
                coll.AddWithValue("p_email", email);
            });
        }
    }

}
