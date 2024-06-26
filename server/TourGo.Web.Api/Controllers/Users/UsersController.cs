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
    [Route("api/users")]
    [ApiController]
    public class UsersController : BaseApiController
    {
        private readonly IUserService _userService;
        private readonly IAuthenticationService<int> _authService;

        public UsersController(ILogger<UsersController> logger, IUserService userService, IAuthenticationService<int> authService) : base(logger)
        {
            _userService = userService;
            _authService = authService;
        }

        #region Public Endpoints

        [HttpGet("exists")]
        [AllowAnonymous]
        public ActionResult<SuccessResponse> UserExists(UserValidateRequest request)
        {
            int iCode = 200;
            BaseResponse response = null;

            try
            {
                bool exists = _userService.UserExists(request.Email);

                if (!exists)
                {
                    iCode = 404;
                    response = new ErrorResponse("User not found");
                }
                else
                {
                    response = new SuccessResponse();
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

        [HttpPost]
        [AllowAnonymous]
        public ActionResult<SuccessResponse> Create(UserAddRequest request)
        {
            ObjectResult result = null;

            try
            {

                bool userExists = _userService.UserExists(request.Email);

                if (!userExists)
                {
                    int userId = _userService.Create(request);

                    ItemResponse<int> response = new ItemResponse<int>() { Item = userId };

                    result = Created201(response);
                }
                else
                {
                    ErrorResponse response = new ErrorResponse("Email already exists");
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

        [HttpGet("logout")]
        public async Task<ActionResult<SuccessResponse>> LogoutAsync()
        {
            int iCode = 200;
            BaseResponse response;

            try
            {
                await _authService.LogOutAsync();

                response = new SuccessResponse();
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

    }
}
