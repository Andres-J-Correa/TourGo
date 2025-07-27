using System;
using System.Collections.Generic;
using System.Linq;
using TourGo.Models.Domain.Hotels;
using TourGo.Models.Enums;

namespace TourGo.Models.Domain.Bookings
{
    public static class RoomBookingGrouper
    {
        public static List<GroupedRoomBookingResult> GroupRoomBookings(
            List<RoomBooking>? roomBookings,
            List<ExtraCharge> extraCharges)
        {
            if (roomBookings == null) return new();

            var grouped = roomBookings
                .GroupBy(b => b.Room?.Id)
                .Select(g =>
                {
                    var first = g.FirstOrDefault();
                    var segments = g.Select(b => new GroupedRoomBookingResult.RoomBookingSegment
                    {
                        Date = b.Date,
                        DisplayDate = b.Date.ToString("yyyy-MM-dd"),
                        Price = b.Price
                    }).ToList();

                    var groupSubtotal = segments.Sum(s => s.Price);

                    var mappedCharges = extraCharges.Select(charge =>
                    {
                        decimal amount = 0;
                        switch ((ExtraChargeTypeEnum)charge.Type.Id)
                        {
                            case ExtraChargeTypeEnum.Percentage:
                                amount = groupSubtotal * charge.Amount;
                                break;
                            case ExtraChargeTypeEnum.Daily:
                                amount = charge.Amount * segments.Count;
                                break;
                            default:
                                amount = charge.Amount;
                                break;
                        }
                        return new ExtraCharge
                        {
                            Name = charge.Name,
                            Amount = amount,
                        };
                    }).ToList();

                    return new GroupedRoomBookingResult
                    {
                        RoomName = first?.Room?.Name ?? string.Empty,
                        RoomDescription = first?.Room?.Description ?? string.Empty,
                        Segments = segments,
                        RoomCharges = mappedCharges
                    };
                })
                .OrderBy(gr =>
                    gr.Segments.Count == 0
                        ? DateOnly.MaxValue
                        : gr.Segments.Min(s => s.Date)
                )
                .ToList();

            return grouped;
        }
    }
}