using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using MySql.Data.MySqlClient;
using TourGo.Models;
using TourGo.Models.Domain.Bookings;
using TourGo.Models.Enums;
using TourGo.Models.Enums.Bookings;
using TourGo.Models.Requests.Bookings;
using TourGo.Services;
using TourGo.Services.Interfaces;
using TourGo.Web.Api.Extensions;
using TourGo.Web.Controllers;
using TourGo.Web.Core.Filters;
using TourGo.Web.Models.Enums;
using TourGo.Web.Models.Responses;

namespace TourGo.Web.Api.Controllers.Hotels
{
    [Route("api/hotel/{hotelId}/bookings")]
    [ApiController]
    public class BookingsControllerV2 : BaseApiController
    {
        private readonly IBookingService _bookingService;
        private readonly IWebAuthenticationService<string> _webAuthService;
        private readonly IErrorLoggingService _errorLoggingService;

        public BookingsControllerV2(ILogger<BookingsControllerV2> logger,
                                IBookingService bookingService,
                                IWebAuthenticationService<string> webAuthenticationService,
                                IErrorLoggingService errorLoggingService) : base(logger)
        {
            _bookingService = bookingService;
            _webAuthService = webAuthenticationService;
            _errorLoggingService = errorLoggingService;
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
        [EntityAuth(EntityTypeEnum.Bookings, EntityActionTypeEnum.Read, isBulk: true)]
        public ActionResult<ItemResponse<Paged<BookingMinimal>>> GetPaginatedByDateRange(string hotelId, [FromQuery] int pageIndex, [FromQuery] int pageSize, [FromQuery] bool isArrivalDate,
                                                                                        [FromQuery] string? sortColumn, [FromQuery] string? sortDirection,
                                                                                        [FromQuery] DateOnly? startDate, [FromQuery] DateOnly? endDate,
                                                                                        [FromQuery] string? firstName, [FromQuery] string? lastName,
                                                                                        [FromQuery] string? externalBookingId, [FromQuery] int? statusId)
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
                    firstName, lastName, externalBookingId, statusId);


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
    }
}
