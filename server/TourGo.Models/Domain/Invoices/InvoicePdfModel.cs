using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TourGo.Models.Domain.Bookings;

namespace TourGo.Models.Domain.Invoices
{
    public class InvoicePdfModel
    {
        public string InvoiceNumber { get; set; } = string.Empty;
        public string InvoiceDate { get; set; } = DateTime.Now.ToString("dd/MM/yyyy");
        public decimal Subtotal { get; set; }
        public decimal Paid { get; set; }
        public decimal Charges { get; set; }
        public decimal Total { get; set; }
        public decimal Balance { get; set; }
        public string HotelName { get; set; } = string.Empty;
        public string HotelPhone { get; set; } = string.Empty;
        public string HotelEmail { get; set; } = string.Empty;
        public string HotelAddress { get; set; } = string.Empty;
        public string HotelTaxId { get; set; } = string.Empty;
        public string CustomerFirstName { get; set; } = string.Empty;
        public string CustomerLastName { get; set; } = string.Empty;
        public string CustomerPhone { get; set; } = string.Empty;
        public string CustomerEmail { get; set; } = string.Empty;
        public string CustomerDocumentNumber { get; set; } = string.Empty;
        public string InvoiceTerms { get; set; } = string.Empty;

        public List<BookingPdfModel> Bookings { get; set; } = new List<BookingPdfModel>();

    }
}
