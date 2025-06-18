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
    public class TransactionUpdateRequest: IModelIdentifierString
    {
        public string Id { get; set; } = string.Empty;

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

        [MinLength(2)]
        public string? ReferenceNumber { get; set; }

        [StringLength(500, MinimumLength = 2)]
        public string? Description { get; set; }

        [Iso4217Currency]
        public string CurrencyCode { get; set; } = "COP"; // Default to COP

        [Range(1, Int32.MaxValue)]
        public int? FinancePartnerId { get; set; }
    }
}
