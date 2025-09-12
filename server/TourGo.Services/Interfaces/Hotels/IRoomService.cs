using TourGo.Models.Domain.Hotels;
using TourGo.Models.Requests.Hotels;

namespace TourGo.Services.Interfaces.Hotels
{
    public interface IRoomService
    {
        int Create(RoomAddRequest model, string userId, string hotelId);
        List<Room>? GetByHotel(string hotelId, bool? isActive);
        void Update(RoomUpdateRequest model, string userId, string hotelId);
        void Delete(int id, string userId, string hotelId);
        List<Room>? GetAvailableByDate(string hotelId, DateOnly date);
    }
}