using TourGo.Models.Domain.Hotels;
using TourGo.Models.Requests.Hotels;

namespace TourGo.Services.Interfaces.Hotels
{
    public interface IExtraChargeService
    {
        int Create(ExtraChargeAddRequest model, int userId);
        List<ExtraCharge>? GetByHotel(int hotelId);
    }
}