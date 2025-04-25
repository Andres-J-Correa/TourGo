using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TourGo.Models.Interfaces;

namespace TourGo.Models.Requests.Bookings
{
    public class BookingUpdateRequest: BookingAddRequest, IModelIdentifier
    {
        [Required]
        [Range(1, int.MaxValue)]
        public int InvoiceId { get; set; }
    }
}
