using TourGo.Models;
using TourGo.Models.Domain.Bookings;
using TourGo.Models.Domain.Hotels;
using TourGo.Models.Requests.Bookings;

namespace TourGo.Services.Interfaces
{
    public interface IBookingService
    {
        int Add(BookingAddUpdateRequest model, int userId, int hotelId);
        Booking? GetById(int id);
        List<ExtraCharge>? GetExtraChargesByBookingId(int bookingId);
        List<RoomBooking>? GetRoomBookingsByBookingId(int bookingId);
    }
}