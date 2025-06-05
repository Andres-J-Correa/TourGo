using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TourGo.Models.Domain.Customers;

namespace TourGo.Models.Domain.Bookings
{
    public class BookingStay
    {
        public int Id { get; set; }
        public string? ExternalBookingId { get; set; }
        public string? BookingProviderName { get; set; }
        public int StatusId { get; set; }
        public string? Notes { get; set; }
        public int Nights { get; set; }
        public DateOnly ArrivalDate { get; set; }
        public DateOnly DepartureDate { get; set; }
        public List<Lookup>? Rooms { get; set; }
        public Customer Customer { get; set; } = new Customer();
    }
}
