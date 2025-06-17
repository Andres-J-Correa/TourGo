using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TourGo.Models.Domain.Customers;

namespace TourGo.Models.Domain.Bookings
{
    public class BookingArrival
    {
        public string Id { get; set; }
        public string? ExternalBookingId { get; set; }
        public string? BookingProviderName { get; set; }
        public DateTime? ETA { get; set; }
        public int StatusId { get; set; }
        public string? Notes { get; set; }
        public int Nights { get; set; }
        public decimal Total { get; set; }
        public decimal BalanceDue { get; set; }
        public List<Lookup>? ArrivingRooms { get; set; }
        public List<Lookup>? OtherRooms { get; set;}
        public Customer Customer { get; set; } = new Customer();
    }
}
