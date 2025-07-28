using Amazon.Auth.AccessControlPolicy;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using PuppeteerSharp;
using PuppeteerSharp.Media;
using TourGo.Models.Domain.Invoices;
using TourGo.Models.Enums;
using TourGo.Models.Requests.Invoices;
using TourGo.Services;
using TourGo.Services.Interfaces;
using TourGo.Services.Interfaces.Hotels;
using TourGo.Web.Api.Extensions;
using TourGo.Web.Controllers;
using TourGo.Web.Core.Filters;
using TourGo.Web.Models.Responses;


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

        public InvoicesController(ILogger<InvoicesController> logger,
            IInvoiceService invoiceService,
            IWebAuthenticationService<string> webAuthenticationService,
            IErrorLoggingService errorLoggingService,
            ITemplateService templateService) : base(logger)
        {
            _invoiceService = invoiceService;
            _webAuthService = webAuthenticationService;
            _errorLoggingService = errorLoggingService;
            _templateService = templateService;
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
        public async Task<IActionResult> GetPdf(string id, string hotelId)
        {
            try
            {
                InvoicePdfModel? invoicePdfModel = _invoiceService.GetInvoicePdfModel(id, hotelId);

                if (invoicePdfModel == null)
                {
                    ErrorResponse response = new ErrorResponse("Invoice not found.");
                    return NotFound404(response);
                }

                string htmlContent = await _templateService.RenderTemplate("invoice-template", invoicePdfModel);


                var browserFetcher = new BrowserFetcher
                {
                    CacheDir = "/var/www/server-stage"
                };
                await browserFetcher.DownloadAsync(BrowserTag.Stable);
                using var browser = await Puppeteer.LaunchAsync(new LaunchOptions { Headless = true ,Args = [ "--no-sandbox" ] });
                using var page = await browser.NewPageAsync();
                await page.SetContentAsync(htmlContent);

                var pdfOptions = new PdfOptions
                {
                    Format = PaperFormat.A4,
                    MarginOptions = new MarginOptions
                    {
                        Top = "10px",
                        Right = "10px",
                        Bottom = "10px",
                        Left = "10px"
                    }
                };

                var pdfStream = await page.PdfStreamAsync(pdfOptions);
                await page.CloseAsync();
                return File(pdfStream, "application/pdf", $"CxC_{id}_{invoicePdfModel.CustomerFirstName}");
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
