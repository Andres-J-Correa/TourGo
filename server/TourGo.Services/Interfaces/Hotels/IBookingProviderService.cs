using TourGo.Models.Domain;
using TourGo.Models.Domain.Hotels;
using TourGo.Models.Requests.Hotels;

namespace TourGo.Services.Interfaces.Hotels
{
    public interface IBookingProviderService
    {
        int Add(BookingProviderAddUpdateRequest model, int userId);
        void Delete(int id, int userId);
        List<BookingProvider>? Get(int hotelId);
        List<Lookup>? GetMinimal(int hotelId);
        void Update(BookingProviderAddUpdateRequest model, int userId);
    }
}