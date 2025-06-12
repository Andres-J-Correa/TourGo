using TourGo.Models.Domain.Invoices;
using TourGo.Models.Requests.Invoices;

namespace TourGo.Services.Interfaces.Hotels
{
    public interface IInvoiceService
    {
        int Add(InvoiceAddRequest model, string userId, string hotelId);
        void Update(InvoiceUpdateRequest model, string userId);
        InvoiceWithEntities? GetWithEntitiesById(int invoiceId);
    }
}