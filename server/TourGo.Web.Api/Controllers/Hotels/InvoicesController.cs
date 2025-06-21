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
    [Route("api/hotel/{hotelId}/invoices")]
    [ApiController]
    public class InvoicesController : BaseApiController
    {

        private readonly IInvoiceService _invoiceService;
        private readonly IWebAuthenticationService<string> _webAuthService;
        private readonly IErrorLoggingService _errorLoggingService;

        public InvoicesController(ILogger<InvoicesController> logger,
            IInvoiceService invoiceService,
            IWebAuthenticationService<string> webAuthenticationService,
            IErrorLoggingService errorLoggingService) : base(logger)
        {
            _invoiceService = invoiceService;
            _webAuthService = webAuthenticationService;
            _errorLoggingService = errorLoggingService;
        }

        [HttpGet("{id}/entities")]
        [EntityAuth(EntityTypeEnum.Invoices, EntityActionTypeEnum.Read)]
        public ActionResult<ItemResponse<InvoiceWithEntities>> GetWithEntitiesById(string id, string hotelId)
        {
            ObjectResult? result = null;

            try
            {
                InvoiceWithEntities? invoiceWithEntities = _invoiceService.GetWithEntitiesById(id, hotelId);

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
