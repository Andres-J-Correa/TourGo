using TourGo.Models;
using TourGo.Models.Domain.Bookings;
using TourGo.Models.Requests.Bookings;

namespace TourGo.Services.Interfaces.Bookings
{
    public interface IBookingService
    {
        Paged<BookingBase>? GetBookingsByArrivalDate(DateOnly startDate, DateOnly endDate, int pageIndex, int pageSize, int userId, int hotelId);
        Paged<BookingBase>? GetBookingsByDepartureDate(DateOnly startDate, DateOnly endDate, int pageIndex, int pageSize, int userId, int hotelId);
        int Add(BookingAddEditRequest model, int userId, int hotelId);
    }
}