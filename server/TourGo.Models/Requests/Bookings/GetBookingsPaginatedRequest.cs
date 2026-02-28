using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TourGo.Models.Requests.Bookings
{
    public class GetBookingsPaginatedRequest
    {
        public List<int>? StatusIds { get; set; }
        public List<int>? RoomIds { get; set; }

        [Length(0,4)]
        public string? Phone { get; set; }

        [Length(0,100)]
        public string? DocumentNumber { get; set; }

        [Length(0, 100)]
        public string? FirstName { get; set; }

        [Length(0, 100)]
        public string? LastName { get; set; }
    }
}
