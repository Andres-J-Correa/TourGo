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
using SelectPdf;

namespace TourGo.Web.Api.Controllers.Hotels
{
    [Route("api/hotel/{hotelId}/invoices")]
    [ApiController]
    public class InvoicesController : BaseApiController
    {

        private readonly IInvoiceService _invoiceService;
        private readonly IWebAuthenticationService<string> _webAuthService;
        private readonly IErrorLoggingService _errorLoggingService;
        private readonly ITemplateService _templateService;
        private readonly ISelectPdfService _selectPdfService;

        public InvoicesController(ILogger<InvoicesController> logger,
            IInvoiceService invoiceService,
            IWebAuthenticationService<string> webAuthenticationService,
            IErrorLoggingService errorLoggingService,
            ITemplateService templateService,
            ISelectPdfService selectPdfService) : base(logger)
        {
            _invoiceService = invoiceService;
            _webAuthService = webAuthenticationService;
            _errorLoggingService = errorLoggingService;
            _templateService = templateService;
            _selectPdfService = selectPdfService;
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

        [HttpGet("{id}/pdf")]
        [EntityAuth(EntityTypeEnum.Invoices, EntityActionTypeEnum.Read)]
        public async Task<ActionResult> GetPdf(string id, string hotelId)
        {
            try
            {
                InvoicePdfModel? invoicePdfModel = _invoiceService.GetInvoicePdfModel(id, hotelId);

                if(invoicePdfModel == null)
                {
                    ErrorResponse response = new ErrorResponse("Invoice not found.");
                    return NotFound404(response);
                }

                string htmlContent = await _templateService.RenderTemplate("invoice-template", invoicePdfModel);

                PdfDocument pdf = _selectPdfService.GetPdfFromHtml(htmlContent);

                byte[] pdfBytes = pdf.Save();
                pdf.Close();
                return File(pdfBytes, "application/pdf", $"Invoice_{id}.pdf");
            }
            catch (Exception ex)
            {
                Logger.LogErrorWithDb(ex, _errorLoggingService, HttpContext);
                ErrorResponse response = new ErrorResponse();
                return StatusCode(500, response);
            }
        }

    }
}
