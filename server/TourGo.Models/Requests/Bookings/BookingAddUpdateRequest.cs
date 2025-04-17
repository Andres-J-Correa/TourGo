using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TourGo.Models.Attributes;
using TourGo.Models.Interfaces;

namespace TourGo.Models.Requests.Bookings
{
    public class BookingAddUpdateRequest: IModelIdentifier
    {
		public int Id { get; set; }

		[Required]
		[Range(1, int.MaxValue)]
		public int CustomerId { get; set; }

		[StringLength(100)]
		public string ExternalId { get; set; }

		[Range(1, int.MaxValue)]
		public int BookingProviderId { get; set; }

		[Required]
		[DateRange("DepartureDate", ErrorMessage = "Start date must be before the end date.")]
        public DateOnly ArrivalDate { get; set; }

		[Required]
		public DateOnly DepartureDate { get; set; }

		public DateTime ETA { get; set; }

		[Range(1, int.MaxValue)]
		public int AdultGuests { get; set; }

		[Range(0, int.MaxValue)]
		public int ChildGuests { get; set; }

		[StringLength(1000)]
		public string Notes { get; set; }

		[Range(0, int.MaxValue)]
		public decimal ExternalComission { get; set; }
		public List<RoomBookingsAddRequest>? RoomBookings { get; set; }
		public List<BookingExtraChargesAddRequest>? ExtraCharges { get; set; }
    }
}
