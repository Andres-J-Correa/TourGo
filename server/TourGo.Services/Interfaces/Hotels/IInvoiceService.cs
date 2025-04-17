using TourGo.Models.Requests.Invoices;

namespace TourGo.Services.Interfaces.Hotels
{
    public interface IInvoiceService
    {
        int Add(InvoiceAddRequest model, int userId);
        void Update(InvoiceUpdateRequest model, int userId);
    }
}