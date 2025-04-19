using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TourGo.Models.Domain.Customers;
using TourGo.Models.Domain.Finances;
using TourGo.Models.Domain.Invoices;
using TourGo.Models.Domain.Users;

namespace TourGo.Models.Domain.Bookings
{
    public class Booking
    {
        public int Id { get; set; }
        public string? ExternalId { get; set; }
        public DateOnly ArrivalDate { get; set; }
        public DateOnly DepartureDate { get; set; }
        public DateTime ETA { get; set; }
        public int AdultGuests { get; set; }
        public int ChildGuests { get; set; }
        public Lookup? Status { get; set; }
        public string? Notes { get; set; }
        public DateTime DateCreated { get; set; }
        public DateTime DateModified { get; set; }
        public UserBase? ModifiedBy { get; set; }
        public Customer? Customer { get; set; }
        public Lookup? BookingProvider { get; set; }
        public decimal ExternalCommission { get; set; }
        public int Nights { get; set; }

        public decimal Subtotal { get; set; }
        public decimal Charges { get; set; }
        public decimal Total { get; set; }
        public List<Transaction>? Transactions { get; set; }
        public int InvoiceId { get; set; }

    }
}
