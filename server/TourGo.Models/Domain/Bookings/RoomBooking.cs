using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TourGo.Models.Domain.Hotels;

namespace TourGo.Models.Domain.Bookings
{
    public class RoomBooking
    {
		public DateOnly Date { get; set; }
		public Room Room { get; set; }
        public int BookingId { get; set; }
        public decimal Price { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
	}
}
