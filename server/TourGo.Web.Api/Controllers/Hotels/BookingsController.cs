using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using TourGo.Models;
using TourGo.Models.Domain.Bookings;
using TourGo.Models.Domain.Hotels;
using TourGo.Models.Enums;
using TourGo.Models.Requests.Bookings;
using TourGo.Services;
using TourGo.Services.Interfaces;
using TourGo.Web.Controllers;
using TourGo.Web.Core.Filters;
using TourGo.Web.Models.Responses;

namespace TourGo.Web.Api.Controllers.Hotels
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

        [HttpPost("hotel/{id:int}")]
        [EntityAuth(EntityTypeEnum.Bookings, EntityActionTypeEnum.Create)]
        public ActionResult<ItemResponse<int>> Create(BookingAddUpdateRequest model)
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

        [HttpGet("{id:int}")]
        [EntityAuth(EntityTypeEnum.Bookings, EntityActionTypeEnum.Read)]
        public ActionResult<ItemResponse<Booking>> GetById(int id)
        {
            ObjectResult result = null;

            try
            {
                Booking? booking = _bookingService.GetById(id);

                if (booking == null)
                {
                    result = NotFound404(new ErrorResponse("Booking not found"));
                }
                else
                {
                    ItemResponse<Booking> response = new ItemResponse<Booking>() { Item = booking };

                    result = Ok200(response);
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

        [HttpGet("{id:int}/extra-charges")]
        [EntityAuth(EntityTypeEnum.Bookings, EntityActionTypeEnum.Read)]
        public ActionResult<ItemResponse<List<ExtraCharge>>> GetExtraCharges(int id)
        {
            ObjectResult result = null;

            try
            {
                List<ExtraCharge>? extraCharges = _bookingService.GetExtraChargesByBookingId(id);

                if (extraCharges == null)
                {
                    result = NotFound404(new ErrorResponse("No extra charges found"));
                }
                else
                {
                    ItemResponse<List<ExtraCharge>> response = new ItemResponse<List<ExtraCharge>>() { Item = extraCharges };

                    result = Ok200(response);
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

        [HttpGet("{id:int}/room-bookings")]
        [EntityAuth(EntityTypeEnum.Bookings, EntityActionTypeEnum.Read)]
        public ActionResult<ItemResponse<List<RoomBooking>>> GetRoomBookings(int id)
        {
            ObjectResult result = null;

            try
            {
                List<RoomBooking>? roomBookings = _bookingService.GetRoomBookingsByBookingId(id);

                if (roomBookings == null)
                {
                    result = NotFound404(new ErrorResponse("No room bookings found"));
                }
                else
                {
                    ItemResponse<List<RoomBooking>> response = new ItemResponse<List<RoomBooking>>() { Item = roomBookings };

                    result = Ok200(response);
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

    }
}
