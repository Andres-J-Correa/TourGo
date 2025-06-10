using TourGo.Models.Domain.Customers;
using TourGo.Models.Requests.Customers;

namespace TourGo.Services.Interfaces.Hotels
{
    public interface ICustomerService
    {
        int Add(CustomerAddUpdateRequest model, string userId);
        Customer? GetByDocumentNumber(string documentNumber, string userId, int hotelId);
    }
}