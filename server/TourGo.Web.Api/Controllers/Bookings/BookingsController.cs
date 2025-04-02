using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using TourGo.Models;
using TourGo.Models.Domain.Bookings;
using TourGo.Models.Enums;
using TourGo.Models.Requests.Bookings;
using TourGo.Services;
using TourGo.Services.Interfaces.Bookings;
using TourGo.Web.Controllers;
using TourGo.Web.Core.Filters;
using TourGo.Web.Models.Responses;

namespace TourGo.Web.Api.Controllers.Bookings
{
    [Route("api/bookings")]
    [ApiController]
    public class BookingsController : BaseApiController
    {
        private readonly IBookingService _bookingService;
        private readonly IWebAuthenticationService<int> _webAuthService;

        public BookingsController(ILogger<BookingsController> logger, IBookingService bookingService, IWebAuthenticationService<int> webAuthenticationService) : base(logger)
        {
            _bookingService = bookingService;
            _webAuthService = webAuthenticationService;
        }

        [HttpGet("arrivals/{hotelId:int}")]
        //TODO ADD FILTER TO READ HOTEL DATA
        public ActionResult<Paged<BookingBase>> GetBookingsByArrivalDate([FromQuery] DateOnly startDate, [FromQuery] DateOnly endDate, [FromQuery] int pageIndex, [FromQuery] int pageSize, int hotelId)
        {
            int code = 200;
            BaseResponse response;

            try
            {
                int userId = _webAuthService.GetCurrentUserId();
                Paged<BookingBase>? pagedBookings = _bookingService.GetBookingsByArrivalDate(startDate, endDate, pageIndex, pageSize, userId, hotelId);

                if (pagedBookings != null)
                {
                    response = new ItemResponse<Paged<BookingBase>> { Item = pagedBookings };
                }
                else
                {
                    response = new ErrorResponse("No bookings found");
                    code = 404;
                }
            }
            catch (Exception ex)
            {
                Logger.LogError(ex.Message);
                code = 500;
                response = new ErrorResponse();
            }

            return StatusCode(code, response);
        }

        [HttpGet("departures/{hotelId:int}")]
        //TODO ADD FILTER TO READ HOTEL DATA
        public ActionResult<Paged<BookingBase>> GetBookingsByDepartureDate([FromQuery] DateOnly startDate, [FromQuery] DateOnly endDate, [FromQuery] int pageIndex, [FromQuery] int pageSize, int hotelId)
        {
            int code = 200;
            BaseResponse response;

            try
            {
                int userId = _webAuthService.GetCurrentUserId();
                Paged<BookingBase>? pagedBookings = _bookingService.GetBookingsByDepartureDate(startDate, endDate, pageIndex, pageSize, userId, hotelId);

                if (pagedBookings != null)
                {
                    response = new ItemResponse<Paged<BookingBase>> { Item = pagedBookings };
                }
                else
                {
                    response = new ErrorResponse("No bookings found");
                    code = 404;
                }
            }
            catch (Exception ex)
            {
                Logger.LogError(ex.Message);
                code = 500;
                response = new ErrorResponse();
            }

            return StatusCode(code, response);
        }

        [HttpPost("hotel/{id:int}")]
        [EntityAuth(EntityTypeEnum.Bookings, EntityActionTypeEnum.Create)]
        public ActionResult<ItemResponse<int>> Create(BookingAddEditRequest model)
        {
            ObjectResult result = null;

            try
            {
                int userId = _webAuthService.GetCurrentUserId();

                int newId = _bookingService.Add(model, userId, model.Id);

                if (newId == 0)
                {
                    throw new Exception("Failed to add booking");
                }

                ItemResponse<int> response = new ItemResponse<int>() { Item = newId };

                result = Created201(response);
            }
            catch (Exception ex)
            {
                Logger.LogError(ex.ToString());
                ErrorResponse response = new ErrorResponse();
                result = StatusCode(500, response);
            }

            return result;
        }



    }
}
