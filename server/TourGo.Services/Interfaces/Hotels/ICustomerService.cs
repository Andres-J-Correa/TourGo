using TourGo.Models.Domain.Customers;
using TourGo.Models.Requests.Customers;

namespace TourGo.Services.Interfaces.Hotels
{
    public interface ICustomerService
    {
        int Add(CustomerAddRequest model, string userId, string hotelId);
        Customer? GetByDocumentNumber(string documentNumber, string userId, string hotelId);
        void Update(CustomerUpdateRequest model, string userId, string hotelId);
    }
}