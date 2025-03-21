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

namespace TourGo.Web.Api.Controllers.Hotels
{
    [Route("api/extra-charges")]
    [ApiController]
    public class ExtraChargesController : BaseApiController
    {
        private readonly IWebAuthenticationService<int> _webAuthService;
        private readonly IExtraChargeService _extraChargeService;

        public ExtraChargesController(ILogger<ExtraChargesController> logger, IWebAuthenticationService<int> webAuthenticationService, IExtraChargeService extraChargeService) : base(logger)
        {
            _webAuthService = webAuthenticationService;
            _extraChargeService = extraChargeService;
        }

        [HttpPost("hotel/{id:int}")]
        [EntityAuth(EntityTypeEnum.Charges, EntityActionTypeEnum.Create)]
        public ActionResult<ItemResponse<int>> Create(ExtraChargeAddEditRequest model)
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
                Logger.LogError(ex.ToString());
                ErrorResponse response = new ErrorResponse();

                result = StatusCode(500, response);
            }

            return result;
        }

        [HttpGet("hotel/{id:int}")]
        [EntityAuth(EntityTypeEnum.Charges, EntityActionTypeEnum.Read, isBulk: true)]
        public ActionResult<ItemsResponse<ExtraCharge>> GetByHotel(int id)
        {
            int code = 200;
            BaseResponse response = null;

            try
            {
                List<ExtraCharge>? list = _extraChargeService.GetByHotel(id);

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
                Logger.LogError(ex.ToString());
            }

            return StatusCode(code, response);
        }

        [HttpPut("{id:int}")]
        [EntityAuth(EntityTypeEnum.Charges, EntityActionTypeEnum.Update)]
        public ActionResult<ItemResponse<int>> Update(ExtraChargeAddEditRequest model)
        {
            int code = 200;
            BaseResponse response = null;

            try
            {
                int userId = _webAuthService.GetCurrentUserId();
                int id = _extraChargeService.Update(model, userId);

                if (id == 0)
                {
                    throw new Exception("Failed to update extra charge");
                }

                response = new ItemResponse<int>() { Item = id };
            }
            catch (Exception ex)
            {
                code = 500;
                response = new ErrorResponse();
                Logger.LogError(ex.ToString());
            }

            return StatusCode(code, response);
        }


        [HttpDelete("{id:int}")]
        [EntityAuth(EntityTypeEnum.Charges, EntityActionTypeEnum.Delete)]
        public ActionResult<SuccessResponse> Delete(int id)
        {
            int code = 200;
            BaseResponse response = null;

            try
            {
                int userId = _webAuthService.GetCurrentUserId();
                _extraChargeService.Delete(id, userId);

                response = new SuccessResponse();
            }
            catch (Exception ex)
            {
                code = 500;
                response = new ErrorResponse();
                Logger.LogError(ex.ToString());
            }

            return StatusCode(code, response);
        }

    }
}
