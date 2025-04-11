using TourGo.Models.Requests.Invoices;

namespace TourGo.Services.Interfaces.Hotels
{
    public interface IInvoiceService
    {
        string? Add(InvoiceAddRequest model, int userId);
    }
}