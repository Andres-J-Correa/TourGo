using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using TourGo.Models.Attributes;
using TourGo.Models.Enums.Invoices;
using TourGo.Models.Interfaces;

namespace TourGo.Models.Requests.Invoices
{
    public class InvoiceAddRequest
    {

        [Range(1, Int32.MaxValue)]
        public int ? ParentId { get; set; }

        [MinLength(2)]
        public string? ExternalId { get; set; }

        [Range(0, double.MaxValue)]
        public decimal Subtotal { get; set; }

        [Range(0, double.MaxValue)]
        public decimal Paid { get; set; }

        [Range(0, double.MaxValue)]
        public decimal Charges { get; set; }

        [Required]
        [ValidEnum(typeof (InvoiceTypeEnum))]
        public int TypeId { get; set; }

        [Required]
        [ValidEnum(typeof (InvoiceStatusEnum))]
        public int StatusId { get; set; }

        [Required]
        [Range(1, Int32.MaxValue)]
        public int CustomerId { get; set; }

        // Computed property: Total = Subtotal + Charges
        [JsonIgnore]
        public decimal Total => Subtotal + Charges;

        // Computed property: BalanceDue = Total - Paid
        [JsonIgnore]
        public decimal BalanceDue => Total - Paid;
    }
}
