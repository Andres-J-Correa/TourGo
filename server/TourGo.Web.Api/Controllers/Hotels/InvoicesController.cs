using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using TourGo.Models.Domain.Invoices;
using TourGo.Models.Enums;
using TourGo.Models.Requests.Invoices;
using TourGo.Services;
using TourGo.Services.Interfaces.Hotels;
using TourGo.Web.Controllers;
using TourGo.Web.Core.Filters;
using TourGo.Web.Models.Responses;
using TourGo.Web.Api.Extensions;
using TourGo.Services.Interfaces;

namespace TourGo.Web.Api.Controllers.Hotels
{
    [Route("api/invoices")]
    [ApiController]
    public class InvoicesController : BaseApiController
    {

        private readonly IInvoiceService _invoiceService;
        private readonly IWebAuthenticationService<int> _webAuthService;
        private readonly IErrorLoggingService _errorLoggingService;

        public InvoicesController(ILogger<InvoicesController> logger, 
            IInvoiceService invoiceService, 
            IWebAuthenticationService<int> webAuthenticationService,
            IErrorLoggingService errorLoggingService) : base(logger)
        {
            _invoiceService = invoiceService;
            _webAuthService = webAuthenticationService;
            _errorLoggingService = errorLoggingService;
        }

        [HttpPost("hotel/{id:int}")]
        [EntityAuth(EntityTypeEnum.Invoices, EntityActionTypeEnum.Create)]
        public ActionResult<ItemResponse<int>> Add(InvoiceAddRequest model)
        {
            ObjectResult? result = null;

            try
            {
                int userId = _webAuthService.GetCurrentUserId();
                int id = _invoiceService.Add(model, userId);

                if (id == 0)
                {
                    throw new Exception("Unable to add invoice. Please try again later.");
                }
     
                ItemResponse<int> response = new ItemResponse<int> { Item = id };
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
        [EntityAuth(EntityTypeEnum.Invoices, EntityActionTypeEnum.Update)]
        public ActionResult<SuccessResponse> Update(InvoiceUpdateRequest model)
        {
            ObjectResult? result = null;

            try
            {
                int userId = _webAuthService.GetCurrentUserId();
                _invoiceService.Update(model, userId);

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

        [HttpGet("{id:int}/entities")]
        [EntityAuth(EntityTypeEnum.Invoices, EntityActionTypeEnum.Read)]
        public ActionResult<ItemResponse<InvoiceWithEntities>> GetWithEntitiesById(int id)
        {
            ObjectResult? result = null;

            try
            {
                InvoiceWithEntities? invoiceWithEntities = _invoiceService.GetWithEntitiesById(id);

                if (invoiceWithEntities == null)
                {
                    ErrorResponse response = new ErrorResponse("Invoice not found.");
                    result = NotFound404(response);
                }
                else
                {
                    ItemResponse<InvoiceWithEntities> response = new ItemResponse<InvoiceWithEntities> { Item = invoiceWithEntities };
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
