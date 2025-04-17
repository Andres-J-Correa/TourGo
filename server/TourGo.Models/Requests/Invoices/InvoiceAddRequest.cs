using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TourGo.Models.Attributes;
using TourGo.Models.Enums.Invoices;
using TourGo.Models.Interfaces;

namespace TourGo.Models.Requests.Invoices
{
    public class InvoiceAddRequest : IModelIdentifier
    {
        public int Id { get; set; }

        [Range(1, Int32.MaxValue)]
        public int ? ParentId { get; set; }

        [Required]
        [MinLength(2)]
        public string ExternalId { get; set; } = string.Empty;

        public string? Url { get; set; }

        [Required]
        [Range(0.001, double.MaxValue)]
        public decimal Subtotal { get; set; }

        [Required]
        [Range(0.001, double.MaxValue)]
        public decimal Paid { get; set; }

        [Required]
        [Range(0.001, double.MaxValue)]
        public decimal Charges { get; set; }

        [Required]
        [Range(0.001, double.MaxValue)]
        public decimal Total { get; set; }

        [Required]
        [Range(double.MinValue, double.MaxValue)]
        public decimal BalanceDue { get; set; }

        [Required]
        [ValidEnum(typeof (InvoiceTypeEnum))]
        public int TypeId { get; set; }

        [Required]
        [ValidEnum(typeof (InvoiceStatusEnum))]
        public int StatusId { get; set; }

        [Required]
        [Range(1, Int32.MaxValue)]
        public int CustomerId { get; set; }

    }
}
