using TourGo.Models;
using TourGo.Models.Domain;
using TourGo.Models.Domain.Bookings;
using TourGo.Models.Domain.Hotels;
using TourGo.Models.Requests.Bookings;
using TourGo.Models.Responses;

namespace TourGo.Services.Interfaces
{
    public interface IBookingService
    {
        BookingAddResponse? Add(BookingAddUpdateRequest model, int userId, int hotelId);
        void Update(BookingAddUpdateRequest model, int userId);
        Booking? GetById(int id);
        List<ExtraCharge>? GetExtraChargesByBookingId(int bookingId);
        List<RoomBooking>? GetRoomBookingsByBookingId(int bookingId);
        List<RoomBooking>? GetRoomBookingsByDateRange(DateOnly startDate, DateOnly endDate, int hotelId);
        List<Lookup>? GetBookingProviders(int hotelId);
    }
}