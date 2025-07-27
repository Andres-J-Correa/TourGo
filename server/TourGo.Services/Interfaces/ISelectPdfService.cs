using SelectPdf;

namespace TourGo.Services.Interfaces
{
    public interface ISelectPdfService
    {
        PdfDocument GetPdfFromHtml(string htmlContent);
    }
}