using TourGo.Models.Domain;
using TourGo.Models.Domain.Finances;
using TourGo.Models.Requests.Finances;

namespace TourGo.Services.Interfaces.Finances
{
    public interface IPaymentMethodService
    {
        int Add(PaymentMethodAddUpdateRequest model, string userId);
        void Delete(int id, string userId);
        List<PaymentMethod>? Get(int hotelId);
        List<Lookup>? GetMinimal(int hotelId);
        void Update(PaymentMethodAddUpdateRequest model, string userId);
    }
}