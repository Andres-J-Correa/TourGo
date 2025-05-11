using MySql.Data.MySqlClient;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TourGo.Data;
using TourGo.Data.Providers;
using TourGo.Models;
using TourGo.Models.Domain;
using TourGo.Models.Domain.Bookings;
using TourGo.Models.Domain.Customers;
using TourGo.Models.Domain.Finances;
using TourGo.Models.Domain.Hotels;
using TourGo.Models.Domain.Invoices;
using TourGo.Models.Domain.Users;
using TourGo.Models.Requests.Bookings;
using TourGo.Models.Responses;
using TourGo.Services.Customers;
using TourGo.Services.Finances;
using TourGo.Services.Interfaces;

namespace TourGo.Services.Hotels
{
    public class BookingService : IBookingService
    {
        private readonly IMySqlDataProvider _mySqlDataProvider;
        public HashSet<string> BookingSortColumns { get; }

        public BookingService(IMySqlDataProvider dataProvider)
        {
            _mySqlDataProvider = dataProvider;
            BookingSortColumns = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
            {
                "ArrivalDate",
                "DepartureDate",
                "Total",
                "BalanceDue",
                "FirstName",
                "LastName",
            };
        }

        public Booking? GetById(int id)
        {
            string proc = "bookings_select_details_by_id";
            Booking? booking = null;

            _mySqlDataProvider.ExecuteCmd(proc, (param) =>
            {
                param.AddWithValue("p_bookingId", id);
            }, (reader, set) =>
            {
                int index = 0;

                if (set == 0)
                {
                    booking = MapBooking(reader, ref index);
                }

                if (set == 1 && booking != null)
                {
                    index = 0;
                    booking.Customer = CustomerService.MapCustomer(reader, ref index);
                }

                if (set == 2 && booking != null)
                {
                    index = 0;
                    Transaction transaction = TransactionService.MapTransaction(reader, ref index);
                    booking.Transactions ??= new List<Transaction>();
                    booking.Transactions.Add(transaction);
                }
            });

            return booking;
        }

        public Paged<BookingMinimal>? GetPaginatedByDateRange (DateOnly startDate, DateOnly endDate, bool isArrivalDate, int hotelId, int pageIndex, int pageSize,
                                                                string sortColumn, string sortDirection, string? firstName, string? lastName)
        {
            string proc = "bookings_select_minimal_by_date_range_paginated";
            Paged<BookingMinimal>? paged = null;
            List<BookingMinimal>? bookings = null;
            int totalCount = 0;

            sortColumn = string.IsNullOrWhiteSpace(sortColumn) ? "ArrivalDate" : sortColumn;
            sortDirection = string.IsNullOrWhiteSpace(sortDirection) ? "ASC" : sortDirection;

            _mySqlDataProvider.ExecuteCmd(proc, (param) =>
            {
                param.AddWithValue("p_startDate", startDate.ToString("yyyy-MM-dd"));
                param.AddWithValue("p_endDate", endDate.ToString("yyyy-MM-dd"));
                param.AddWithValue("p_isArrivalDate", isArrivalDate ? 1 : 0);
                param.AddWithValue("p_hotelId", hotelId);
                param.AddWithValue("p_pageIndex", pageIndex);
                param.AddWithValue("p_pageSize", pageSize);
                param.AddWithValue("p_sortColumn", sortColumn);
                param.AddWithValue("p_sortDirection", sortDirection);
                param.AddWithValue("p_firstName", string.IsNullOrWhiteSpace(firstName) ? DBNull.Value : firstName);
                param.AddWithValue("p_lastName", string.IsNullOrWhiteSpace(lastName) ? DBNull.Value : lastName);
            }, (reader, set) =>
            {
                int index = 0;
                BookingMinimal booking = new BookingMinimal();
                booking.Id = reader.GetSafeInt32(index++);
                booking.ExternalId = reader.GetSafeString(index++);
                booking.ArrivalDate = DateOnly.FromDateTime(reader.GetSafeDateTime(index++));
                booking.DepartureDate = DateOnly.FromDateTime(reader.GetSafeDateTime(index++));
                booking.Total = reader.GetSafeDecimal(index++);
                booking.BalanceDue = reader.GetSafeDecimal(index++);
                booking.FirstName = reader.GetSafeString(index++);
                booking.LastName = reader.GetSafeString(index++);
                booking.HotelId = hotelId;

                if(totalCount == 0)
                {
                    totalCount = reader.GetSafeInt32(index++);
                }

                bookings ??= new List<BookingMinimal>();
                bookings.Add(booking);
            });

            if(bookings != null)
            {
                paged = new Paged<BookingMinimal>(
                    bookings,
                    pageIndex,
                    pageSize,
                    totalCount
                );
            }

            return paged;
        }
        public BookingAddResponse? Add(BookingAddUpdateRequest model, int userId, int hotelId)
        {
            BookingAddResponse? response = null;

            string proc = "bookings_insert";
            _mySqlDataProvider.ExecuteCmd(proc, (coll) =>
            {
                coll.AddWithValue("p_customerId", model.CustomerId);
                coll.AddWithValue("p_externalBookingId", string.IsNullOrEmpty(model.ExternalId) ? (object)DBNull.Value : model.ExternalId);
                coll.AddWithValue("p_bookingProviderId", model.BookingProviderId > 0 ? model.BookingProviderId: DBNull.Value);
                coll.AddWithValue("p_arrivalDate", model.ArrivalDate.ToString("yyyy-MM-dd"));
                coll.AddWithValue("p_departureDate", model.DepartureDate.ToString("yyyy-MM-dd"));
                coll.AddWithValue("p_eta", model.ETA?.ToString("yyyy-MM-ddTHH:mm:ss") ?? (object)DBNull.Value);
                coll.AddWithValue("p_adultGuests", model.AdultGuests);
                coll.AddWithValue("p_childGuests", model.ChildGuests > 0 ? model.ChildGuests : DBNull.Value);
                coll.AddWithValue("p_notes", model.Notes ?? (object)DBNull.Value);
                coll.AddWithValue("p_modifiedBy", userId);
                coll.AddWithValue("p_hotelId", hotelId);
                coll.AddWithValue("p_externalComission", model.ExternalCommission > 0 ? model.ExternalCommission: 0);
                coll.AddWithValue("p_roomBookingsJson", JsonConvert.SerializeObject(model.RoomBookings));
                coll.AddWithValue("p_extraChargesJson", model.ExtraCharges?.Count > 0 ? JsonConvert.SerializeObject(model.ExtraCharges) : DBNull.Value);
                coll.AddWithValue("p_subtotal", model.Subtotal);
                coll.AddWithValue("p_charges", model.Charges);
                coll.AddWithValue("p_total", model.Total);

            }, (reader, set) =>
            {
                response = new BookingAddResponse();
                int index = 0;
                response.BookingId = reader.GetSafeInt32(index++);
                response.InvoiceId = reader.GetSafeInt32(index++);
            });

            return response;
        }

