using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using MySql.Data.MySqlClient;
using TourGo.Models;
using TourGo.Models.Domain.Bookings;
using TourGo.Models.Domain.Config;
using TourGo.Models.Domain.Config.Emails;
using TourGo.Models.Enums;
using TourGo.Models.Enums.Bookings;
using TourGo.Models.Requests.Bookings;
using TourGo.Models.Responses;
using TourGo.Services;
using TourGo.Services.Interfaces;
using TourGo.Services.Security;
using TourGo.Web.Api.Extensions;
using TourGo.Web.Controllers;
using TourGo.Web.Core.Filters;
using TourGo.Web.Models.Enums;
using TourGo.Web.Models.Responses;

namespace TourGo.Web.Api.Controllers.Hotels
{
    [Route("api/hotel/{hotelId}/bookings")]
    [ApiController]
    public class BookingsController : BaseApiController
    {
        private readonly IBookingService _bookingService;
        private readonly IWebAuthenticationService<string> _webAuthService;
        private readonly IErrorLoggingService _errorLoggingService;
        private readonly BookingsPublicIdConfig _publicIdConfig;

        public BookingsController(ILogger<BookingsController> logger,
                                IBookingService bookingService,
                                IWebAuthenticationService<string> webAuthenticationService,
                                IErrorLoggingService errorLoggingService,
                                IOptions<BookingsPublicIdConfig> publicIdOptions) : base(logger)
        {
            _bookingService = bookingService;
            _webAuthService = webAuthenticationService;
            _errorLoggingService = errorLoggingService;
            _publicIdConfig = publicIdOptions.Value;
        }

