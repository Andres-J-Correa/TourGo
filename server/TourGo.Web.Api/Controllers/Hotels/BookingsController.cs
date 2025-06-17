using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using TourGo.Models;
using TourGo.Models.Domain;
using TourGo.Models.Domain.Bookings;
using TourGo.Models.Domain.Hotels;
using TourGo.Models.Enums;
using TourGo.Models.Enums.Invoices;
using TourGo.Models.Requests.Bookings;
using TourGo.Models.Requests.Invoices;
using TourGo.Models.Responses;
using TourGo.Services;
using TourGo.Services.Interfaces;
using TourGo.Services.Interfaces.Hotels;
using TourGo.Web.Controllers;
using TourGo.Web.Core.Filters;
using TourGo.Web.Models.Responses;
using TourGo.Web.Api.Extensions;
using Microsoft.Extensions.Caching.Memory;
using MySql.Data.MySqlClient;
using TourGo.Web.Models.Enums;
using TourGo.Models.Enums.Bookings;

namespace TourGo.Web.Api.Controllers.Hotels
{
    [Route("api/bookings")]
    [ApiController]
    public class BookingsController : BaseApiController
    {
        private readonly IBookingService _bookingService;
        private readonly IWebAuthenticationService<string> _webAuthService;
        private readonly IErrorLoggingService _errorLoggingService;

        public BookingsController(ILogger<BookingsController> logger,
                                IBookingService bookingService,
                                IWebAuthenticationService<string> webAuthenticationService,
                                IErrorLoggingService errorLoggingService) : base(logger)
        {
            _bookingService = bookingService;
            _webAuthService = webAuthenticationService;
            _errorLoggingService = errorLoggingService;
        }

        [HttpPost("hotel/{hotelId}")]
        [EntityAuth(EntityTypeEnum.Bookings, EntityActionTypeEnum.Create)]
        public ActionResult<ItemResponse<BookingAddResponse>> Add(BookingAddRequest model, string hotelId)
        {
            ObjectResult result = null;

            try
            {
                string userId = _webAuthService.GetCurrentUserId();

                BookingAddResponse? newBooking = _bookingService.Add(model, userId, hotelId);

                if (newBooking == null)
                {
                    throw new Exception("Failed to add booking");
                }

                ItemResponse<BookingAddResponse> response = new ItemResponse<BookingAddResponse>() { Item = newBooking };

                result = Created201(response);
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
                result = StatusCode(500, error);
            }
            catch (Exception ex)
            {
                Logger.LogErrorWithDb(ex, _errorLoggingService, HttpContext);
                ErrorResponse response = new ErrorResponse();
                result = StatusCode(500, response);
            }

            return result;
        }

        [HttpGet("{id:int}/extra-charges")]
        [EntityAuth(EntityTypeEnum.Bookings, EntityActionTypeEnum.Read)]
        public ActionResult<ItemsResponse<ExtraCharge>> GetExtraCharges(int id)
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
                    ItemsResponse<ExtraCharge> response = new ItemsResponse<ExtraCharge>() { Items = extraCharges };

                    result = Ok200(response);
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

        [HttpGet("{id:int}/room-bookings")]
        [EntityAuth(EntityTypeEnum.Bookings, EntityActionTypeEnum.Read)]
        public ActionResult<ItemsResponse<RoomBooking>> GetRoomBookingsByBookingId(int id)
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
                    ItemsResponse<RoomBooking> response = new ItemsResponse<RoomBooking>() { Items = roomBookings };

                    result = Ok200(response);
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

