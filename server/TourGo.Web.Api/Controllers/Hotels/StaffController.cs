using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using TourGo.Models.Domain.Staff;
using TourGo.Models.Enums;
using TourGo.Services;
using TourGo.Services.Interfaces;
using TourGo.Services.Interfaces.Hotels;
using TourGo.Web.Controllers;
using TourGo.Web.Core.Filters;
using TourGo.Web.Models.Responses;
using TourGo.Web.Api.Extensions;
using TourGo.Models;
using TourGo.Models.Requests.Staff;
using MySql.Data.MySqlClient;
using TourGo.Web.Models.Enums;
using TourGo.Models.Domain;
using TourGo.Services.Interfaces.Email;
using TourGo.Models.Domain.Users;

namespace TourGo.Web.Api.Controllers.Hotels
{
    [Route("api/staff")]
    [ApiController]
    public class StaffController : BaseApiController
    {
        private readonly IStaffService _staffService;
        private readonly IErrorLoggingService _errorLoggingService;
        private readonly IWebAuthenticationService<string> _webAuthService;
        private readonly IHotelService _hotelService;
        private readonly IEmailService _emailService;

        public StaffController(ILogger<StaffController> logger, 
                            IStaffService staffService,
                            IErrorLoggingService errorLoggingService,
                            IWebAuthenticationService<string> webAuthService,
                            IHotelService hotelService,
                            IEmailService emailService) : base(logger)
        {
            _staffService = staffService;
            _errorLoggingService = errorLoggingService;
            _webAuthService = webAuthService;
            _hotelService = hotelService;
            _emailService = emailService;
        }

        [HttpGet("hotel/{id:int}")]
        [EntityAuth(EntityTypeEnum.Hotels, EntityActionTypeEnum.Read, isBulk: true)]
        public ActionResult<ItemsResponse<Staff>> GetByHotelId (int id)
        {
            try
            {
                List<Staff>? staffList = _staffService.GetByHotelId(id);

                if (staffList == null)
                {
                    ErrorResponse response = new ErrorResponse("No staff found for the specified hotel.");
                    return NotFound404(response);
                } else
                {
                    ItemsResponse<Staff> response = new ItemsResponse<Staff> { Items = staffList };
                    return Ok200(response);
                }
            }
            catch (Exception ex)
            {
                Logger.LogErrorWithDb(ex, _errorLoggingService, HttpContext);
                ErrorResponse response = new();
                return StatusCode(500, response);
            }
        }

