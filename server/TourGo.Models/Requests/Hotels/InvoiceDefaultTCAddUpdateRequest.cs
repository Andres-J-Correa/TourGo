using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TourGo.Models.Requests.Hotels
{
    public class InvoiceDefaultTCAddUpdateRequest
    {
        [MinLength(2)]
        public string? Terms { get; set; }
    }
}
