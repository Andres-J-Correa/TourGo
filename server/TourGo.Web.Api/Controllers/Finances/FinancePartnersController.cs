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
    [Route("api/finance-partners")]
    [ApiController]
    public class FinancePartnersController : BaseApiController
    {
        private readonly IFinancePartnerService _financePartnerService;
        private readonly IErrorLoggingService _errorLoggingService;
        private readonly IWebAuthenticationService<int> _webAuthService;

        public FinancePartnersController(ILogger<FinancePartnersController> logger,
                                         IFinancePartnerService financePartnerService,
                                         IErrorLoggingService errorLoggingService,
                                         IWebAuthenticationService<int> webAuthService) : base(logger)
        {
            _financePartnerService = financePartnerService;
            _errorLoggingService = errorLoggingService;
            _webAuthService = webAuthService;
        }

        [HttpGet("hotel/{id:int}")]
        [EntityAuth(EntityTypeEnum.FinancePartners, EntityActionTypeEnum.Read, isBulk: true)]
        public ActionResult<ItemsResponse<FinancePartner>> Get(int id)
        {
            ObjectResult result = null;

            try
            {
                List<FinancePartner>? financePartners = _financePartnerService.Get(id);

                if (financePartners == null || financePartners.Count == 0)
                {
                    ErrorResponse errorResponse = new ErrorResponse("No finance partners found for the specified hotel.");
                    result = NotFound404(errorResponse);
                }
                else
                {
                    ItemsResponse<FinancePartner> response = new ItemsResponse<FinancePartner>() { Items = financePartners };
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
        [EntityAuth(EntityTypeEnum.FinancePartners, EntityActionTypeEnum.Read, isBulk: true)]
        public ActionResult<ItemsResponse<Lookup>> GetMinimal(int id)
        {
            ObjectResult result = null;

            try
            {
                List<Lookup>? financePartners = _financePartnerService.GetMinimal(id);

                if (financePartners == null || financePartners.Count == 0)
                {
                    ErrorResponse response = new ErrorResponse("No finance partners found for the specified hotel.");
                    result = NotFound404(response);
                }
                else
                {
                    ItemsResponse<Lookup> response = new ItemsResponse<Lookup>() { Items = financePartners };
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
        [EntityAuth(EntityTypeEnum.FinancePartners, EntityActionTypeEnum.Create)]
        public ActionResult<ItemResponse<int>> Add(FinancePartnerAddUpdateRequest model)
        {
            ObjectResult result = null;

            try
            {
                int userId = _webAuthService.GetCurrentUserId();
                int newId = _financePartnerService.Add(model, userId);

                if (newId == 0)
                {
                    throw new Exception("Failed to add finance partner.");
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
        [EntityAuth(EntityTypeEnum.FinancePartners, EntityActionTypeEnum.Update)]
        public ActionResult<SuccessResponse> Update(FinancePartnerAddUpdateRequest model)
        {
            ObjectResult result = null;

            try
            {
                int userId = _webAuthService.GetCurrentUserId();
                _financePartnerService.Update(model, userId);

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
        [EntityAuth(EntityTypeEnum.FinancePartners, EntityActionTypeEnum.Delete)]
        public ActionResult<SuccessResponse> Delete(int id)
        {
            ObjectResult result = null;

            try
            {
                int userId = _webAuthService.GetCurrentUserId();
                _financePartnerService.Delete(id, userId);

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