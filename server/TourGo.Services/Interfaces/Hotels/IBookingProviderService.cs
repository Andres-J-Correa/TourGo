using TourGo.Models.Domain;
using TourGo.Models.Domain.Hotels;
using TourGo.Models.Requests.Hotels;

namespace TourGo.Services.Interfaces.Hotels
{
    public interface IBookingProviderService
    {
        int Add(BookingProviderAddRequest model, string userId, string hotelId);
        void Delete(int id, string userId, string hotelId);
        List<BookingProvider>? Get(string hotelId);
        List<Lookup>? GetMinimal(string hotelId);
        void Update(BookingProviderUpdateRequest model, string userId, string hotelId);
    }
}