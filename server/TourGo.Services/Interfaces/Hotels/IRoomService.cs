using TourGo.Models.Domain.Hotels;
using TourGo.Models.Requests.Hotels;

namespace TourGo.Services.Interfaces.Hotels
{
    public interface IRoomService
    {
        int Create(RoomAddEditRequest model, int userId);
        List<Room>? GetByHotel(int hotelId);
        void Update(RoomAddEditRequest model, int userId);
        void Delete(int id, int userId);
    }
}