        public void Update(BookingAddUpdateRequest model, int userId)
        {
            string proc = "bookings_update";
            _mySqlDataProvider.ExecuteNonQuery(proc, (coll) =>
            {
                coll.AddWithValue("p_id", model.Id);
                coll.AddWithValue("p_externalBookingId", string.IsNullOrEmpty(model.ExternalId) ? (object)DBNull.Value : model.ExternalId);
                coll.AddWithValue("p_bookingProviderId", model.BookingProviderId > 0 ? model.BookingProviderId : DBNull.Value);
                coll.AddWithValue("p_arrivalDate", model.ArrivalDate.ToString("yyyy-MM-dd"));
                coll.AddWithValue("p_departureDate", model.DepartureDate.ToString("yyyy-MM-dd"));
                coll.AddWithValue("p_eta", model.ETA?.ToString("yyyy-MM-ddTHH:mm:ss") ?? (object)DBNull.Value);
                coll.AddWithValue("p_adultGuests", model.AdultGuests);
                coll.AddWithValue("p_childGuests", model.ChildGuests > 0 ? model.ChildGuests : DBNull.Value);
                coll.AddWithValue("p_notes", model.Notes ?? (object)DBNull.Value);
                coll.AddWithValue("p_modifiedBy", userId);
                coll.AddWithValue("p_externalComission", model.ExternalCommission > 0 ? model.ExternalCommission : 0);
                coll.AddWithValue("p_roomBookingsJson", JsonConvert.SerializeObject(model.RoomBookings));
                coll.AddWithValue("p_extraChargesJson", model.ExtraCharges?.Count > 0 ? JsonConvert.SerializeObject(model.ExtraCharges) : DBNull.Value);
                coll.AddWithValue("p_subtotal", model.Subtotal);
                coll.AddWithValue("p_charges", model.Charges);
                coll.AddWithValue("p_total", model.Total);

            });
        }

        public List<ExtraCharge>? GetExtraChargesByBookingId(int bookingId)
        {
            string proc = "booking_extra_charges_select_by_booking_id";
            List<ExtraCharge>? list = null;

            _mySqlDataProvider.ExecuteCmd(proc, (param) =>
            {
                param.AddWithValue("p_bookingId", bookingId);
            }, (reader, set) =>
            {
                int index = 0;
                list ??= new List<ExtraCharge>();
                ExtraCharge extraCharge = ExtraChargeService.MapExtraCharge(reader, ref index);
                list.Add(extraCharge);
            });

            return list;
        }

