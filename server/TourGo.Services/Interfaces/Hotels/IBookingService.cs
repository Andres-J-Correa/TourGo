using TourGo.Models;
using TourGo.Models.Domain;
using TourGo.Models.Domain.Bookings;
using TourGo.Models.Domain.Hotels;
using TourGo.Models.Enums.Bookings;
using TourGo.Models.Requests.Bookings;
using TourGo.Models.Responses;

namespace TourGo.Services.Interfaces
{
    public interface IBookingService
    {
        BookingAddResponse? Add(BookingAddRequest model, string userId, string hotelId, string publicId);
        void Update(BookingsUpdateRequest model, string userId, string hotelId);
        Booking? GetById(string id, string hotelId);
        Paged<BookingMinimal>? GetPaginatedByDateRange(string hotelId, int pageIndex, int pageSize, bool? isArrivalDate,
                                                        string? sortColumn, string? sortDirection, DateOnly? startDate, DateOnly? endDate,
                                                        string? firstName, string? lastName, string? bookingExternalId, int? statusId,
                                                        string? bookingId);
        BookingMinimal? GetBookingMinimal(string bookingId, string hotelId);
        List<RoomBooking>? GetRoomBookingsByDateRange(DateOnly startDate, DateOnly endDate, string hotelId);
        bool IsValidSortDirection(string? direction);
        bool IsValidSortColumn(string? column);
        void UpdateStatus(string bookingId, string userId, BookingStatusEnum status, string hotelId);
        List<BookingArrival>? GetArrivalsByDate(DateOnly arrivalDate, string hotelId);
        List<BookingDeparture>? GetDeparturesByDate(DateOnly departureDate, string hotelId);
        List<BookingStay>? GetStaysByDate(DateOnly date, string hotelId);
        List<RoomBooking>? GetDepartingRoomBookings(DateOnly departureDate, string hotelId);
        List<RoomBooking>? GetArrivingRoomBookings(DateOnly arrivalDate, string hotelId);
        List<string>? GetAvailablePublicIds(List<string> possibleIds);
        void ToggleRoomBookingShouldClean(ToggleRoomBookingShouldCleanRequest model, string hotelId);
        List<RoomBooking>? GetForCleaningRoomBookings(DateOnly date, string hotelId);
        void Activate(string bookingId, string hotelId, int customerId, string userId);
    }
}