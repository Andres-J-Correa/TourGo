using Microsoft.AspNetCore.Mvc;
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
using MySql.Data.MySqlClient;
using TourGo.Web.Models.Enums;

namespace TourGo.Web.Api.Controllers.Hotels
{
    [Route("api/rooms")]
    [ApiController]
    public class RoomsController : BaseApiController
    {
        private readonly IWebAuthenticationService<int> _webAuthService;
        private readonly IRoomService _roomService;
        private readonly IErrorLoggingService _errorLoggingService;

        public RoomsController(ILogger<RoomsController> logger, 
                                IWebAuthenticationService<int> webAuthenticationService, 
                                IRoomService roomService,
                                IErrorLoggingService errorLoggingService) : base(logger)
        {
            _webAuthService = webAuthenticationService;
            _roomService = roomService;
            _errorLoggingService = errorLoggingService;
        }

        [HttpPost("hotel/{id:int}")]
        [EntityAuth(EntityTypeEnum.Rooms, EntityActionTypeEnum.Create)]
        public ActionResult<ItemResponse<int>> Create(RoomAddUpdateRequest model)
        {
            ObjectResult result = null;

            try
            {
                int userId = _webAuthService.GetCurrentUserId();

                int roomId = _roomService.Create(model, userId);

                if (roomId == 0)
                {
                    throw new Exception("Failed to create room");
                }

                ItemResponse<int> response = new ItemResponse<int>() { Item = roomId };
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

        [HttpGet("hotel/{id:int}")]
        [EntityAuth(EntityTypeEnum.Rooms, EntityActionTypeEnum.Read, isBulk: true)]
        public ActionResult<ItemsResponse<Room>> GetByHotel(int id, [FromQuery] bool? isActive)
        {
            int code = 200;
            BaseResponse response = null;

            try
            {
                List<Room>? list = _roomService.GetByHotel(id, isActive);

                if (list == null)
                {
                    code = 404;
                    response = new ErrorResponse("App Resource not found.");
                }
                else
                {
                    response = new ItemsResponse<Room> { Items = list };
                }
            }
            catch (Exception ex)
            {
                code = 500;
                response = new ErrorResponse();
                Logger.LogErrorWithDb(ex, _errorLoggingService, HttpContext);
            }


            return StatusCode(code, response);

        }

        [HttpPut("{id:int}")]
        [EntityAuth(EntityTypeEnum.Rooms, EntityActionTypeEnum.Update)]
        public ActionResult<SuccessResponse> Update(RoomAddUpdateRequest model)
        {
            ObjectResult result = null;

            try
            {
                int userId = _webAuthService.GetCurrentUserId();
                _roomService.Update(model, userId);

                SuccessResponse response = new SuccessResponse();
                result= Ok200(response);

            }
            catch (Exception ex)
            {
                ErrorResponse error = new ErrorResponse();
                Logger.LogErrorWithDb(ex, _errorLoggingService, HttpContext);
                result = StatusCode(500, error);
            }

            return result;
        }


        [HttpDelete("{id:int}")]
        [EntityAuth(EntityTypeEnum.Rooms, EntityActionTypeEnum.Delete)]
        public ActionResult<SuccessResponse> Delete(int id)
        {
            ObjectResult result = null;

            try
            {
                int userId = _webAuthService.GetCurrentUserId();
                _roomService.Delete(id, userId);

                SuccessResponse response = new SuccessResponse();
                result = Ok200(response);
            }
            catch (MySqlException dbEx)
            {
                ErrorResponse error = dbEx.Number == 1001 ?
                    new ErrorResponse(HotelManagementErrorCode.HasActiveBooking) :
                    new ErrorResponse();

                Logger.LogErrorWithDb(dbEx, _errorLoggingService, HttpContext);
                result = StatusCode(500, error);
            }
            catch (Exception ex)
            {
                ErrorResponse error = new ErrorResponse();
                Logger.LogErrorWithDb(ex, _errorLoggingService, HttpContext);
                result = StatusCode(500, error);
            }

            return result;
        }


    }
}
