using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using TourGo.Models;
using TourGo.Models.Domain.Config.Emails;
using TourGo.Models.Domain.Users;
using TourGo.Models.Enums;
using TourGo.Models.Requests.Users;
using TourGo.Services;
using TourGo.Services.Interfaces.Email;
using TourGo.Services.Interfaces.Users;
using TourGo.Web.Controllers;
using TourGo.Web.Models.Enums;
using TourGo.Web.Models.Responses;

namespace TourGo.Web.Api.Controllers.Users
{
    [Route("api/users/auth")]
    [ApiController]
    public class UsersAuthController : BaseApiController
    {
        private readonly IUserService _userService;
        private readonly IWebAuthenticationService<int> _webAuthService;
        private readonly IUserAuthService _userAuthService;
        private readonly IUserTokenService _userTokenService;
        private readonly IEmailService _emailService;

        private readonly EmailConfig _emailConfig;

        public UsersAuthController(ILogger<UsersAuthController> logger, IUserService userService, IWebAuthenticationService<int> webAuthService, IEmailService emailService, IUserAuthService userAuthService , IUserTokenService userTokenService, IOptions<EmailConfig> emailConfig) : base(logger)
        {
            _userService = userService;
            _webAuthService = webAuthService;
            _emailService = emailService;
            _userAuthService = userAuthService;
            _userTokenService = userTokenService;
            _emailConfig = emailConfig.Value;
        }

        #region Public Endpoints

        [HttpPost("exists")]
        [AllowAnonymous]
        public ActionResult<ItemResponse<bool>> UserExists(EmailValidateRequest request)
        {

            ObjectResult result = null;

            try
            {
                bool exists = _userService.UserExists(request.Email);

                ItemResponse<bool> response = new ItemResponse<bool> { Item = exists };

                result = Ok200(response);
            }
            catch (Exception ex)
            {

                int iCode = 500;
                Logger.LogError(ex.ToString());
                ErrorResponse response = new ErrorResponse($"Generic Error: {ex.Message}");
                result = StatusCode(iCode, response);
            }

            return result;
        }

        [HttpPost("exists/phone")]
        [AllowAnonymous]
        public ActionResult<ItemResponse<bool>> PhoneExists(PhoneValidateRequest request)
        {

            ObjectResult result = null;

            try
            {
                bool exists = _userService.PhoneExists(request.Phone);

                ItemResponse<bool> response = new ItemResponse<bool> { Item = exists };

                result = Ok200(response);
            }
            catch (Exception ex)
            {

                int iCode = 500;
                Logger.LogError(ex.ToString());
                ErrorResponse response = new ErrorResponse($"Generic Error: {ex.Message}");
                result = StatusCode(iCode, response);
            }

            return result;
        }

        [HttpPost]
        [AllowAnonymous]
        public ActionResult<ItemResponse<int>> Create(UserAddRequest request)
        {
            try
            {

                bool userExists = _userService.UserExists(request.Email);

                if (userExists)
                {
                    ErrorResponse errorResponse = new ErrorResponse("Email already exists", UserManagementErrorCode.EmailAlreadyExists);
                    return StatusCode(409, errorResponse);
                }

                bool phoneExists = _userService.PhoneExists(request.Phone);

                if (phoneExists)
                {
                    ErrorResponse errorResponse = new ErrorResponse("Phone already exists", UserManagementErrorCode.PhoneAlreadyExists);
                    return StatusCode(409, errorResponse);
                }

                int userId = _userService.Create(request);

                ItemResponse<int> response = new ItemResponse<int>() { Item = userId };

                return Created201(response);

            }
            catch (Exception ex)
            {
                Logger.LogError(ex.ToString());
                ErrorResponse errorResponse = new ErrorResponse(ex.Message);

                return StatusCode(500, errorResponse);
            }
        }

        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<ActionResult<ItemResponse<bool>>> LoginAsync(UserLoginRequest request)
        {
            try
            {
                if (!_userService.UserExists(request.Email))
                {
                    return StatusCode(401, new ErrorResponse("User not found.", AuthenticationErrorCode.UserNotFound));
                }

                if (_userAuthService.IsLoginBlocked(request.Email))
                {
                    return StatusCode(401, new ErrorResponse("Account is locked, please reset the password.", AuthenticationErrorCode.AccountLocked));
                }

                bool isSuccess = await _userAuthService.LogInAsync(request.Email, request.Password);

                if (!isSuccess)
                {
                    return StatusCode(401, new ErrorResponse("Incorrect email or password.", AuthenticationErrorCode.IncorrectCredentials));
                }

                return Created201(new ItemResponse<bool> { Item = isSuccess });
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, "An error occurred during login");
                return StatusCode(500, new ErrorResponse("An unexpected error occurred. Please try again later."));
            }
        }

