using TourGo.Models.Domain.Hotels;
using TourGo.Models.Requests.Hotels;

namespace TourGo.Services.Interfaces.Hotels
{
    public interface IExtraChargeService
    {
        int Create(ExtraChargeAddUpdateRequest model, string userId);
        List<ExtraCharge>? GetByHotel(int hotelId, bool? isActive);
        void Update(ExtraChargeAddUpdateRequest model, string userId);
        void Delete(int id, string userId);
    }
}