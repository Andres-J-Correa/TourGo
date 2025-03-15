using TourGo.Models.Domain.Hotels;

namespace TourGo.Services.Interfaces.Hotels
{
    public interface IHotelService
    {
        HotelBase? GetHotel(int userId);
    }
}