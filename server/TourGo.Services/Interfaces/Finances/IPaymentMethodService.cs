using TourGo.Models.Domain;
using TourGo.Models.Domain.Finances;
using TourGo.Models.Requests.Finances;

namespace TourGo.Services.Interfaces.Finances
{
    public interface IPaymentMethodService
    {
        int Add(PaymentMethodAddRequest model, string userId, string hotelId);
        void Delete(int id, string userId, string hotelId);
        List<PaymentMethod>? Get(string hotelId);
        List<Lookup>? GetMinimal(string hotelId);
        void Update(PaymentMethodUpdateRequest model, string userId, string hotelId);
    }
}