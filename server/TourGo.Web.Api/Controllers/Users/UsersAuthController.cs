using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using TourGo.Models;
using TourGo.Models.Requests.Users;
using TourGo.Services;
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

        public UsersAuthController(ILogger<UsersAuthController> logger, IUserService userService, IAuthenticationService<int> authService) : base(logger)
        {
            _userService = userService;
            _authService = authService;
        }

        #region Public Endpoints

        [HttpPost("exists")]
        [AllowAnonymous]
        public ActionResult<ItemResponse<bool>> UserExists(UserValidateRequest request)
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
