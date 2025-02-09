using TourGo.Models;
using TourGo.Models.Domain.Bookings;

namespace TourGo.Services.Interfaces.Bookings
{
    public interface IBookingService
    {
        Paged<BookingBase>? GetBookingsByArrivalDate(DateOnly startDate, DateOnly endDate, int pageIndex, int pageSize, int userId);
        Paged<BookingBase>? GetBookingsByDepartureDate(DateOnly startDate, DateOnly endDate, int pageIndex, int pageSize, int userId);
    }
}