using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TourGo.Models.Attributes;
using TourGo.Models.Enums.Transactions;
using TourGo.Models.Interfaces;

namespace TourGo.Models.Requests.Finances
{
    public class TransactionAddRequest : IModelIdentifier
    {
        public int Id { get; set; }

        [Required]
        [Range(1, Int32.MaxValue)]
        public int EntityId { get; set; }

        [Range(1, Int32.MaxValue)]
        public int? ParentId { get; set; }

        [Required]
        [Range(1, Int32.MaxValue)]
        public int InvoiceId { get; set; }

        [Required]
        [Range(double.MinValue, double.MaxValue)]
        public decimal Amount { get; set; }

        [Required]
        public DateOnly TransactionDate { get; set; }

        [Required]
        [Range(1, Int32.MaxValue)]
        public int PaymentMethodId { get; set; }

        [Required]
        [ValidEnum(typeof(TransactionCategoryEnum))]
        public int CategoryId { get; set; }

        [Range(1, Int32.MaxValue)]
        public int? SubcategoryId { get; set; }

        [Required]
        [MinLength(2)]
        public string ReferenceNumber { get; set; } = string.Empty;

        [ValidEnum(typeof(TransactionStatusEnum))]
        public int StatusId { get; set; } = 2; // Default to Completed

        [Required]
        [MinLength(2)]
        public string Description { get; set; }

        [Iso4217Currency]
        public string CurrencyCode { get; set; } = "COP"; // Default to COP

        [Range(1, Int32.MaxValue)]
        public int? FinancePartnerId { get; set; }
    }
}
