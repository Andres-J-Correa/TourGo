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
    public class TransactionFileAddRequest : IModelIdentifier
    {
        public int Id { get; set; }

        [Required]
        public IFormFile File { get; set; }

        [Required]
        [ValidEnum(typeof(TransactionCategoryEnum))]
        public int CategoryId { get; set; }
    }
}
