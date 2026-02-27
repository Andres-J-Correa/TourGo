using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TourGo.Models.Requests.Bookings
{
    public class GetBookingsPaginatedRequest
    {
        public List<int>? StatusIds { get; set; }
        public List<int>? RoomIds { get; set; }
    }
}
