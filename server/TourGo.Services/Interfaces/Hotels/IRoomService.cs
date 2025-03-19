using TourGo.Models.Domain.Hotels;
using TourGo.Models.Requests.Hotels;

namespace TourGo.Services.Interfaces.Hotels
{
    public interface IRoomService
    {
        int Create(RoomAddRequest model, int userId);
        List<Room>? GetByHotel(int hotelId);
    }
}