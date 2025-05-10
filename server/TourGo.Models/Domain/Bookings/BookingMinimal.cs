using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TourGo.Models.Domain.Customers;

namespace TourGo.Models.Domain.Bookings
{
    public class BookingMinimal
    {
        public int Id { get; set; }
        public string? ExternalId { get; set; }
        public DateOnly ArrivalDate { get; set; }
        public DateOnly DepartureDate { get; set; }
        public decimal Total { get; set; }
        public decimal BalanceDue { get; set; }
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
    }
}
