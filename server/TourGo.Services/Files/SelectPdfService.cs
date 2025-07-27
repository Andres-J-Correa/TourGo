using SelectPdf;
using TourGo.Services.Interfaces;


namespace TourGo.Services.Files
{
    public class SelectPdfService : ISelectPdfService
    {

        public PdfDocument GetPdfFromHtml(string htmlContent)
        {
            HtmlToPdf converter = new HtmlToPdf();
            converter.Options.PdfPageSize = PdfPageSize.A4;
            converter.Options.PdfPageOrientation = PdfPageOrientation.Portrait;
            converter.Options.MarginTop = 10;
            converter.Options.MarginBottom = 10;
            converter.Options.MarginLeft = 10;
            converter.Options.MarginRight = 10;

            PdfDocument doc = converter.ConvertHtmlString(htmlContent);

            return doc;
        }
    }
}
