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
using TourGo.Web.Controllers;
using TourGo.Web.Models.Responses;

namespace TourGo.Web.Api.Controllers.Users
{
    [Route("api/users/auth")]
    [ApiController]
    public class UsersAuthController : BaseApiController
    {
        private readonly IUserService _userService;
        private readonly IAuthenticationService<int> _authService;
        private readonly IEmailService _emailService;
        private readonly EmailConfig _emailConfig;

        public UsersAuthController(ILogger<UsersAuthController> logger, IUserService userService, IAuthenticationService<int> authService, IEmailService emailService, IOptions<EmailConfig> emailConfig) : base(logger)
        {
            _userService = userService;
            _authService = authService;
            _emailService = emailService;
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
            ObjectResult result = null;

            try
            {

                bool userExists = _userService.UserExists(request.Email);

                bool phoneExists = _userService.PhoneExists(request.Phone);

                if (!userExists && !phoneExists)
                {
                    int userId = _userService.Create(request);

                    ItemResponse<int> response = new ItemResponse<int>() { Item = userId };

                    result = Created201(response);
                }
                else
                {
                    List<string> errors = new List<string>();
                    if (userExists) errors.Add("Email already exists");
                    if (phoneExists) errors.Add("Phone already exists");

                    ErrorResponse response = new ErrorResponse(errors);
                    result = StatusCode(409, response);
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

        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<ActionResult<ItemResponse<bool>>> LoginAsync(UserLoginRequest request)
        {
            ObjectResult result = null;

            try
            {

                bool isSuccess = await _userService.LogInAsync(request.Email, request.Password);

                if (isSuccess)
                {
                    ItemResponse<bool> response = new ItemResponse<bool>() { Item = isSuccess };
                    result = Created201(response);
                }
                else
                {
                    ErrorResponse response = new ErrorResponse($"Incorrect email or password.");
                    result = StatusCode(401, response);
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
                    Guid token = _userService.CreateToken(user.Id, UserTokenTypeEnum.PasswordReset, TokenExpirationDate);

                    await _emailService.UserPasswordReset(user, token.ToString());

                    SuccessResponse response = new SuccessResponse();
                    result = Ok200(response);
                }
                else
                {
                    int iCode = 404;
                    ErrorResponse response = new ErrorResponse("Email not found");
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
                UserToken userToken = _userService.GetUserToken(token);

                if (userToken != null)
                {
                    bool isValid = DateTime.UtcNow <= userToken.Expiration;

                    response = new ItemResponse<bool> { Item = isValid };
                }
                else
                {
                    iCode = 404;
                    response = new ErrorResponse("Token not Found");
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
                UserToken userToken = _userService.GetUserToken(request.Token);

                if (userToken != null)
                {
                    _userService.ChangePassword(userToken.UserId, request.Password);

                    _userService.DeleteUserToken(userToken);

                    response = new SuccessResponse();
                }
                else
                {
                    iCode = 404;
                    response = new ErrorResponse("Token not Found");
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
                IUserAuthData user = _authService.GetCurrentUser();
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
                await _authService.LogOutAsync();

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
