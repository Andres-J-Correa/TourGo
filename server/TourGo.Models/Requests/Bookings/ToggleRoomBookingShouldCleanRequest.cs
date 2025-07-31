using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TourGo.Models.Interfaces;

namespace TourGo.Models.Requests.Bookings
{
    public class ToggleRoomBookingShouldCleanRequest
    {
        public string BookingId { get; set; } = string.Empty;
        public int RoomId { get; set; }
        public DateOnly Date { get; set; }
    }
}
