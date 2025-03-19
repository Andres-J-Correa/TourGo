using TourGo.Models.Domain.Hotels;
using TourGo.Models.Requests.Hotels;

namespace TourGo.Services.Interfaces.Hotels
{
    public interface IHotelService
    {
        int Create(HotelAddRequest model, int userId);
        Hotel? GetById(int id);
        List<Hotel>? GetUserHotels(int userId);
    }
}