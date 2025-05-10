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

namespace TourGo.Web.Api.Controllers.Hotels
{
    [Route("api/bookings")]
    [ApiController]
    public class BookingsController : BaseApiController
    {
        private readonly IBookingService _bookingService;
        private readonly IWebAuthenticationService<int> _webAuthService;
        private readonly IErrorLoggingService _errorLoggingService;

        public BookingsController(ILogger<BookingsController> logger,
                                IBookingService bookingService,
                                IWebAuthenticationService<int> webAuthenticationService,
                                IErrorLoggingService errorLoggingService) : base(logger)
        {
            _bookingService = bookingService;
            _webAuthService = webAuthenticationService;
            _errorLoggingService = errorLoggingService;
        }

        [HttpPost("hotel/{id:int}")]
        [EntityAuth(EntityTypeEnum.Bookings, EntityActionTypeEnum.Create)]
        public ActionResult<ItemResponse<BookingAddResponse>> Add(BookingAddUpdateRequest model)
        {
            ObjectResult result = null;

            try
            {
                int userId = _webAuthService.GetCurrentUserId();

                BookingAddResponse? newBooking = _bookingService.Add(model, userId, model.Id);

                if (newBooking == null)
                {
                    throw new Exception("Failed to add booking");
                }

                ItemResponse<BookingAddResponse> response = new ItemResponse<BookingAddResponse>() { Item = newBooking };

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

        [HttpPut("{id:int}")]
        [EntityAuth(EntityTypeEnum.Bookings, EntityActionTypeEnum.Update)]
        public ActionResult<SuccessResponse> Update(BookingAddUpdateRequest model)
        {
            ObjectResult result = null;

            try
            {
                int userId = _webAuthService.GetCurrentUserId();

                _bookingService.Update(model, userId);

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
                Logger.LogErrorWithDb(ex, _errorLoggingService, HttpContext);
                ErrorResponse response = new ErrorResponse();
                result = StatusCode(500, response);
            }

            return result;
        }

        [HttpGet("hotel/{id:int}/date-range")]
        [EntityAuth(EntityTypeEnum.Bookings, EntityActionTypeEnum.Read, isBulk: true)]
        public ActionResult<ItemResponse<Paged<BookingMinimal>>> GetPaginatedByDateRange(int id, [FromQuery] DateOnly startDate, [FromQuery] DateOnly endDate, 
                                                                                        [FromQuery] int pageIndex, [FromQuery] int pageSize,[FromQuery] bool isArrivalDate,
                                                                                        [FromQuery] string sortColumn,[FromQuery] string sortDirection, 
                                                                                        [FromQuery]string? firstName, [FromQuery] string? lastName)
        {
            ObjectResult result = null;

            try
            {
                if (!_bookingService.BookingSortColumns.Contains(sortColumn))
                {
                    return BadRequest(new ErrorResponse($"Invalid sort column: {sortColumn}"));
                }

                if (!_bookingService.IsValidSortDirection(sortDirection))
                {
                    return BadRequest(new ErrorResponse($"Invalid sort direction: {sortDirection}"));
                }

                Paged<BookingMinimal>? bookings = _bookingService.GetPaginatedByDateRange(startDate, endDate, isArrivalDate, id, pageIndex, pageSize,sortColumn,sortDirection,
                                                                                            firstName, lastName);

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

        [HttpGet("hotel/{id:int}/room-bookings")]
        [EntityAuth(EntityTypeEnum.Bookings, EntityActionTypeEnum.Read, isBulk: true)]
        public ActionResult<ItemsResponse<RoomBooking>> GetRoomBookingsByDateRange(int id, [FromQuery] DateOnly startDate, [FromQuery] DateOnly endDate)
        {
            ObjectResult result = null;

            try
            {
                List<RoomBooking>? roomBookings = _bookingService.GetRoomBookingsByDateRange(startDate, endDate, id);

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

        [HttpGet("hotel/{id:int}/providers")]
        [EntityAuth(EntityTypeEnum.Bookings, EntityActionTypeEnum.Read, isBulk: true)]
        public ActionResult<ItemsResponse<Lookup>> GetBookingProvidersByHotelId(int id)
        {
            ObjectResult result = null;

            try
            {
                List<Lookup>? providers = _bookingService.GetBookingProviders(id);

                if (providers == null)
                {
                    result = NotFound404(new ErrorResponse("No providers found"));
                }
                else
                {
                    ItemsResponse<Lookup> response = new ItemsResponse<Lookup>() { Items = providers };

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
