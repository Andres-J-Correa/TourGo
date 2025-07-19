using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using TourGo.Models.Domain.Hotels;
using TourGo.Models.Enums;
using TourGo.Models.Requests.Hotels;
using TourGo.Services;
using TourGo.Services.Interfaces;
using TourGo.Services.Interfaces.Hotels;
using TourGo.Web.Api.Extensions;
using TourGo.Web.Controllers;
using TourGo.Web.Core.Filters;
using TourGo.Web.Models.Responses;

namespace TourGo.Web.Api.Controllers.Hotels
{
    [Route("api/hotel/{hotelId}/room-availability")]
    [ApiController]
    public class RoomAvailabilityController : BaseApiController
    {
        private readonly IRoomAvailabilityService _roomAvailabilityService;
        private readonly IWebAuthenticationService<string> _webAuthService;
        private readonly IErrorLoggingService _errorLoggingService;

        public RoomAvailabilityController(
            ILogger<RoomAvailabilityController> logger,
            IRoomAvailabilityService roomAvailabilityService,
            IWebAuthenticationService<string> webAuthenticationService,
            IErrorLoggingService errorLoggingService) : base(logger)
        {
            _roomAvailabilityService = roomAvailabilityService;
            _webAuthService = webAuthenticationService;
            _errorLoggingService = errorLoggingService;
        }

        [HttpPost]
        [EntityAuth(EntityTypeEnum.RoomAvailability, EntityActionTypeEnum.Create)]
        public ActionResult<SuccessResponse> Upsert(string hotelId, RoomAvailabilityUpsertRequest request)
        {
            ObjectResult result;

            try
            {
                string userId = _webAuthService.GetCurrentUserId();

                _roomAvailabilityService.Upsert(hotelId, userId, request);

                SuccessResponse response = new SuccessResponse();
                result = Ok200(response);
            }
            catch (Exception ex)
            {
                ErrorResponse response = new ErrorResponse();
                Logger.LogErrorWithDb(ex, _errorLoggingService, HttpContext);
                result = StatusCode(500, response);
            }

            return result;

        }
        [HttpGet("date-range")]
        [EntityAuth(EntityTypeEnum.RoomAvailability, EntityActionTypeEnum.Read)]
        public ActionResult<ItemsResponse<RoomAvailability>> GetAll(string hotelId, [FromQuery] DateOnly startDate, [FromQuery] DateOnly endDate)
        {
            
            ObjectResult result;
            try
            {
                List<RoomAvailability>? roomAvailabilities = _roomAvailabilityService.GetAll(hotelId, startDate, endDate);
                
                if (roomAvailabilities == null)
                {
                    return NotFound404(new ErrorResponse("No room availability found for the specified date range."));
                }

                ItemsResponse<RoomAvailability> response = new ItemsResponse<RoomAvailability> { Items = roomAvailabilities };
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
    }
}