        public List<RoomBooking>? GetRoomBookingsByBookingId(int bookingId)
        {
            string proc = "room_bookings_select_by_booking_id";
            List<RoomBooking>? list = null;

            _mySqlDataProvider.ExecuteCmd(proc, (param) =>
            {
                param.AddWithValue("p_bookingId", bookingId);
            }, (reader, set) =>
            {
                int index = 0;
                list ??= new List<RoomBooking>();
                RoomBooking roomBooking = MapRoomBooking(reader, ref index);
                list.Add(roomBooking);
            });

            return list;
        }

        public List<RoomBooking>? GetRoomBookingsByDateRange(DateOnly startDate, DateOnly endDate, int hotelId)
        {
            string proc = "room_bookings_select_by_date_range";
            List<RoomBooking>? list = null;

            _mySqlDataProvider.ExecuteCmd(proc, (param) =>
            {
                param.AddWithValue("p_startDate", startDate.ToString("yyyy-MM-dd"));
                param.AddWithValue("p_endDate", endDate.ToString("yyyy-MM-dd"));
                param.AddWithValue("p_hotelId", hotelId);
            }, (reader, set) =>
            {
                int index = 0;
                list ??= new List<RoomBooking>();
                RoomBooking roomBooking = MapRoomBooking(reader, ref index);
                list.Add(roomBooking);
            });

            return list;
        }

        public List<Lookup>? GetBookingProviders(int hotelId)
        {
            string proc = "booking_providers_select_by_hotel_id";
            List<Lookup>? providers = null;

            _mySqlDataProvider.ExecuteCmd(proc, (param) =>
            {
                param.AddWithValue("p_hotelId", hotelId);
            }, (reader, set) =>
            {
                int index = 0;
                Lookup provider = new();
                provider.Id = reader.GetSafeInt32(index++);
                provider.Name = reader.GetSafeString(index++);

                providers ??= new List<Lookup>();

                providers.Add(provider);
            });

            return providers;
        }

        public bool IsValidSortDirection(string? direction)
        {
            return string.Equals(direction, "ASC", StringComparison.OrdinalIgnoreCase)
                || string.Equals(direction, "DESC", StringComparison.OrdinalIgnoreCase);
        }

        private static RoomBooking MapRoomBooking(IDataReader reader, ref int index)
        {
            RoomBooking roomBooking = new RoomBooking();
            roomBooking.Date = DateOnly.FromDateTime(reader.GetSafeDateTime(index++));
            roomBooking.Room = new Room();
            roomBooking.Room.Id = reader.GetSafeInt32(index++);
            roomBooking.Room.Name = reader.GetSafeString(index++);
            roomBooking.BookingId = reader.GetSafeInt32(index++);
            roomBooking.Price = reader.GetSafeDecimal(index++);
            return roomBooking;
        }

        private static Booking MapBooking(IDataReader reader, ref int index)
        {
            Booking booking = new Booking();
            booking.Id = reader.GetSafeInt32(index++);
            booking.ExternalId = reader.GetSafeString(index++);
            booking.BookingProvider = new Lookup();
            booking.BookingProvider.Id = reader.GetSafeInt32(index++);
            booking.BookingProvider.Name = reader.GetSafeString(index++);
            booking.ArrivalDate = DateOnly.FromDateTime(reader.GetSafeDateTime(index++));
            booking.DepartureDate = DateOnly.FromDateTime(reader.GetSafeDateTime(index++));
            booking.ETA = reader.GetSafeDateTimeNullable(index++);
            booking.AdultGuests = reader.GetSafeInt32(index++);
            booking.ChildGuests = reader.GetSafeInt32(index++);
            booking.Status = new Lookup();
            booking.Status.Id = reader.GetSafeInt32(index++);
            booking.Status.Name = reader.GetSafeString(index++);
            booking.Notes = reader.GetSafeString(index++);
            booking.ExternalCommission = reader.GetSafeDecimal(index++);
            booking.Nights = reader.GetSafeInt32(index++);
            booking.ModifiedBy = new UserBase();
            booking.ModifiedBy.Id = reader.GetSafeInt32(index++);
            booking.ModifiedBy.FirstName = reader.GetSafeString(index++);
            booking.ModifiedBy.LastName = reader.GetSafeString(index++);
            booking.DateCreated = reader.GetSafeDateTime(index++);
            booking.DateModified = reader.GetSafeDateTime(index++);
            booking.Total = reader.GetSafeDecimal(index++);
            booking.Subtotal = reader.GetSafeDecimal(index++);
            booking.Charges = reader.GetSafeDecimal(index++);
            booking.InvoiceId = reader.GetSafeInt32(index++);

            return booking;
        }
    }
}
