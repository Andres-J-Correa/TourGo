using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using TourGo.Models.Domain.Hotels;
using TourGo.Models.Enums;
using TourGo.Models.Requests.Hotels;
using TourGo.Services;
using TourGo.Services.Hotels;
using TourGo.Services.Interfaces.Hotels;
using TourGo.Web.Controllers;
using TourGo.Web.Core.Filters;
using TourGo.Web.Models.Responses;
using TourGo.Web.Api.Extensions;
using TourGo.Services.Interfaces;
using MySql.Data.MySqlClient;
using MySqlX.XDevAPI.Common;
using TourGo.Web.Models.Enums;

namespace TourGo.Web.Api.Controllers.Hotels
{
    [Route("api/extra-charges")]
    [ApiController]
    public class ExtraChargesController : BaseApiController
    {
        private readonly IWebAuthenticationService<int> _webAuthService;
        private readonly IExtraChargeService _extraChargeService;
        private readonly IErrorLoggingService _errorLoggingService;

        public ExtraChargesController(ILogger<ExtraChargesController> logger,
            IWebAuthenticationService<int> webAuthenticationService,
            IExtraChargeService extraChargeService,
            IErrorLoggingService errorLoggingService) : base(logger)
        {
            _webAuthService = webAuthenticationService;
            _extraChargeService = extraChargeService;
            _errorLoggingService = errorLoggingService;
        }

        [HttpPost("hotel/{id:int}")]
        [EntityAuth(EntityTypeEnum.Charges, EntityActionTypeEnum.Create)]
        public ActionResult<ItemResponse<int>> Create(ExtraChargeAddUpdateRequest model)
        {
            ObjectResult result = null;

            try
            {
                int userId = _webAuthService.GetCurrentUserId();
                int id = _extraChargeService.Create(model, userId);

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

        [HttpGet("hotel/{id:int}")]
        [EntityAuth(EntityTypeEnum.Charges, EntityActionTypeEnum.Read, isBulk: true)]
        public ActionResult<ItemsResponse<ExtraCharge>> GetByHotel(int id, [FromQuery] bool? isActive)
        {
            int code = 200;
            BaseResponse response = null;

            try
            {
                List<ExtraCharge>? list = _extraChargeService.GetByHotel(id, isActive);

                if (list == null)
                {
                    code = 404;
                    response = new ErrorResponse("App Resource not found.");
                }
                else
                {
                    response = new ItemsResponse<ExtraCharge> { Items = list };
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
        [EntityAuth(EntityTypeEnum.Charges, EntityActionTypeEnum.Update)]
        public ActionResult<SuccessResponse> Update(ExtraChargeAddUpdateRequest model)
        {
            ObjectResult result = null;

            try
            {
                int userId = _webAuthService.GetCurrentUserId();
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
                int userId = _webAuthService.GetCurrentUserId();
                _extraChargeService.Delete(id, userId);

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
                ErrorResponse response = new ErrorResponse();
                Logger.LogErrorWithDb(ex, _errorLoggingService, HttpContext);
                result = StatusCode(500, response);
            }

            return result;
        }

    }
}
