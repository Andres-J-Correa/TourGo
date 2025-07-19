using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TourGo.Models.Domain.Hotels
{
    public class RoomAvailability
    {
        public int RoomId { get; set; }
        public DateOnly Date { get; set; }
        public bool IsOpen { get; set; }
    }
}
