using TourGo.Models.Domain.Hotels;
using TourGo.Models.Requests.Hotels;

namespace TourGo.Services.Interfaces.Hotels
{
    public interface IRoomService
    {
        int Create(RoomAddUpdateRequest model, int userId);
        List<Room>? GetByHotel(int hotelId, bool? isActive);
        void Update(RoomAddUpdateRequest model, int userId);
        void Delete(int id, int userId);
    }
}