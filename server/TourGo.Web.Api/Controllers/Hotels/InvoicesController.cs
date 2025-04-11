using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using TourGo.Models.Enums;
using TourGo.Models.Requests.Invoices;
using TourGo.Services;
using TourGo.Services.Interfaces.Hotels;
using TourGo.Web.Controllers;
using TourGo.Web.Core.Filters;
using TourGo.Web.Models.Responses;

namespace TourGo.Web.Api.Controllers.Hotels
{
    [Route("api/invoices")]
    [ApiController]
    public class InvoicesController : BaseApiController
    {

        private readonly IInvoiceService _invoiceService;
        private readonly IWebAuthenticationService<int> _webAuthService;

        public InvoicesController(ILogger<InvoicesController> logger, IInvoiceService invoiceService, IWebAuthenticationService<int> webAuthenticationService) : base(logger)
        {
            _invoiceService = invoiceService;
            _webAuthService = webAuthenticationService;
        }

        [HttpPost("hotel/{id:int}")]
        [EntityAuth(EntityTypeEnum.Bookings, EntityActionTypeEnum.Create)]
        public ActionResult<ItemResponse<string>> Add(InvoiceAddRequest model)
        {
            ObjectResult result = null;

            try
            {
                int userId = _webAuthService.GetCurrentUserId();
                string? id = _invoiceService.Add(model, userId);

                if( string.IsNullOrEmpty(id) )
                {
                    throw new Exception("Invoice not created");
                }              

                ItemResponse<string> response = new ItemResponse<string> { Item = id };
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
    }
}