        [HttpDelete("hotel/{hotelId:int}/user/{userId}")]
        public ActionResult<SuccessResponse> RemoveStaff(int hotelId, string userId)
        {
            try
            {
                string modifiedBy = _webAuthService.GetCurrentUserId();
                _staffService.RemoveStaff(userId, hotelId, modifiedBy);
                return Ok200(new SuccessResponse());
            }
            catch (MySqlException dbEx)
            {
                ErrorResponse error;

                if (Enum.IsDefined(typeof(HotelManagementErrorCode), dbEx.Number))
                {
                    error = new ErrorResponse((HotelManagementErrorCode)dbEx.Number);
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
                ErrorResponse response = new();
                return StatusCode(500, response);
            }
        }

        [HttpPatch("hotel/{hotelId:int}/user/{userId}/role/{role:int}")]
        public ActionResult<SuccessResponse> UpdateStaffRole(int hotelId, string userId, StaffRoleEnum role)
        {
            try
            {
                string modifiedBy = _webAuthService.GetCurrentUserId();
                _staffService.UpdateStaffRole(userId, hotelId, (int)role, modifiedBy);
                return Ok200(new SuccessResponse());
            }
            catch (MySqlException dbEx)
            {
                ErrorResponse error;

                if (Enum.IsDefined(typeof(HotelManagementErrorCode), dbEx.Number))
                {
                    error = new ErrorResponse((HotelManagementErrorCode)dbEx.Number);
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
                ErrorResponse response = new();
                return StatusCode(500, response);
            }
        }

        [HttpGet("hotel/{id:int}/invites")]
        [EntityAuth(EntityTypeEnum.HotelInvites, EntityActionTypeEnum.Read, isBulk: true)]
        public ActionResult<ItemsResponse<StaffInvite>> GetInvitesByHotelId(int id)
        {
            try
            {
                List<StaffInvite>? invites = _staffService.GetInvitesByHotelId(id);

                if (invites == null)
                {
                    ErrorResponse response = new ErrorResponse("No invites found");
                    return NotFound404(response);
                }
                else
                {
                    ItemsResponse<StaffInvite> response = new ItemsResponse<StaffInvite> { Items = invites };
                    return Ok200(response);
                }
            }
            catch (Exception ex)
            {
                Logger.LogErrorWithDb(ex, _errorLoggingService, HttpContext);
                ErrorResponse response = new();
                return StatusCode(500, response);
            }
        }

        [HttpGet("invites")]
        [VerifiedUser]
        public ActionResult<ItemsResponse<StaffInvite>> GetCurrentUserInvites()
        {
            try
            {
                IUserAuthData user = _webAuthService.GetCurrentUser();

                List<StaffInvite>? invites = _staffService.GetInvitesByEmail(user.Email);

                if (invites == null)
                {
                    ErrorResponse response = new ErrorResponse("No invites found");
                    return NotFound404(response);
                }
                else
                {
                    ItemsResponse<StaffInvite> response = new ItemsResponse<StaffInvite> { Items = invites };
                    return Ok200(response);
                }
            }
            catch (Exception ex)
            {
                Logger.LogErrorWithDb(ex, _errorLoggingService, HttpContext);
                ErrorResponse response = new();
                return StatusCode(500, response);
            }
        }

        [HttpPost("hotel/{hotelId:int}/leave")]
        public ActionResult<SuccessResponse> LeaveHotel(int hotelId)
        {
            try
            {
                string userId = _webAuthService.GetCurrentUserId();
                _staffService.LeaveHotel(userId, hotelId);
                return Ok200(new SuccessResponse());
            }
            catch (Exception ex)
            {
                Logger.LogErrorWithDb(ex, _errorLoggingService, HttpContext);
                ErrorResponse response = new();
                return StatusCode(500, response);
            }
        }

        [HttpPost("hotel/{id:int}/invites")]
        [EntityAuth(EntityTypeEnum.HotelInvites, EntityActionTypeEnum.Create)]
        public ActionResult<ItemResponse<int>> AddInvite(int id, StaffInvitationRequest model)
        {
            try
            {
                string userId = _webAuthService.GetCurrentUserId();
                int inviteId = _staffService.AddInvite(model, id, userId);

                if (inviteId <= 0)
                {
                    throw new Exception("Failed to create staff invite.");
                }

                Lookup? hotel = _hotelService.GetMinimal(id);

                if( hotel != null)
                {
                    string roleName = EnumLocalizationHelper.GetLocalizedEnumDisplayName((Enums.Staff.StaffRoleEnum)model.RoleId);
                    _emailService.HotelStaffInvitation(model.Email, hotel.Name, roleName);
                }

                ItemResponse<int> response = new ItemResponse<int> { Item = inviteId };
                return Created201(response);
            }
            catch (MySqlException dbEx)
            {
                ErrorResponse error;

                if (Enum.IsDefined(typeof(HotelManagementErrorCode), dbEx.Number))
                {
                    error = new ErrorResponse((HotelManagementErrorCode)dbEx.Number);
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
                ErrorResponse response = new();
                return StatusCode(500, response);
            }
        }

        [HttpDelete("invites/{id:int}")]
        public ActionResult<SuccessResponse> DeleteInvite(int id)
        {
            try
            {
                _staffService.DeleteInvite(id);
                return Ok200(new SuccessResponse());
            }
            catch (MySqlException dbEx)
            {
                ErrorResponse error;

                if (Enum.IsDefined(typeof(HotelManagementErrorCode), dbEx.Number))
                {
                    error = new ErrorResponse((HotelManagementErrorCode)dbEx.Number);
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
                ErrorResponse response = new();
                return StatusCode(500, response);
            }
        }

        [VerifiedUser]
        [HttpPost("invites/{id:int}/accept")]
        public ActionResult<SuccessResponse> AcceptInvite(int id)
        {
            try
            {
                string userId = _webAuthService.GetCurrentUserId();
                _staffService.AcceptInvite(id, userId);

                return Ok200(new SuccessResponse());
            }
            catch (MySqlException dbEx)
            {
                ErrorResponse error;

                if (Enum.IsDefined(typeof(HotelManagementErrorCode), dbEx.Number))
                {
                    error = new ErrorResponse((HotelManagementErrorCode)dbEx.Number);
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
                ErrorResponse response = new();
                return StatusCode(500, response);
            }
        }

        [VerifiedUser]
        [HttpPost("invites/{id:int}/reject")]
        public ActionResult<SuccessResponse> RejectInvite(int id)
        {
            try
            {
                string userId = _webAuthService.GetCurrentUserId();
                _staffService.RejectInvite(id, userId);

                return Ok200(new SuccessResponse());
            }
            catch (MySqlException dbEx)
            {
                ErrorResponse error;

                if (Enum.IsDefined(typeof(HotelManagementErrorCode), dbEx.Number))
                {
                    error = new ErrorResponse((HotelManagementErrorCode)dbEx.Number);
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
                ErrorResponse response = new();
                return StatusCode(500, response);
            }
        }
    }
}