        [HttpPost("resetPassword")]
        [AllowAnonymous]
        public async Task<ActionResult<SuccessResponse>> ResetPassword(EmailValidateRequest request)
        {
            ObjectResult result = null;

            try
            {
                IUserAuthData user = _userService.Get(request.Email);

                if (user != null)
                {
                    DateTime TokenExpirationDate = DateTime.UtcNow.AddHours(_emailConfig.TokenExpirationHours);
                    Guid token = _userTokenService.CreateToken(user.Id, UserTokenTypeEnum.PasswordReset, TokenExpirationDate);

                    await _emailService.UserPasswordReset(user, token.ToString());

                    SuccessResponse response = new SuccessResponse();
                    result = Ok200(response);
                }
                else
                {
                    int iCode = 404;
                    ErrorResponse response = new ErrorResponse("Email not found", AuthenticationErrorCode.UserNotFound);
                    result = StatusCode(iCode, response);
                }
            }
            catch (Exception ex)
            {

                Logger.LogError(ex.ToString());
                ErrorResponse response = new ErrorResponse(ex.Message);

                result = StatusCode(500, response);
            }

            return result;
        }

        [HttpGet("validateToken/{token}")]
        [AllowAnonymous]
        public ActionResult<ItemResponse<bool>> ValidateToken (string token)
        {
            int iCode = 200;
            BaseResponse response;

            try
            {
                UserToken userToken = _userTokenService.GetUserToken(token);

                if (userToken != null)
                {
                    bool isValid = DateTime.UtcNow <= userToken.Expiration;

                    response = new ItemResponse<bool> { Item = isValid };
                }
                else
                {
                    iCode = 404;
                    response = new ErrorResponse("Token not Found", AuthenticationErrorCode.TokenNotFound);
                }
            }
            catch (Exception ex)
            {

                iCode = 500;
                Logger.LogError(ex.ToString());
                response = new ErrorResponse($"Generic Error: {ex.Message}");
            }

            return StatusCode(iCode, response);
        }

        [HttpPut("changePassword")]
        [AllowAnonymous]
        public ActionResult<SuccessResponse> ChangePassword (UserUpdatePasswordRequest request)
        {
            int iCode = 200;
            BaseResponse response = null;

            try
            {
                UserToken userToken = _userTokenService.GetUserToken(request.Token);

                if (userToken != null)
                {
                    _userService.ChangePassword(userToken.UserId, request.Password);

                    _userTokenService.DeleteUserToken(userToken);

                    _userAuthService.RestartFailedAttempts(userToken.UserId);

                    response = new SuccessResponse();
                }
                else
                {
                    iCode = 404;
                    response = new ErrorResponse("Token not Found", AuthenticationErrorCode.TokenNotFound);
                }
            }
            catch (Exception ex)
            {
                iCode = 500;
                Logger.LogError(ex.ToString());
                response = new ErrorResponse($"Generic Error: {ex.Message}");
            }

            return StatusCode(iCode, response);
        }

        #endregion

        #region Private Endpoints

        [HttpGet("current")]
        public ActionResult<ItemResponse<IUserAuthData>> GetCurrrent()
        {
            int iCode = 200;
            BaseResponse response;

            try
            {
                IUserAuthData user = _webAuthService.GetCurrentUser();
                response = new ItemResponse<IUserAuthData>() { Item = user };
            }
            catch (Exception ex)
            {
                iCode = 500;
                Logger.LogError(ex.ToString());
                response = new ErrorResponse($"Generic Error: {ex.Message}");
            }

            return StatusCode(iCode, response);
        }

        [HttpPost("logout")]
        public async Task<ActionResult<SuccessResponse>> LogoutAsync()
        {
            ObjectResult result = null;

            try
            {
                await _webAuthService.LogOutAsync();

                SuccessResponse response = new SuccessResponse();
                result = Ok200(response);
   
            }
            catch (Exception ex)
            {
                Logger.LogError(ex.ToString());
                ErrorResponse response = new ErrorResponse(ex.Message);

                result = StatusCode(500, response);
            }

            return result;
        }

        #endregion

    }
}