        [HttpPost]
        [EntityAuth(EntityTypeEnum.Bookings, EntityActionTypeEnum.Create)]
        public ActionResult<ItemResponse<BookingAddResponse>> Add(BookingAddRequest model, string hotelId)
        {
            ObjectResult result = null;

            try
            {
                string? publicId = null;
                int attemptsMade = 0;

                do
                {
                    List<string> possiblePublicIds = PublicIdGeneratorService.GenerateSecureIds(_publicIdConfig.NumberOfIdsToGenerate,
                                                                                                _publicIdConfig.Length,
                                                                                                _publicIdConfig.Characters);

                    List<string>? availablePublicIds = _bookingService.GetAvailablePublicIds(possiblePublicIds);

                    if (availablePublicIds != null && availablePublicIds.Count > 0)
                    {
                        publicId = availablePublicIds[0];
                    }

                    attemptsMade++;
                } while (publicId == null && attemptsMade < _publicIdConfig.MaxAttempts);

                if (publicId == null)
                {
                    throw new Exception("Failed to generate a unique public ID after maximum attempts.");
                }

                publicId = $"{_publicIdConfig.Prefix}{publicId}";

                string userId = _webAuthService.GetCurrentUserId();

                BookingAddResponse? newBooking = _bookingService.Add(model, userId, hotelId, publicId);

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

        [HttpPut("{id}")]
        [EntityAuth(EntityTypeEnum.Bookings, EntityActionTypeEnum.Update)]
        public ActionResult<SuccessResponse> Update(BookingsUpdateRequest model, string hotelId)
        {
            ObjectResult result = null;

            try
            {
                string userId = _webAuthService.GetCurrentUserId();

                _bookingService.Update(model, userId, hotelId);

                SuccessResponse response = new SuccessResponse();

                result = Ok200(response);
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

        [HttpPatch("{id}/check-in")]
        [EntityAuth(EntityTypeEnum.Bookings, EntityActionTypeEnum.Update)]
        public ActionResult<SuccessResponse> UpdateStatusToCheckedIn(string id, string hotelId)
        {
            ObjectResult result = null;

            try
            {
                string userId = _webAuthService.GetCurrentUserId();

                _bookingService.UpdateStatus(id, userId, BookingStatusEnum.Arrived, hotelId);

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

        [HttpPatch("{id}/complete")]
        [EntityAuth(EntityTypeEnum.Bookings, EntityActionTypeEnum.Update)]
        public ActionResult<SuccessResponse> UpdateStatusToCompleted(string id, string hotelId)
        {
            ObjectResult result = null;

            try
            {
                string userId = _webAuthService.GetCurrentUserId();

                _bookingService.UpdateStatus(id, userId, BookingStatusEnum.Completed, hotelId);

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

        [HttpPatch("{id}/cancel")]
        [EntityAuth(EntityTypeEnum.Bookings, EntityActionTypeEnum.Update)]
        public ActionResult<SuccessResponse> UpdateStatusToCancelled(string id, string hotelId)
        {
            ObjectResult result = null;

            try
            {
                string userId = _webAuthService.GetCurrentUserId();

                _bookingService.UpdateStatus(id, userId, BookingStatusEnum.Cancelled, hotelId);

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

        [HttpPatch("{id}/no-show")]
        [EntityAuth(EntityTypeEnum.Bookings, EntityActionTypeEnum.Update)]
        public ActionResult<SuccessResponse> UpdateStatusToNoShow(string id, string hotelId)
        {
            ObjectResult result = null;

            try
            {
                string userId = _webAuthService.GetCurrentUserId();

                _bookingService.UpdateStatus(id, userId, BookingStatusEnum.NoShow, hotelId);

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

        [HttpPatch("room-booking/toggle-should-clean")]
        [EntityAuth(EntityTypeEnum.Bookings, EntityActionTypeEnum.Update)]
        public ActionResult<SuccessResponse> ToggleRoomBookingShouldClean(ToggleRoomBookingShouldCleanRequest model, string hotelId)
        {
            ObjectResult result;
            try
            {
                _bookingService.ToggleRoomBookingShouldClean(model, hotelId);
                result = Ok200(new SuccessResponse());
            }
            catch (Exception ex)
            {
                Logger.LogErrorWithDb(ex, _errorLoggingService, HttpContext);
                ErrorResponse response = new ErrorResponse();
                result = StatusCode(500, response);
            }
            return result;
        }


        [HttpGet("{id}")]
        [EntityAuth(EntityTypeEnum.Bookings, EntityActionTypeEnum.Read)]
        public ActionResult<ItemResponse<Booking>> GetById(string id, string hotelId)
        {
            ObjectResult result = null;

            try
            {
                Booking? booking = _bookingService.GetById(id, hotelId);

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
                Logger.LogErrorWithDb(ex, _errorLoggingService, HttpContext);
                ErrorResponse response = new ErrorResponse();
                result = StatusCode(500, response);
            }

            return result;
        }

        [HttpGet("date-range")]
        [EntityAuth(EntityTypeEnum.Bookings, EntityActionTypeEnum.Read)]
        public ActionResult<ItemResponse<Paged<BookingMinimal>>> GetPaginatedByDateRange(string hotelId, [FromQuery] int pageIndex, [FromQuery] int pageSize, [FromQuery] bool isArrivalDate,
                                                                                        [FromQuery] string? sortColumn, [FromQuery] string? sortDirection,
                                                                                        [FromQuery] DateOnly? startDate, [FromQuery] DateOnly? endDate,
                                                                                        [FromQuery] string? firstName, [FromQuery] string? lastName,
                                                                                        [FromQuery] string? externalBookingId, [FromQuery] int? statusId,
                                                                                        [FromQuery] string? bookingId)
        {
            ObjectResult result = null;

            try
            {
                if (!string.IsNullOrEmpty(sortColumn) && !_bookingService.IsValidSortColumn(sortColumn))
                {
                    return BadRequest(new ErrorResponse($"Invalid sort column: {sortColumn}"));
                }

                if (!string.IsNullOrEmpty(sortDirection) && !_bookingService.IsValidSortDirection(sortDirection))
                {
                    return BadRequest(new ErrorResponse($"Invalid sort direction: {sortDirection}"));
                }

                Paged<BookingMinimal>? bookings = _bookingService.GetPaginatedByDateRange(
                    hotelId, pageIndex, pageSize, isArrivalDate, sortColumn, sortDirection, startDate, endDate,
                    firstName, lastName, externalBookingId, statusId, bookingId);


                if (bookings == null)
                {
                    result = NotFound404(new ErrorResponse("No bookings found"));
                }
                else
                {
                    ItemResponse<Paged<BookingMinimal>> response = new ItemResponse<Paged<BookingMinimal>>() { Item = bookings };

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

        [HttpGet("{id}/minimal")]
        [EntityAuth(EntityTypeEnum.Bookings, EntityActionTypeEnum.Read)]
        public ActionResult<ItemResponse<BookingMinimal>> GetBookingMinimal(string hotelId, string id)
        {
            ObjectResult result = null;

            try
            {
                BookingMinimal? bookingMinimal = _bookingService.GetBookingMinimal(id, hotelId);

                if (bookingMinimal == null)
                {
                    result = NotFound404(new ErrorResponse("Booking not found"));
                }
                else
                {
                    ItemResponse<BookingMinimal> response = new ItemResponse<BookingMinimal>() { Item = bookingMinimal };

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

        [HttpGet("room-bookings")]
        [EntityAuth(EntityTypeEnum.Bookings, EntityActionTypeEnum.Read)]
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

        [HttpGet("arrivals")]
        [EntityAuth(EntityTypeEnum.Bookings, EntityActionTypeEnum.Read)]
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

        [HttpGet("departures")]
        [EntityAuth(EntityTypeEnum.Bookings, EntityActionTypeEnum.Read)]
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

        [HttpGet("stays")]
        [EntityAuth(EntityTypeEnum.Bookings, EntityActionTypeEnum.Read)]
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

        [HttpGet("departures/rooms")]
        [EntityAuth(EntityTypeEnum.Bookings, EntityActionTypeEnum.Read)]
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

        [HttpGet("arrivals/rooms")]
        [EntityAuth(EntityTypeEnum.Bookings, EntityActionTypeEnum.Read)]
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
