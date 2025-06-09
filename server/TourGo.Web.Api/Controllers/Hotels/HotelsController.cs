using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using TourGo.Models.Domain;
using TourGo.Models.Domain.Hotels;
using TourGo.Models.Enums;
using TourGo.Models.Requests.Hotels;
using TourGo.Services;
using TourGo.Services.Interfaces.Hotels;
using TourGo.Web.Controllers;
using TourGo.Web.Core.Filters;
using TourGo.Web.Models.Responses;
using TourGo.Web.Api.Extensions;
using TourGo.Services.Interfaces;
using TourGo.Models.Domain.Finances;
using TourGo.Services.Finances;
using TourGo.Models.Requests.Finances;
using MySql.Data.MySqlClient;
using MySqlX.XDevAPI.Common;
using TourGo.Web.Models.Enums;

namespace TourGo.Web.Api.Controllers.Hotels
{
    [Route("api/hotels")]
    [ApiController]
    public class HotelsController : BaseApiController
    {
        private readonly IWebAuthenticationService<string> _webAuthService;
        private readonly IHotelService _hotelService;
        private readonly IErrorLoggingService _errorLoggingService;

        public HotelsController(ILogger<HotelsController> logger, 
            IWebAuthenticationService<string> webAuthenticationService, 
            IHotelService hotelService,
            IErrorLoggingService errorLoggingService) : base(logger)
        {
            _webAuthService = webAuthenticationService;
            _hotelService = hotelService;
            _errorLoggingService = errorLoggingService;
        }

        #region hotel
        [HttpPost]
        [VerifiedUser]
        public ActionResult<ItemResponse<int>> Create(HotelAddRequest model)
        {
            ObjectResult result = null;

            try
            {
                string userId = _webAuthService.GetCurrentUserId();

                int id = _hotelService.Create(model, userId);

                if (id == 0)
                {
                    throw new Exception("Failed to create hotel");
                }

                ItemResponse<int> response = new ItemResponse<int>() { Item = id };
                result = Created201(response);
            }
            catch (Exception ex)
            {
                Logger.LogErrorWithDb(ex, _errorLoggingService, HttpContext);
                ErrorResponse response = new ErrorResponse();

                result = StatusCode(500, response);
            }

            return result;
        }

        [HttpGet("details/{id:int}")]
        [EntityAuth(EntityTypeEnum.Hotels, EntityActionTypeEnum.Read)]
        public ActionResult<ItemResponse<Hotel>> GetDetails(int id)
        {
            int code = 200;
            BaseResponse response;

            try
            {
                Hotel ? hotel = _hotelService.GetDetails(id);

                if (hotel == null)
                {
                    code = 404;
                    response = new ErrorResponse("Application Resource not found.");
                }
                else
                {
                    response = new ItemResponse<Hotel> { Item = hotel };
                }
            }
            catch (Exception ex)
            {

                code = 500;
                Logger.LogErrorWithDb(ex, _errorLoggingService, HttpContext);
                response = new ErrorResponse();
            }

            return StatusCode(code, response);
        }


        [HttpGet]
        public ActionResult<ItemsResponse<Lookup>> GetUserHotels()
        {
            BaseResponse response;

            try
            {
                string userId = _webAuthService.GetCurrentUserId();

                List<Lookup>? hotels = _hotelService.GetUserHotelsMinimal(userId);

                if (hotels == null)
                {
                
                    response = new ErrorResponse("Application Resource not found.");
                    return NotFound404(response);
                }
                else
                {
                    response = new ItemsResponse<Lookup> { Items = hotels };
                    return Ok200(response);
                }
            }
            catch (Exception ex)
            {
                Logger.LogErrorWithDb(ex, _errorLoggingService, HttpContext);
                response = new ErrorResponse();
                return StatusCode(500, response);
            }
        }

        [HttpGet("{id:int}")]
        [EntityAuth(EntityTypeEnum.Hotels, EntityActionTypeEnum.Read)]
        public ActionResult<ItemResponse<Lookup>> GetMinimal(int id)
        {
            int code = 200;
            BaseResponse response;

            try
            {
                Lookup? lookup = _hotelService.GetMinimal(id);

                if (lookup == null)
                {
                    code = 404;
                    response = new ErrorResponse("Application Resource not found.");
                }
                else
                {
                    response = new ItemResponse<Lookup> { Item = lookup };
                }
            }
            catch (Exception ex)
            {
                code = 500;
                Logger.LogErrorWithDb(ex, _errorLoggingService, HttpContext);
                response = new ErrorResponse();
            }

            return StatusCode(code, response);
        }

        [HttpGet("minimal/{id:int}")]
        [EntityAuth(EntityTypeEnum.Hotels, EntityActionTypeEnum.Read)]
        public ActionResult<ItemResponse<HotelMinimalWithUserRole>> GetMinimalWithUserRole(int id)
        {
            int code = 200;
            BaseResponse response;

            try
            {
                string userId = _webAuthService.GetCurrentUserId();
                HotelMinimalWithUserRole? hotel = _hotelService.GetMinimalWithUserRole(id, userId);

                if (hotel == null)
                {
                    code = 404;
                    response = new ErrorResponse("Application Resource not found.");
                }
                else
                {
                    response = new ItemResponse<HotelMinimalWithUserRole> { Item = hotel };
                }
            }
            catch (Exception ex)
            {
                code = 500;
                Logger.LogErrorWithDb(ex, _errorLoggingService, HttpContext);
                response = new ErrorResponse();
            }

            return StatusCode(code, response);
        }

        [HttpPut("{id:int}")]
        [EntityAuth(EntityTypeEnum.Hotels, EntityActionTypeEnum.Update)]
        public ActionResult<SuccessResponse> Update(HotelUpdateRequest model)
 {
            int code = 200;
            BaseResponse response = null;

            try
            {
                string userId = _webAuthService.GetCurrentUserId();
                _hotelService.Update(model, userId);

                response = new SuccessResponse();
            }
            catch (Exception ex)
            {
                code = 500;
                response = new ErrorResponse();
                Logger.LogErrorWithDb(ex, _errorLoggingService, HttpContext);
            }

            return StatusCode(code, response);
        }


        [HttpDelete("{id:int}")]
        [EntityAuth(EntityTypeEnum.Hotels, EntityActionTypeEnum.Delete)]
        public ActionResult<SuccessResponse> Delete(int id)
        {
            int code = 200;
            BaseResponse response = null;

            try
            {
                string userId = _webAuthService.GetCurrentUserId();
                _hotelService.Delete(id, userId);

                response = new SuccessResponse();
            }
            catch (Exception ex)
            {
                code = 500;
                response = new ErrorResponse();
                Logger.LogErrorWithDb(ex, _errorLoggingService, HttpContext);
            }

            return StatusCode(code, response);
        }

        [HttpGet("roles/permissions")]
        public ActionResult<ItemsResponse<RolePermission>> GetRolePermissions()
        {
            int code = 200;
            BaseResponse response;

            try
            {
                List<RolePermission>? permissions = _hotelService.GetRolePermissions();

                if (permissions == null)
                {
                    code = 404;
                    response = new ErrorResponse("Application Resource not found.");
                }
                else
                {
                    response = new ItemsResponse<RolePermission> { Items = permissions };
                }
            }
            catch (Exception ex)
            {
                code = 500;
                Logger.LogErrorWithDb(ex, _errorLoggingService, HttpContext);
                response = new ErrorResponse();
            }

            return StatusCode(code, response);
        }
        #endregion
    }
}
