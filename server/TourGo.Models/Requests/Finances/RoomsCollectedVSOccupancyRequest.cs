using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TourGo.Models.Requests.Finances
{
    public class RoomsCollectedVSOccupancyRequest
    {
        [Required]
        public DateOnly StartDate { get; set; }

        [Required]
        public DateOnly EndDate { get; set; }

        [Required]
        [Length(1, int.MaxValue, ErrorMessage = "At least one room ID must be provided.")]
        public List<int> RoomIds { get; set; } = new List<int>();
    }
}