        [HttpGet("hotel/{hotelId}/room-bookings")]
        [EntityAuth(EntityTypeEnum.Bookings, EntityActionTypeEnum.Read, isBulk: true)]
        public ActionResult<ItemsResponse<RoomBooking>> GetRoomBookingsByDateRange(string hotelId, [FromQuery] DateOnly startDate, [FromQuery] DateOnly endDate)
        {
            ObjectResult result = null;

            try
            {
                List<RoomBooking>? roomBookings = _bookingService.GetRoomBookingsByDateRange(startDate, endDate, hotelId);

                if (roomBookings == null)
                {
                    result = NotFound404(new ErrorResponse("No room bookings found"));
                }
                else
                {
                    ItemsResponse<RoomBooking> response = new ItemsResponse<RoomBooking>() { Items = roomBookings };

                    result = Ok200(response);
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

        [HttpGet("hotel/{hotelId}/arrivals")]
        [EntityAuth(EntityTypeEnum.Bookings, EntityActionTypeEnum.Read, isBulk: true)]
        public ActionResult<ItemsResponse<BookingArrival>> GetArrivingToday(string hotelId, [FromQuery] DateOnly date)
        {
            ObjectResult result = null;

            try
            {
                List<BookingArrival>? arrivals = _bookingService.GetArrivalsByDate(date, hotelId);

                if (arrivals == null)
                {
                    result = NotFound404(new ErrorResponse("No arrivals found"));
                }
                else
                {
                    ItemsResponse<BookingArrival> response = new ItemsResponse<BookingArrival>() { Items = arrivals };

                    result = Ok200(response);
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

        [HttpGet("hotel/{hotelId}/departures")]
        [EntityAuth(EntityTypeEnum.Bookings, EntityActionTypeEnum.Read, isBulk: true)]
        public ActionResult<ItemsResponse<BookingDeparture>> GetLeavingToday(string hotelId, [FromQuery] DateOnly date)
        {
            ObjectResult result = null;

            try
            {
                List<BookingDeparture>? departures = _bookingService.GetDeparturesByDate(date, hotelId);

                if (departures == null || departures.Count == 0)
                {
                    result = NotFound404(new ErrorResponse("No departures found for today"));
                }
                else
                {
                    ItemsResponse<BookingDeparture> response = new ItemsResponse<BookingDeparture>() { Items = departures };

                    result = Ok200(response);
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

        [HttpGet("hotel/{hotelId}/stays")]
        [EntityAuth(EntityTypeEnum.Bookings, EntityActionTypeEnum.Read, isBulk: true)]
        public ActionResult<ItemsResponse<BookingStay>> GetStaysToday(string hotelId, [FromQuery] DateOnly date)
        {
            ObjectResult result = null;
            try
            {
                List<BookingStay>? stays = _bookingService.GetStaysByDate(date, hotelId);
                if (stays == null)
                {
                    result = NotFound404(new ErrorResponse("No stays found for today"));
                }
                else
                {
                    ItemsResponse<BookingStay> response = new ItemsResponse<BookingStay>() { Items = stays };
                    result = Ok200(response);
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

        [HttpGet("hotel/{hotelId}/departures/rooms")]
        [EntityAuth(EntityTypeEnum.Bookings, EntityActionTypeEnum.Read, isBulk: true)]
        public ActionResult<ItemsResponse<RoomBooking>> GetDepartingRoomBookings(string hotelId, [FromQuery] DateOnly date)
        {
            ObjectResult result = null;

            try
            {
                List<RoomBooking>? departingRooms = _bookingService.GetDepartingRoomBookings(date, hotelId);

                if (departingRooms == null)
                {
                    result = NotFound404(new ErrorResponse("No departing room bookings found for today"));
                }
                else
                {
                    ItemsResponse<RoomBooking> response = new ItemsResponse<RoomBooking>() { Items = departingRooms };

                    result = Ok200(response);
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

        [HttpGet("hotel/{hotelId}/arrivals/rooms")]
        [EntityAuth(EntityTypeEnum.Bookings, EntityActionTypeEnum.Read, isBulk: true)]
        public ActionResult<ItemsResponse<RoomBooking>> GetArrivingRoomBookings(string hotelId, [FromQuery] DateOnly date)
        {
            ObjectResult result = null;

            try
            {
                List<RoomBooking>? arrivingRooms = _bookingService.GetArrivingRoomBookings(date, hotelId);

                if (arrivingRooms == null)
                {
                    result = NotFound404(new ErrorResponse("No arriving room bookings found for today"));
                }
                else
                {
                    ItemsResponse<RoomBooking> response = new ItemsResponse<RoomBooking>() { Items = arrivingRooms };

                    result = Ok200(response);
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
    }
}
