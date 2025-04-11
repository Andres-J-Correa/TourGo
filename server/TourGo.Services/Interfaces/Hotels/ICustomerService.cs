using TourGo.Models.Domain.Customers;
using TourGo.Models.Requests.Customers;

namespace TourGo.Services.Interfaces.Hotels
{
    public interface ICustomerService
    {
        int Add(CustomerAddEditRequest model, int userId);
        Customer? GetByDocumentNumber(string documentNumber, int userId, int hotelId);
    }
}