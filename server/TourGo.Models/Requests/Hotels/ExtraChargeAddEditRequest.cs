using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TourGo.Models.Attributes;
using TourGo.Models.Enums;
using TourGo.Models.Interfaces;

namespace TourGo.Models.Requests.Hotels
{
    public class ExtraChargeAddEditRequest : IModelIdentifier
    {
        public int Id { get; set; } // this is the hotel id when adding and the charge id when updating

        [Required, StringLength(100)]
        public string Name { get; set; }

        [Required, ValidEnum(typeof(ExtraChargeTypeEnum))]
        public int TypeId { get; set; }

        [Required]
        [Range(0.001, 9999999.999)]  // Matches DECIMAL(10,3) range (max value is 9,999,999.999)
        public decimal Amount { get; set; }
    }
}
