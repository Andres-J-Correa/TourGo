using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using TourGo.Services.Interfaces;
using TourGo.Services;
using TourGo.Web.Controllers;
using TourGo.Web.Models.Responses;
using TourGo.Models.Domain.Finances;
using TourGo.Web.Api.Extensions;
using TourGo.Web.Core.Filters;
using TourGo.Models.Enums;
using TourGo.Models.Domain;
using TourGo.Models.Requests.Finances;
using TourGo.Services.Interfaces.Finances;

namespace TourGo.Web.Api.Controllers.Finances
{
    [Route("api/payment-methods")]
    [ApiController]
    public class PaymentMethodsController : BaseApiController
    {
        private readonly IPaymentMethodService _paymentMethodService;
        private readonly IErrorLoggingService _errorLoggingService;
        private readonly IWebAuthenticationService<string> _webAuthService;

        public PaymentMethodsController(ILogger<PaymentMethodsController> logger,
                                                 IPaymentMethodService paymentMethodService,
                                                 IErrorLoggingService errorLoggingService,
                                                 IWebAuthenticationService<string> webAuthService) : base(logger)
        {
            _paymentMethodService = paymentMethodService;
            _errorLoggingService = errorLoggingService;
            _webAuthService = webAuthService;
        }

        [HttpGet("hotel/{hotelId}")]
        [EntityAuth(EntityTypeEnum.PaymentMethods, EntityActionTypeEnum.Read, isBulk: true)]
        public ActionResult<ItemsResponse<PaymentMethod>> Get(string hotelId)
        {
            ObjectResult result = null;

            try
            {
                List<PaymentMethod>? paymentMethods = _paymentMethodService.Get(hotelId);

                if (paymentMethods == null || paymentMethods.Count == 0)
                {
                    ErrorResponse response = new ErrorResponse("No payment methods found for the specified hotel.");
                    result = NotFound404(response);
                }
                else
                {
                    ItemsResponse<PaymentMethod> response = new ItemsResponse<PaymentMethod>() { Items = paymentMethods };
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

        [HttpGet("hotel/{hotelId}/minimal")]
        [EntityAuth(EntityTypeEnum.PaymentMethods, EntityActionTypeEnum.Read, isBulk: true)]
        public ActionResult<ItemsResponse<Lookup>> GetMinimal(string hotelId)
        {
            ObjectResult result = null;

            try
            {
                List<Lookup>? paymentMethods = _paymentMethodService.GetMinimal(hotelId);

                if (paymentMethods == null || paymentMethods.Count == 0)
                {
                    ErrorResponse response = new ErrorResponse("No payment methods found for the specified hotel.");
                    result = NotFound404(response);
                }
                else
                {
                    ItemsResponse<Lookup> response = new ItemsResponse<Lookup>() { Items = paymentMethods };
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

        [HttpPost("hotel/{hotelId}")]
        [EntityAuth(EntityTypeEnum.PaymentMethods, EntityActionTypeEnum.Create)]
        public ActionResult<ItemResponse<int>> Add(PaymentMethodAddRequest model, string hotelId)
        {
            ObjectResult result = null;

            try
            {
                string userId = _webAuthService.GetCurrentUserId();
                int newId = _paymentMethodService.Add(model, userId, hotelId);

                if (newId == 0)
                {
                    throw new Exception("Failed to add payment method.");
                }
                else
                {
                    ItemResponse<int> response = new ItemResponse<int>() { Item = newId };
                    result = Created201(response);
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

        [HttpPut("{id:int}")]
        [EntityAuth(EntityTypeEnum.PaymentMethods, EntityActionTypeEnum.Update)]
        public ActionResult<SuccessResponse> Update(PaymentMethodUpdateRequest model)
        {
            ObjectResult result = null;

            try
            {
                string userId = _webAuthService.GetCurrentUserId();
                _paymentMethodService.Update(model, userId);

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

        [HttpDelete("{id:int}")]
        [EntityAuth(EntityTypeEnum.PaymentMethods, EntityActionTypeEnum.Delete)]
        public ActionResult<SuccessResponse> Delete(int id)
        {
            ObjectResult result = null;

            try
            {
                string userId = _webAuthService.GetCurrentUserId();
                _paymentMethodService.Delete(id, userId);

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

    }
}
