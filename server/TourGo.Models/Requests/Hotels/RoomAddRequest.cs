using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TourGo.Models.Requests.Hotels
{
    public class RoomAddRequest
    {
        [Required, StringLength(100)]
        public string Name { get; set; }

        [Required, Range(1, 50)]
        public int Capacity { get; set; }

        [StringLength(100, MinimumLength = 2)]
        public string? Description { get; set; }
    }
}
