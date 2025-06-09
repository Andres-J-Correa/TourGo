using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Options;
using MySql.Data.MySqlClient;
using MySqlX.XDevAPI.Common;
using System.Security.Claims;
using TourGo.Models;
using TourGo.Models.Domain.Config;
using TourGo.Models.Domain.Config.Emails;
using TourGo.Models.Domain.Users;
using TourGo.Models.Enums;
using TourGo.Models.Requests;
using TourGo.Models.Requests.Users;
using TourGo.Services;
using TourGo.Services.Interfaces;
using TourGo.Services.Interfaces.Email;
using TourGo.Services.Interfaces.Security;
using TourGo.Services.Interfaces.Users;
using TourGo.Services.Security;
using TourGo.Web.Api.Extensions;
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
        private readonly IWebAuthenticationService<string> _webAuthService;
        private readonly IUserAuthService _userAuthService;
        private readonly IUserTokenService _userTokenService;
        private readonly IEmailService _emailService;
        private readonly IErrorLoggingService _errorLoggingService;
        private readonly IMemoryCache _cache;
        private readonly EncryptionConfig _encryptionConfig;
        private readonly EmailConfig _emailConfig;
        private readonly UsersPublicIdConfig _usersPublicIdConfig;

        public UsersAuthController(ILogger<UsersAuthController> logger, 
            IUserService userService, 
            IWebAuthenticationService<string> webAuthService, 
            IEmailService emailService, 
            IUserAuthService userAuthService , 
            IUserTokenService userTokenService, 
            IOptions<EmailConfig> emailConfig,
            IErrorLoggingService errorLoggingService,
            IMemoryCache memoryCache,
            IOptions<EncryptionConfig> encryptionOptions,
            IOptions<UsersPublicIdConfig> usersPublicIdOptions) : base(logger)
        {
            _userService = userService;
            _webAuthService = webAuthService;
            _emailService = emailService;
            _userAuthService = userAuthService;
            _userTokenService = userTokenService;
            _emailConfig = emailConfig.Value;
            _errorLoggingService = errorLoggingService;
            _encryptionConfig = encryptionOptions.Value;
            _cache = memoryCache;
            _usersPublicIdConfig = usersPublicIdOptions.Value;

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
                Logger.LogErrorWithDb(ex, _errorLoggingService, HttpContext);
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
                Logger.LogErrorWithDb(ex, _errorLoggingService, HttpContext);
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
                string? publicId = null;
                int attemptsMade = 0;

                do
                {
                    List<string> possiblePublicIds = PublicIdGeneratorService.GenerateSecureIds(_usersPublicIdConfig.NumberOfIdsToGenerate,
                                                                                                _usersPublicIdConfig.Length,
                                                                                                _usersPublicIdConfig.Characters);

                    List<string>? availablePublicIds = _userService.GetAvailablePublicIds(possiblePublicIds);

                    if (availablePublicIds != null && availablePublicIds.Count > 0)
                    {
                        publicId = availablePublicIds[0];
                    }

                    attemptsMade++;
                } while (publicId == null && attemptsMade < _usersPublicIdConfig.MaxAttempts );

                if(publicId == null)
                {
                    throw new Exception("Failed to generate a unique public ID after maximum attempts.");
                }

                int userId = _userService.Create(model, publicId);

                ItemResponse<int> response = new ItemResponse<int>() { Item = userId };

                return Created201(response);

            }
            catch (MySqlException dbEx)
            {
                ErrorResponse error;

                if (Enum.IsDefined(typeof(UserManagementErrorCode), dbEx.Number))
                {
                    error = new ErrorResponse((UserManagementErrorCode)dbEx.Number);
                }
                else
                {
                    error = new ErrorResponse();
                    Logger.LogErrorWithDb(dbEx, _errorLoggingService, HttpContext);
                }
                return StatusCode(500, error);
            }
            catch (Exception ex)
            {
                Logger.LogErrorWithDb(ex, _errorLoggingService, HttpContext);
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
                    return StatusCode(400, new ErrorResponse("Incorrect email or password.", AuthenticationErrorCode.IncorrectCredentials));
                }

                if (_userAuthService.IsLoginBlocked(model.Email))
                {
                    return StatusCode(403, new ErrorResponse("Account is locked, please reset the password.", AuthenticationErrorCode.AccountLocked));
                }

                bool isSuccess = await _userAuthService.LogInAsync(model.Email, model.Password);

                if (!isSuccess)
                {
                    return StatusCode(400, new ErrorResponse("Incorrect email or password.", AuthenticationErrorCode.IncorrectCredentials));
                }

                return Created201(new ItemResponse<bool> { Item = isSuccess });
            }
            catch (Exception ex)
            {
                Logger.LogErrorWithDb(ex, _errorLoggingService, HttpContext);
                return StatusCode(500, new ErrorResponse());
            }
        }

        [HttpPost("password/forgot")]
        [AllowAnonymous]
        public async Task<ActionResult<SuccessResponse>> ForgotPassword(EmailValidateRequest model)
        {
            ObjectResult result = null;

            try
            {
                IUserAuthData user = _userService.Get(model.Email);

                if (user != null)
                {
                    DateTime TokenExpirationDate = DateTime.UtcNow.AddHours(_emailConfig.PasswordResetExpirationHours);
                    Guid token = _userTokenService.CreateToken(user.PublicId, UserTokenTypeEnum.PasswordReset, TokenExpirationDate);

                    await _emailService.UserPasswordReset(user, token.ToString());
                }

                SuccessResponse response = new SuccessResponse();
                result = Ok200(response);

            }
            catch (Exception ex)
            {

                Logger.LogErrorWithDb(ex, _errorLoggingService, HttpContext);
                ErrorResponse response = new ErrorResponse();

                result = StatusCode(500, response);
            }

            return result;
        }

        [HttpPut("password/reset")]
        [AllowAnonymous]
        public ActionResult<SuccessResponse> ResetPassword (UserPasswordResetRequest model)
        {
            int iCode = 200;
            BaseResponse response = null;

            try
            {
                UserToken? userToken = _userTokenService.GetUserToken(model.Token);

                IUserAuthData user = _userService.Get(model.Email);

                if (userToken != null && model.Email == user.Email && userToken.TokenType == UserTokenTypeEnum.PasswordReset)
                {
                    _userService.ResetPassword(user.PublicId, model.Password);

                    _userTokenService.DeleteUserToken(userToken);

                    _userAuthService.RestartFailedAttempts(user.PublicId);

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
                Logger.LogErrorWithDb(ex, _errorLoggingService, HttpContext);
                response = new ErrorResponse();
            }

            return StatusCode(iCode, response);
        }

        #endregion

        #region Private Endpoints

        [HttpPut]
        public ActionResult<SuccessResponse> Update(UserUpdateRequest model)
        {
            try
            {
                string userId = _webAuthService.GetCurrentUserId();
                _userService.Update(model, userId);

                string cacheKey = $"UserPII_{userId}_v{_encryptionConfig.UserPIICacheVersion ?? "v1"}";
                _cache.Remove(cacheKey);

                return Ok200(new SuccessResponse());
            }
            catch (MySqlException dbEx)
            {
                ErrorResponse error;

                if (Enum.IsDefined(typeof(UserManagementErrorCode), dbEx.Number))
                {
                    error = new ErrorResponse((UserManagementErrorCode)dbEx.Number);
                }
                else
                {
                    error = new ErrorResponse();
                    Logger.LogErrorWithDb(dbEx, _errorLoggingService, HttpContext);
                }
                return StatusCode(500, error);
            }
            catch (Exception ex)
            {
                Logger.LogErrorWithDb(ex, _errorLoggingService, HttpContext);
                ErrorResponse errorResponse = new ErrorResponse();
                return StatusCode(500, errorResponse);
            }
        }

        [HttpPut("password/change")]
        public ActionResult<SuccessResponse> ChangePassword(UserPasswordChangeRequest model)
        {
            int iCode = 200;
            BaseResponse response;
            try
            {
                IUserAuthData user = _webAuthService.GetCurrentUser();
                _userAuthService.ChangePassword(user, model);
                response = new SuccessResponse();
            }
            catch (UnauthorizedAccessException uaEx)
            {
                response = new ErrorResponse(uaEx.Message, AuthenticationErrorCode.IncorrectCredentials);
                iCode = 400;
            }
            catch (Exception ex)
            {
                iCode = 500;
                Logger.LogErrorWithDb(ex, _errorLoggingService, HttpContext);
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
                Logger.LogErrorWithDb(ex, _errorLoggingService, HttpContext);
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
                Logger.LogErrorWithDb(ex, _errorLoggingService, HttpContext);
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
                    Guid token = _userTokenService.CreateToken(user.PublicId, UserTokenTypeEnum.EmailVerification, TokenExpirationDate);

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

                Logger.LogErrorWithDb(ex, _errorLoggingService, HttpContext);
                ErrorResponse response = new ErrorResponse();

                result = StatusCode(500, response);
            }

            return result;
        }

        [HttpPost("email/verify")]
        public ActionResult<SuccessResponse> VerifyEmail(TokenValidationRequest model)
        {
            try
            {
                IUserAuthData user = _webAuthService.GetCurrentUser();

                UserToken? userToken = _userTokenService.GetUserToken(user.PublicId, UserTokenTypeEnum.EmailVerification);

                if (userToken == null)
                {
                    return NotFound404(new ErrorResponse("Token not found", AuthenticationErrorCode.TokenNotFound));
                }
                else if (userToken.Expiration <= DateTime.UtcNow)
                {
                    return StatusCode(400, new ErrorResponse("Token expired"));
                }
                else if (userToken.Token != model.Token)
                {
                    return StatusCode(400, new ErrorResponse("Invalid token"));
                }

                _userService.UpdateIsVerified(user.PublicId, true);
                Claim verified = new Claim("https://tourgo.site/claims/isverified", "True", ClaimValueTypes.Boolean);
                _webAuthService.LogInAsync(user, [verified]);

                return Ok200(new SuccessResponse());
            }
            catch (Exception ex)
            {

                Logger.LogErrorWithDb(ex, _errorLoggingService, HttpContext);
                ErrorResponse response = new ErrorResponse();

                return StatusCode(500, response);

            }
        }


        #endregion

    }
}
