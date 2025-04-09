using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TourGo.Models.Requests.Customers
{
    public class CustomerGetRequest
    {
        [Required]
        [StringLength(100)]
        public string Id { get; set; }
    }
}
