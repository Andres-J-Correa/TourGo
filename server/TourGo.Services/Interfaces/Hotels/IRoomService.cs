using TourGo.Models.Domain.Hotels;
using TourGo.Models.Requests.Hotels;

namespace TourGo.Services.Interfaces.Hotels
{
    public interface IRoomService
    {
        int Create(RoomAddUpdateRequest model, string userId);
        List<Room>? GetByHotel(int hotelId, bool? isActive);
        void Update(RoomAddUpdateRequest model, string userId);
        void Delete(int id, string userId);
    }
}