using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TourGo.Models.Domain.Customers;
using TourGo.Models.Enums.Bookings;

namespace TourGo.Models.Domain.Bookings
{
    public class BookingMinimal: AuditableEntity
    {
        public string Id { get; set; } = string.Empty;
        public string? ExternalBookingId { get; set; }
        public DateOnly ArrivalDate { get; set; }
        public DateOnly DepartureDate { get; set; }
        public decimal Total { get; set; }
        public decimal BalanceDue { get; set; }
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public int StatusId { get; set; }
    }
}
