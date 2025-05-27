using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TourGo.Models.Requests
{
    public class TokenValidationRequest
    {
        [Required]
        [MinLength(5)]
        public string Token { get; set; }
    }
}
