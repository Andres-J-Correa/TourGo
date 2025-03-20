using TourGo.Models.Domain.Hotels;
using TourGo.Models.Requests.Hotels;

namespace TourGo.Services.Interfaces.Hotels
{
    public interface IExtraChargeService
    {
        int Create(ExtraChargeAddEditRequest model, int userId);
        List<ExtraCharge>? GetByHotel(int hotelId);
        void Update(ExtraChargeAddEditRequest model, int userId);
        void Delete(int id, int userId);
    }
}