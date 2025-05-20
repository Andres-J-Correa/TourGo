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
        private readonly IWebAuthenticationService<int> _webAuthService;

        public PaymentMethodsController(ILogger<PaymentMethodsController> logger,
                                                 IPaymentMethodService paymentMethodService,
                                                 IErrorLoggingService errorLoggingService,
                                                 IWebAuthenticationService<int> webAuthService) : base(logger)
        {
            _paymentMethodService = paymentMethodService;
            _errorLoggingService = errorLoggingService;
            _webAuthService = webAuthService;
        }

        [HttpGet("hotel/{id:int}")]
        [EntityAuth(EntityTypeEnum.PaymentMethods, EntityActionTypeEnum.Read, isBulk: true)]
        public ActionResult<ItemsResponse<PaymentMethod>> Get(int id)
        {
            ObjectResult result = null;

            try
            {
                List<PaymentMethod>? paymentMethods = _paymentMethodService.Get(id);

                if (paymentMethods == null || paymentMethods.Count == 0)
                {
                    result = NotFound("No payment methods found for the specified hotel.");
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

        [HttpGet("hotel/{id:int}/minimal")]
        [EntityAuth(EntityTypeEnum.PaymentMethods, EntityActionTypeEnum.Read, isBulk: true)]
        public ActionResult<ItemsResponse<Lookup>> GetMinimal(int id)
        {
            ObjectResult result = null;

            try
            {
                List<Lookup>? paymentMethods = _paymentMethodService.GetMinimal(id);

                if (paymentMethods == null || paymentMethods.Count == 0)
                {
                    result = NotFound("No payment methods found for the specified hotel.");
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

        [HttpPost("hotel/{id:int}")]
        [EntityAuth(EntityTypeEnum.PaymentMethods, EntityActionTypeEnum.Create)]
        public ActionResult<ItemResponse<int>> Add(PaymentMethodAddUpdateRequest model)
        {
            ObjectResult result = null;

            try
            {
                int userId = _webAuthService.GetCurrentUserId();
                int newId = _paymentMethodService.Add(model, userId);

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
        public ActionResult<SuccessResponse> Update(PaymentMethodAddUpdateRequest model)
        {
            ObjectResult result = null;

            try
            {
                int userId = _webAuthService.GetCurrentUserId();
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
                int userId = _webAuthService.GetCurrentUserId();
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
