using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TourGo.Models.Attributes;
using TourGo.Models.Enums.Transactions;

namespace TourGo.Models.Requests.Finances
{
    public class TransactionSubcategoryAddRequest
    {
        [Required]
        [StringLength(100, MinimumLength = 2)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [ValidEnum(typeof(TransactionCategoryEnum))]
        public int CategoryId { get; set; }
    }
}
