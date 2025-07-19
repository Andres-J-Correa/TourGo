using TourGo.Models.Domain.Hotels;
using TourGo.Models.Requests.Hotels;

namespace TourGo.Services.Interfaces.Hotels
{
    public interface IRoomAvailabilityService
    {
        List<RoomAvailability>? GetAll(string hotelId, DateOnly startDate, DateOnly endDate);
        void Upsert(string hotelId, string userId, RoomAvailabilityUpsertRequest request);
    }
}