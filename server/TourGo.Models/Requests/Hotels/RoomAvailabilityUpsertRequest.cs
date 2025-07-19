using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TourGo.Models.Requests.Hotels
{
    public class RoomAvailabilityRequest
    {
        public int RoomId { get; set; }
        public DateOnly Date { get; set; }
    }

    public class RoomAvailabilityUpsertRequest
    {
        public bool IsOpen { get; set; }
        public List<RoomAvailabilityRequest> Requests { get; set; }
    }
}
