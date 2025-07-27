using TourGo.Models.Domain.Hotels;

namespace TourGo.Models.Domain.Bookings
{
    public class GroupedRoomBookingResult
    {
        public string RoomName { get; set; } = string.Empty;
        public string RoomDescription { get; set; } = string.Empty;
        public List<RoomBookingSegment> Segments { get; set; } = new();
        public List<ExtraCharge> RoomCharges { get; set; } = new List<ExtraCharge>();
        public decimal Subtotal => Segments.Sum(s => s.Price);
        public decimal Total => Subtotal + RoomCharges.Sum(c => c.Amount);

        public class RoomBookingSegment
        {
            public DateOnly Date { get; set; }
            public string DisplayDate { get; set; } = string.Empty;
            public decimal Price { get; set; }
        }
    }
}