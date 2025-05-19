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
    public class TransactionSubcategoryAddUpdateRequest: IModelIdentifier
    {
        public int Id { get; set; } //hotel when adding, subcategory when updating

        [Required]
        [StringLength(100, MinimumLength = 2)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [ValidEnum(typeof(TransactionCategoryEnum))]
        public int CategoryId { get; set; }
    }
}
