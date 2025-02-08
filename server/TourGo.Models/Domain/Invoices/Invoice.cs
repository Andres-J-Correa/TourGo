using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TourGo.Models.Domain.Users;

namespace TourGo.Models.Domain.Invoices
{
    public class Invoice
    {
        public int Id { get; set; }
        public string? ExternalId { get; set; }
        public string? Url { get; set; }
        public int BookingId { get; set; }
        public Lookup? Status { get; set; }
        public UserBase? ModifiedBy { get; set; }
        public decimal Subtotal { get; set; }
        public decimal Charges { get; set; }
        public decimal Paid { get; set; }
        public decimal ExternalCommission { get; set; }
    }
}
