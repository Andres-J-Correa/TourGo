using TourGo.Models.Domain;
using TourGo.Models.Domain.Finances;
using TourGo.Models.Domain.Hotels;
using TourGo.Models.Requests.Finances;
using TourGo.Models.Requests.Hotels;

namespace TourGo.Services.Interfaces.Hotels
{
    public interface IHotelService
    {
        int Create(HotelAddRequest model, int userId);
        Hotel? GetDetails(int id);
        List<Lookup>? GetUserHotelsMinimal(int userId);
        Lookup? GetMinimal(int id);
        void Update(HotelUpdateRequest model, int userId);
        void Delete(int id, int userId);
        List<Lookup>? GetFinancePartners(int hotelId);
    }
}