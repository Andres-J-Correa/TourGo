using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TourGo.Models.Requests.Hotels
{
    public class HotelAddRequest
    {
        [Required, StringLength(100)]
        public string Name { get; set; }

        [Required]
        [Phone]
        public string Phone { get; set; }

        [Required, StringLength(200)]
        public string Address { get; set; }

        [Required, StringLength(100)]
        public string Email { get; set; }

        [Required, StringLength(100)]
        public string TaxId { get; set; }
    }
}
