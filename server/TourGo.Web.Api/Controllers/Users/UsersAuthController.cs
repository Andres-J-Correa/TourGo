using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using System.Security.Claims;
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
        public ActionResult<ItemResponse<bool>> UserExists(EmailValidateRequest model)
        {

            ObjectResult result = null;

            try
            {
                bool exists = _userService.UserExists(model.Email);

                ItemResponse<bool> response = new ItemResponse<bool> { Item = exists };

                result = Ok200(response);
            }
            catch (Exception ex)
            {

                int iCode = 500;
                Logger.LogError(ex.ToString());
                ErrorResponse response = new ErrorResponse();
                result = StatusCode(iCode, response);
            }

            return result;
        }

        [HttpPost("exists/phone")]
        [AllowAnonymous]
        public ActionResult<ItemResponse<bool>> PhoneExists(PhoneValidateRequest model)
        {

            ObjectResult result = null;

            try
            {
                bool exists = _userService.PhoneExists(model.Phone);

                ItemResponse<bool> response = new ItemResponse<bool> { Item = exists };

                result = Ok200(response);
            }
            catch (Exception ex)
            {

                int iCode = 500;
                Logger.LogError(ex.ToString());
                ErrorResponse response = new ErrorResponse();
                result = StatusCode(iCode, response);
            }

            return result;
        }

        [HttpPost]
        [AllowAnonymous]
        public ActionResult<ItemResponse<int>> Create(UserAddRequest model)
        {
            try
            {

                bool userExists = _userService.UserExists(model.Email);

                if (userExists)
                {
                    ErrorResponse errorResponse = new ErrorResponse("Email already exists", UserManagementErrorCode.EmailAlreadyExists);
                    return StatusCode(409, errorResponse);
                }

                bool phoneExists = _userService.PhoneExists(model.Phone);

                if (phoneExists)
                {
                    ErrorResponse errorResponse = new ErrorResponse("Phone already exists", UserManagementErrorCode.PhoneAlreadyExists);
                    return StatusCode(409, errorResponse);
                }

                int userId = _userService.Create(model);

                ItemResponse<int> response = new ItemResponse<int>() { Item = userId };

                return Created201(response);

            }
            catch (Exception ex)
            {
                Logger.LogError(ex.ToString());
                ErrorResponse errorResponse = new ErrorResponse();

                return StatusCode(500, errorResponse);
            }
        }

        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<ActionResult<ItemResponse<bool>>> LoginAsync(UserLoginRequest model)
        {
            try
            {
                if (!_userService.UserExists(model.Email))
                {
                    return StatusCode(401, new ErrorResponse("User not found.", AuthenticationErrorCode.UserNotFound));
                }

                if (_userAuthService.IsLoginBlocked(model.Email))
                {
                    return StatusCode(401, new ErrorResponse("Account is locked, please reset the password.", AuthenticationErrorCode.AccountLocked));
                }

                bool isSuccess = await _userAuthService.LogInAsync(model.Email, model.Password);

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

        [HttpPost("password/reset")]
        [AllowAnonymous]
        public async Task<ActionResult<SuccessResponse>> ResetPassword(EmailValidateRequest model)
        {
            ObjectResult result = null;

            try
            {
                IUserAuthData user = _userService.Get(model.Email);

                if (user != null)
                {
                    DateTime TokenExpirationDate = DateTime.UtcNow.AddHours(_emailConfig.PasswordResetExpirationHours);
                    Guid token = _userTokenService.CreateToken(user.Id, UserTokenTypeEnum.PasswordReset, TokenExpirationDate);

                    await _emailService.UserPasswordReset(user, token.ToString());

                    SuccessResponse response = new SuccessResponse();
                    result = Ok200(response);
                }
                else
                {
                    ErrorResponse response = new ErrorResponse("Email not found", AuthenticationErrorCode.UserNotFound);
                    result = NotFound404(response);
                }
            }
            catch (Exception ex)
            {

                Logger.LogError(ex.ToString());
                ErrorResponse response = new ErrorResponse();

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
                UserToken? userToken = _userTokenService.GetUserToken(token);

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
                response = new ErrorResponse();
            }

            return StatusCode(iCode, response);
        }

        [HttpPut("password/change")]
        [AllowAnonymous]
        public ActionResult<SuccessResponse> ChangePassword (UserUpdatePasswordRequest model)
        {
            int iCode = 200;
            BaseResponse response = null;

            try
            {
                UserToken? userToken = _userTokenService.GetUserToken(model.Token);

                if (userToken != null)
                {
                    _userService.ChangePassword(userToken.UserId, model.Password);

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
                response = new ErrorResponse();
            }

            return StatusCode(iCode, response);
        }

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
                response = new ErrorResponse();
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
                ErrorResponse response = new ErrorResponse();

                result = StatusCode(500, response);
            }

            return result;
        }

        [HttpPost("email/verify/request")]
        public async Task<ActionResult<SuccessResponse>> RequestEmailVerification()
        {
            ObjectResult result = null;

            try
            {
                IUserAuthData user = _webAuthService.GetCurrentUser();

                if (user != null)
                {
                    DateTime TokenExpirationDate = DateTime.UtcNow.AddHours(_emailConfig.EmailVerificationExpirationHours);
                    Guid token = _userTokenService.CreateToken(user.Id, UserTokenTypeEnum.EmailVerification, TokenExpirationDate);

                    await _emailService.UserEmailVerification(user, token.ToString());

                    SuccessResponse response = new SuccessResponse();
                    result = Ok200(response);
                }
                else
                {
                    ErrorResponse response = new ErrorResponse("User not found", AuthenticationErrorCode.UserNotFound);
                    result = NotFound404(response);
                }
            }
            catch (Exception ex)
            {

                Logger.LogError(ex.ToString());
                ErrorResponse response = new ErrorResponse();

                result = StatusCode(500, response);
            }

            return result;
        }

        [HttpGet("email/verify/{token}")]
        public ActionResult<SuccessResponse> VerifyEmail(string token)
        { 
            try
            {
                IUserAuthData user = _webAuthService.GetCurrentUser();

                UserToken? userToken = _userTokenService.GetUserToken(user.Id, UserTokenTypeEnum.EmailVerification);

                if(userToken == null)
                {
                    return NotFound404(new ErrorResponse("Token not found", AuthenticationErrorCode.TokenNotFound));
                }
                else if (userToken.Expiration <= DateTime.UtcNow)
                {
                    return StatusCode(400, new ErrorResponse("Token expired"));
                }
                else if (userToken.Token != token)
                {
                    return StatusCode(400, new ErrorResponse("Invalid token"));
                }

                _userService.UpdateIsVerified(user.Id, true);
                Claim verified = new Claim("https://tourgo.site/claims/isverified", "True", ClaimValueTypes.Boolean);
                _webAuthService.LogInAsync(user, [verified]);

                return Ok200(new SuccessResponse());
            }
            catch (Exception)
            {

                throw;
            }
        }


        #endregion

        #region Private Endpoints

        #endregion

    }
}
