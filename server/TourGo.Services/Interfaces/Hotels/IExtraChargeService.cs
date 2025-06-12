using TourGo.Models.Domain.Hotels;
using TourGo.Models.Requests.Hotels;

namespace TourGo.Services.Interfaces.Hotels
{
    public interface IExtraChargeService
    {
        int Create(ExtraChargeAddRequest model, string userId, string hotelId);
        List<ExtraCharge>? GetByHotel(string hotelId, bool? isActive);
        void Update(ExtraChargeUpdateRequest model, string userId);
        void Delete(int id, string userId);
    }
}