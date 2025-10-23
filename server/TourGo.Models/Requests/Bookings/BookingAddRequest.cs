using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using TourGo.Models.Attributes;
using TourGo.Models.Enums.Bookings;

namespace TourGo.Models.Requests.Bookings
{
    public class BookingAddRequest
    {
        [Required]
        [Range(1, int.MaxValue)]
        public int CustomerId { get; set; }

        [StringLength(100, MinimumLength = 2)]
        public string? ExternalId { get; set; }

        [Range(1, int.MaxValue)]
        public int? BookingProviderId { get; set; }

        [Required]
        [DateRange("DepartureDate", ErrorMessage = "Start date must be before the end date.")]
        public DateOnly ArrivalDate { get; set; }

        [Required]
        public DateOnly DepartureDate { get; set; }

        public DateTime? ETA { get; set; }

        [Required]
        [Range(1, int.MaxValue)]
        public int AdultGuests { get; set; }

        [Range(0, int.MaxValue)]
        public int? ChildGuests { get; set; }

        [StringLength(1000)]
        public string? Notes { get; set; }

        [Range(0, double.MaxValue)]
        public decimal? ExternalCommission { get; set; }

        [Required]
        [Range(0.001, double.MaxValue)]
        public decimal Subtotal { get; set; }

        [Required]
        [Range(0, double.MaxValue)]
        public decimal Charges { get; set; }

        [Required]
        [ValidEnum(typeof(BookingStatusEnum))]
        public int StatusId { get; set; }

        [JsonIgnore]
        public decimal Total => Subtotal + Charges;

        [Required]
        public List<RoomBookingsAddRequest> RoomBookings { get; set; }

        public List<BookingExtraChargesAddRequest>? ExtraCharges { get; set; }

        public List<BookingPersonalizedChargeAddRequest>? PersonalizedCharges { get; set; }
    }
}
