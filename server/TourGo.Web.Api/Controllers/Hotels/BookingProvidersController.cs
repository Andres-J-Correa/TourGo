using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using TourGo.Services.Interfaces;
using TourGo.Services;
using TourGo.Services.Interfaces.Hotels;
using TourGo.Web.Controllers;
using TourGo.Web.Core.Filters;
using TourGo.Models.Enums;
using TourGo.Models.Requests.Finances;
using TourGo.Services.Hotels;
using TourGo.Web.Api.Extensions;
using TourGo.Web.Models.Responses;
using TourGo.Models.Requests.Hotels;
using TourGo.Models.Domain;
using TourGo.Models.Domain.Hotels;

namespace TourGo.Web.Api.Controllers.Hotels
{
    [Route("api/booking-providers")]
    [ApiController]
    public class BookingProvidersController : BaseApiController
    {
        private readonly IBookingProviderService _bookingProviderService;
        private readonly IErrorLoggingService _errorLoggingService;
        private readonly IWebAuthenticationService<int> _webAuthService;

        public BookingProvidersController(ILogger<BookingProvidersController> logger,
                                                 IBookingProviderService bookingProviderService,
                                                 IErrorLoggingService errorLoggingService,
                                                 IWebAuthenticationService<int> webAuthService): base(logger)
        {
            _bookingProviderService = bookingProviderService;
            _errorLoggingService = errorLoggingService;
            _webAuthService = webAuthService;
        }

        [HttpPost("hotel/{id:int}")]
        [EntityAuth(EntityTypeEnum.BookingProviders, EntityActionTypeEnum.Create)]
        public ActionResult<ItemResponse<int>> Add(BookingProviderAddUpdateRequest model)
        {
            ObjectResult result = null;

            try
            {
                int userId = _webAuthService.GetCurrentUserId();
                int id = _bookingProviderService.Add(model, userId);

                if (id == 0)
                {
                    throw new Exception("Failed to create booking provider.");
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

        [HttpPut("{id:int}")]
        [EntityAuth(EntityTypeEnum.BookingProviders, EntityActionTypeEnum.Update)]
        public ActionResult<SuccessResponse> Update(BookingProviderAddUpdateRequest model)
        {
            ObjectResult result = null;

            try
            {
                int userId = _webAuthService.GetCurrentUserId();
                _bookingProviderService.Update(model, userId);

                SuccessResponse response = new SuccessResponse();
                result = Ok(response);
            }
            catch (Exception ex)
            {
                Logger.LogErrorWithDb(ex, _errorLoggingService, HttpContext);
                ErrorResponse response = new ErrorResponse();
                result = StatusCode(500, response);
            }

            return result;
        }

        [HttpDelete("{id:int}")]
        [EntityAuth(EntityTypeEnum.BookingProviders, EntityActionTypeEnum.Delete)]
        public ActionResult<SuccessResponse> Delete(int id)
        {
            ObjectResult result = null;

            try
            {
                int userId = _webAuthService.GetCurrentUserId();
                _bookingProviderService.Delete(id, userId);

                SuccessResponse response = new SuccessResponse();
                result = Ok(response);
            }
            catch (Exception ex)
            {
                Logger.LogErrorWithDb(ex, _errorLoggingService, HttpContext);
                ErrorResponse response = new ErrorResponse();
                result = StatusCode(500, response);
            }

            return result;
        }

        [HttpGet("hotel/{id:int}/minimal")]
        [EntityAuth(EntityTypeEnum.BookingProviders, EntityActionTypeEnum.Read, isBulk: true)]
        public ActionResult<ItemsResponse<Lookup>> GetMinimal(int id)
        {
            ObjectResult result = null;

            try
            {
                List<Lookup>? bookingProviders = _bookingProviderService.GetMinimal(id);

                if (bookingProviders == null)
                {
                    result = NotFound("No booking providers found for the given hotel ID.");
                }
                else
                {
                    ItemsResponse<Lookup> response = new ItemsResponse<Lookup> { Items = bookingProviders };
                    result = Ok(response);
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

        [HttpGet("hotel/{id:int}")]
        [EntityAuth(EntityTypeEnum.BookingProviders, EntityActionTypeEnum.Read, isBulk: true)]
        public ActionResult<ItemsResponse<BookingProvider>> Get(int id)
        {
            ObjectResult result = null;

            try
            {
                List<BookingProvider>? bookingProviders = _bookingProviderService.Get(id);

                if (bookingProviders == null)
                {
                    result = NotFound("No booking providers found for the given hotel ID.");
                }
                else
                {
                    ItemsResponse<BookingProvider> response = new ItemsResponse<BookingProvider> { Items = bookingProviders };
                    result = Ok(response);
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
