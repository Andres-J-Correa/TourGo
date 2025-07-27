using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TourGo.Models.Domain.Hotels;

namespace TourGo.Models.Domain.Bookings
{
    public class BookingPdfModel
    {
        public string Id { get; set; } = string.Empty;
        public string ArrivalDate { get; set; } = string.Empty;
        public string DepartureDate { get; set; } = string.Empty;
        public int AdultGuests { get; set; }
        public int ChildGuests { get; set; }
        public decimal Subtotal { get; set; }
        public decimal Charges { get; set; }
        public decimal Total { get; set; }
        public List<ExtraCharge> GeneralCharges { get; set; } = new List<ExtraCharge>();
        public List<ExtraCharge> ExtraCharges { get; set; } = new List<ExtraCharge>();
        public List<GroupedRoomBookingResult> RoomBookings { get; set; } = new List<GroupedRoomBookingResult>();
        public List<RoomBooking> RawRoomBookings { get; set; } = new List<RoomBooking>();
    }
}
