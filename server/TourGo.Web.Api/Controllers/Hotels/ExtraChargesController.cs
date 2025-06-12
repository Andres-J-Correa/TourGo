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
    [Route("api/extra-charges")]
    [ApiController]
    public class ExtraChargesController : BaseApiController
    {
        private readonly IWebAuthenticationService<string> _webAuthService;
        private readonly IExtraChargeService _extraChargeService;
        private readonly IErrorLoggingService _errorLoggingService;

        public ExtraChargesController(ILogger<ExtraChargesController> logger,
            IWebAuthenticationService<string> webAuthenticationService,
            IExtraChargeService extraChargeService,
            IErrorLoggingService errorLoggingService) : base(logger)
        {
            _webAuthService = webAuthenticationService;
            _extraChargeService = extraChargeService;
            _errorLoggingService = errorLoggingService;
        }

        [HttpPost("hotel/{hotelId}")]
        [EntityAuth(EntityTypeEnum.Charges, EntityActionTypeEnum.Create)]
        public ActionResult<ItemResponse<int>> Create(ExtraChargeAddRequest model, string hotelId)
        {
            ObjectResult result = null;

            try
            {
                string userId = _webAuthService.GetCurrentUserId();
                int id = _extraChargeService.Create(model, userId, hotelId);

                if (id == 0)
                {
                    throw new Exception("Failed to create extra charge");
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

        [HttpGet("hotel/{hotelId}")]
        [EntityAuth(EntityTypeEnum.Charges, EntityActionTypeEnum.Read, isBulk: true)]
        public ActionResult<ItemsResponse<ExtraCharge>> GetByHotel(string hotelId, [FromQuery] bool? isActive)
        {
            ObjectResult result = null;

            try
            {
                List<ExtraCharge>? list = _extraChargeService.GetByHotel(hotelId, isActive);

                if (list == null)
                {
                    ErrorResponse response = new ErrorResponse("App Resource not found.");
                    result = NotFound404(response);
                }
                else
                {
                    ItemsResponse<ExtraCharge>  response = new ItemsResponse<ExtraCharge> { Items = list };
                    result = Ok200(response);
                }
            }
            catch (Exception ex)
            {
                ErrorResponse response = new ErrorResponse();
                Logger.LogErrorWithDb(ex, _errorLoggingService, HttpContext);
                result = StatusCode(500, response);
            }

            return result;
        }

        [HttpPut("{id:int}")]
        [EntityAuth(EntityTypeEnum.Charges, EntityActionTypeEnum.Update)]
        public ActionResult<SuccessResponse> Update(ExtraChargeUpdateRequest model)
        {
            ObjectResult result = null;

            try
            {
                string userId = _webAuthService.GetCurrentUserId();
                _extraChargeService.Update(model, userId);

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


        [HttpDelete("{id:int}")]
        [EntityAuth(EntityTypeEnum.Charges, EntityActionTypeEnum.Delete)]
        public ActionResult<SuccessResponse> Delete(int id)
        {
            ObjectResult result = null;

            try
            {
                string userId = _webAuthService.GetCurrentUserId();
                _extraChargeService.Delete(id, userId);

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
                ErrorResponse response = new ErrorResponse();
                Logger.LogErrorWithDb(ex, _errorLoggingService, HttpContext);
                result = StatusCode(500, response);
            }

            return result;
        }

    }
}
