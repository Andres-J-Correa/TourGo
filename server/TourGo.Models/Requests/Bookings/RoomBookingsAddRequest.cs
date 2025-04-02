using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TourGo.Models.Requests.Bookings
{
    public class RoomBookingsAddRequest
    {
        public int RoomId { get; set; }
        public DateOnly Date { get; set; }
        public decimal Price { get; set; }
    }
}
