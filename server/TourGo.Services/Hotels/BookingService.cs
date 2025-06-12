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
using TourGo.Models.Enums.Bookings;
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

        public BookingService(IMySqlDataProvider dataProvider)
        {
            _mySqlDataProvider = dataProvider;
        }

        public Booking? GetById(int id)
        {
            string proc = "bookings_select_details_by_id_v6";
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
                    booking.MapFromReader(reader, ref index);
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

                if (set == 3 && booking != null)
                {
                    index = 0;
                    RoomBooking roomBooking = MapRoomBooking(reader, ref index);
                    booking.RoomBookings ??= new List<RoomBooking>();
                    booking.RoomBookings.Add(roomBooking);
                }

                if (set == 4 && booking != null)
                {
                    index = 0;
                    ExtraCharge extraCharge = ExtraChargeService.MapExtraCharge(reader, ref index);
                    booking.ExtraCharges ??= new List<ExtraCharge>();
                    booking.ExtraCharges.Add(extraCharge);
                }

                if (set == 5 && booking != null)
                {
                    index = 0;
                    ExtraCharge personalizedCharge = new ExtraCharge()
                    {
                        Id = reader.GetSafeInt32(index++),
                        Name = reader.GetSafeString(index++),
                        Amount = reader.GetSafeDecimal(index++),
                    };
                    booking.PersonalizedCharges ??= new List<ExtraCharge>();
                    booking.PersonalizedCharges.Add(personalizedCharge);
                }
            });

            return booking;
        }

        public Paged<BookingMinimal>? GetPaginatedByDateRange(string hotelId, int pageIndex, int pageSize, bool? isArrivalDate,
                                                            string? sortColumn, string? sortDirection, DateOnly? startDate, DateOnly? endDate,
                                                            string? firstName, string? lastName, string? bookingExternalId, int? statusId)
        {
            string proc = "bookings_select_minimal_by_date_range_paginated_v4";
            Paged<BookingMinimal>? paged = null;
            List<BookingMinimal>? bookings = null;
            int totalCount = 0;

            string mappedColumn = !string.IsNullOrEmpty(sortColumn) && BookingSortColumns.TryGetValue(sortColumn, out var value) ? value : string.Empty;

            _mySqlDataProvider.ExecuteCmd(proc, (param) =>
            {
                param.AddWithValue("p_hotelId", hotelId);
                param.AddWithValue("p_pageIndex", pageIndex);
                param.AddWithValue("p_pageSize", pageSize);

                param.AddWithValue("p_sortColumn", string.IsNullOrEmpty(mappedColumn) ? DBNull.Value : mappedColumn);
                param.AddWithValue("p_sortDirection", string.IsNullOrEmpty(sortDirection) ? DBNull.Value : sortDirection);
                param.AddWithValue("p_startDate", startDate?.ToString("yyyy-MM-dd") ?? (object)DBNull.Value);
                param.AddWithValue("p_endDate", endDate?.ToString("yyyy-MM-dd") ?? (object)DBNull.Value);
                param.AddWithValue("p_isArrivalDate", isArrivalDate.HasValue ? (isArrivalDate.Value ? 1 : 0) : DBNull.Value);
                param.AddWithValue("p_firstName", string.IsNullOrWhiteSpace(firstName) ? DBNull.Value : firstName);
                param.AddWithValue("p_lastName", string.IsNullOrWhiteSpace(lastName) ? DBNull.Value : lastName);
                param.AddWithValue("p_externalBookingId", string.IsNullOrWhiteSpace(bookingExternalId) ? DBNull.Value : bookingExternalId);
                param.AddWithValue("p_statusId", statusId.HasValue ? statusId.Value : DBNull.Value);
            }, (reader, set) =>
            {
                int index = 0;
                BookingMinimal booking = MapBookingMinimal(reader, ref index);
                booking.MapFromReader(reader, ref index);

                if (totalCount == 0)
                {
                    totalCount = reader.GetSafeInt32(index++);
                }

                bookings ??= new List<BookingMinimal>();
                bookings.Add(booking);
            });

            if (bookings != null)
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

        public BookingMinimal? GetBookingMinimal(int bookingId)
        {
            string proc = "bookings_select_minimal_by_id_v2";
            BookingMinimal? booking = null;

            _mySqlDataProvider.ExecuteCmd(proc, (param) =>
            {
                param.AddWithValue("p_id", bookingId);
            }, (reader, set) =>
            {
                int index = 0;
                booking = MapBookingMinimal(reader, ref index);
            });

            return booking;
        }

        public BookingAddResponse? Add(BookingAddRequest model, string userId, string hotelId)
        {
            BookingAddResponse? response = null;

            string proc = "bookings_insert_v4";
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
                coll.AddWithValue("p_externalComission", model.ExternalCommission > 0 ? model.ExternalCommission : 0);
                coll.AddWithValue("p_roomBookingsJson", JsonConvert.SerializeObject(model.RoomBookings));
                coll.AddWithValue("p_extraChargesJson", model.ExtraCharges?.Count > 0 ? JsonConvert.SerializeObject(model.ExtraCharges) : DBNull.Value);
                coll.AddWithValue("p_personalizedChargesJson", model.PersonalizedCharges?.Count > 0 ? JsonConvert.SerializeObject(model.PersonalizedCharges) : DBNull.Value);
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

        public void Update(BookingsUpdateRequest model, string userId)
        {
            string proc = "bookings_update_v3";
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
                coll.AddWithValue("p_personalizedChargesJson", model.PersonalizedCharges?.Count > 0 ? JsonConvert.SerializeObject(model.PersonalizedCharges) : DBNull.Value);
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

        public List<RoomBooking>? GetRoomBookingsByDateRange(DateOnly startDate, DateOnly endDate, string hotelId)
        {
            string proc = "room_bookings_select_by_date_range_v2";
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

        public void UpdateStatus(int bookingId, string userId, BookingStatusEnum status)
        {
            string proc = "bookings_update_status_v2";
            _mySqlDataProvider.ExecuteNonQuery(proc, (param) =>
            {
                param.AddWithValue("p_bookingId", bookingId);
                param.AddWithValue("p_modifiedBy", userId);
                param.AddWithValue("p_statusId", (int)status);
            });
        }

        public List<BookingArrival>? GetArrivalsByDate(DateOnly arrivalDate, string hotelId)
        {
            string proc = "bookings_select_by_arrival_date_v2";
            List<BookingArrival>? bookings = null;

            _mySqlDataProvider.ExecuteCmd(proc, (param) =>
            {
                param.AddWithValue("p_date", arrivalDate.ToString("yyyy-MM-dd"));
                param.AddWithValue("p_hotelId", hotelId);
            }, (reader, set) =>
            {
                int index = 0;
                BookingArrival booking = MapBookingArrival(reader, ref index);

                bookings ??= new List<BookingArrival>();
                bookings.Add(booking);
            });

            return bookings;
        }

        public List<BookingDeparture>? GetDeparturesByDate(DateOnly departureDate, string hotelId)
        {
            string proc = "bookings_select_by_departure_date_v2";
            List<BookingDeparture>? bookings = null;
            _mySqlDataProvider.ExecuteCmd(proc, (param) =>
            {
                param.AddWithValue("p_date", departureDate.ToString("yyyy-MM-dd"));
                param.AddWithValue("p_hotelId", hotelId);
            }, (reader, set) =>
            {
                int index = 0;
                BookingDeparture booking = MapBookingDeparture(reader, ref index);

                bookings ??= new List<BookingDeparture>();
                bookings.Add(booking);
            });

            return bookings;
        }

        public List<RoomBooking>? GetDepartingRoomBookings(DateOnly departureDate, string hotelId)
        {
            string proc = "room_bookings_select_departing_by_date_v2";
            List<RoomBooking>? list = null;

            _mySqlDataProvider.ExecuteCmd(proc, (param) =>
            {
                param.AddWithValue("p_departureDate", departureDate.ToString("yyyy-MM-dd"));
                param.AddWithValue("p_hotelId", hotelId);
            }, (reader, set) =>
            {
                int index = 0;
                RoomBooking roomBooking = new RoomBooking();
                roomBooking.Room.Id = reader.GetSafeInt32(index++);
                roomBooking.Room.Name = reader.GetSafeString(index++);
                roomBooking.FirstName = reader.GetSafeString(index++);
                roomBooking.LastName = reader.GetSafeString(index++);
                roomBooking.BookingId = reader.GetSafeInt32(index++);

                list ??= new List<RoomBooking>();
                list.Add(roomBooking);
            });
            return list;
        }

        public List<RoomBooking>? GetArrivingRoomBookings(DateOnly arrivalDate, string hotelId)
        {
            string proc = "room_bookings_select_arriving_by_date_v2";
            List<RoomBooking>? list = null;

            _mySqlDataProvider.ExecuteCmd(proc, (param) =>
            {
                param.AddWithValue("p_arrivalDate", arrivalDate.ToString("yyyy-MM-dd"));
                param.AddWithValue("p_hotelId", hotelId);
            }, (reader, set) =>
            {
                int index = 0;
                RoomBooking roomBooking = new RoomBooking();
                roomBooking.Room.Id = reader.GetSafeInt32(index++);
                roomBooking.Room.Name = reader.GetSafeString(index++);
                roomBooking.FirstName = reader.GetSafeString(index++);
                roomBooking.LastName = reader.GetSafeString(index++);
                roomBooking.BookingId = reader.GetSafeInt32(index++);

                list ??= new List<RoomBooking>();
                list.Add(roomBooking);
            });

            return list;
        }

        public List<BookingStay>? GetStaysByDate(DateOnly date, string hotelId)
        {
            string proc = "bookings_select_by_stay_date_v2";
            List<BookingStay>? stays = null;

            _mySqlDataProvider.ExecuteCmd(proc, (param) =>
            {
                param.AddWithValue("p_hotelId", hotelId);
                param.AddWithValue("p_date", date.ToString("yyyy-MM-dd"));
            }, (reader, set) =>
            {
                int index = 0;
                BookingStay stay = MapBookingStay(reader, ref index);
                stays ??= new List<BookingStay>();
                stays.Add(stay);
            });

            return stays;
        }

        public bool IsValidSortDirection(string? direction)
        {
            return string.Equals(direction, "ASC", StringComparison.OrdinalIgnoreCase)
                || string.Equals(direction, "DESC", StringComparison.OrdinalIgnoreCase);
        }

        public bool IsValidSortColumn(string? column)
        {
            return !string.IsNullOrWhiteSpace(column) && BookingSortColumns.ContainsKey(column);
        }

        private readonly Dictionary<string, string> BookingSortColumns = new(StringComparer.OrdinalIgnoreCase)
            {
                {"Id", "b.Id"},
                {"ArrivalDate", "b.ArrivalDate"},
                {"DepartureDate", "b.DepartureDate"},
                {"Total", "b.Total"},
                {"BalanceDue", "i.BalanceDue"},
                {"FirstName", "c.FirstName"},
                {"LastName", "c.LastName"},
                {"ExternalBookingId", "b.ExternalBookingId"},
                {"StatusId", "b.StatusId" }
            };

        private static RoomBooking MapRoomBooking(IDataReader reader, ref int index)
        {
            RoomBooking roomBooking = new RoomBooking();
            roomBooking.Date = DateOnly.FromDateTime(reader.GetSafeDateTime(index++));
            roomBooking.Room.Id = reader.GetSafeInt32(index++);
            roomBooking.Room.Name = reader.GetSafeString(index++);
            roomBooking.BookingId = reader.GetSafeInt32(index++);
            roomBooking.Price = reader.GetSafeDecimal(index++);
            roomBooking.FirstName = reader.GetSafeString(index++);
            roomBooking.LastName = reader.GetSafeString(index++);
            return roomBooking;
        }

        public static Booking MapBooking(IDataReader reader, ref int index)
        {
            Booking booking = new Booking();
            booking.Id = reader.GetSafeInt32(index++);
            booking.ExternalId = reader.GetSafeString(index++);

            int bookingProviderId = reader.GetSafeInt32(index++);
            if (bookingProviderId > 0)
            {
                booking.BookingProvider = new Lookup();
                booking.BookingProvider.Id = bookingProviderId;
                booking.BookingProvider.Name = reader.GetSafeString(index++);
            }
            else
            {
                index++;
            }

            booking.ArrivalDate = DateOnly.FromDateTime(reader.GetSafeDateTime(index++));
            booking.DepartureDate = DateOnly.FromDateTime(reader.GetSafeDateTime(index++));
            booking.ETA = reader.GetSafeDateTimeNullable(index++);
            booking.AdultGuests = reader.GetSafeInt32(index++);
            booking.ChildGuests = reader.GetSafeInt32(index++);
            booking.Status.Id = reader.GetSafeInt32(index++);
            booking.Status.Name = reader.GetSafeString(index++);
            booking.Notes = reader.GetSafeString(index++);
            booking.ExternalCommission = reader.GetSafeDecimal(index++);
            booking.Nights = reader.GetSafeInt32(index++);
            booking.Total = reader.GetSafeDecimal(index++);
            booking.Subtotal = reader.GetSafeDecimal(index++);
            booking.Charges = reader.GetSafeDecimal(index++);
            booking.InvoiceId = reader.GetSafeInt32(index++);

            return booking;
        }

        private static BookingMinimal MapBookingMinimal(IDataReader reader, ref int index)
        {
            BookingMinimal booking = new BookingMinimal();
            booking.Id = reader.GetSafeInt32(index++);
            booking.ExternalBookingId = reader.GetSafeString(index++);
            booking.ArrivalDate = DateOnly.FromDateTime(reader.GetSafeDateTime(index++));
            booking.DepartureDate = DateOnly.FromDateTime(reader.GetSafeDateTime(index++));
            booking.Total = reader.GetSafeDecimal(index++);
            booking.BalanceDue = reader.GetSafeDecimal(index++);
            booking.FirstName = reader.GetSafeString(index++);
            booking.LastName = reader.GetSafeString(index++);
            booking.StatusId = reader.GetSafeInt32(index++);
            return booking;
        }

        private static BookingDeparture MapBookingDeparture(IDataReader reader, ref int index)
        {
            BookingDeparture booking = new BookingDeparture();
            booking.Id = reader.GetSafeInt32(index++);
            booking.ExternalBookingId = reader.GetSafeString(index++);
            booking.BookingProviderName = reader.GetSafeString(index++);
            booking.StatusId = reader.GetSafeInt32(index++);
            booking.Notes = reader.GetSafeString(index++);
            booking.Nights = reader.GetSafeInt32(index++);
            booking.DepartingRooms = reader.DeserializeObjectSafely<List<Lookup>>(index++, () => null);
            booking.Customer.Id = reader.GetSafeInt32(index++);
            booking.Customer.FirstName = reader.GetSafeString(index++);
            booking.Customer.LastName = reader.GetSafeString(index++);
            booking.Customer.Phone = reader.GetSafeString(index++);
            booking.Customer.DocumentNumber = reader.GetSafeString(index++);
            return booking;
        }

        private static BookingArrival MapBookingArrival(IDataReader reader, ref int index)
        {
            BookingArrival booking = new BookingArrival();
            booking.Id = reader.GetSafeInt32(index++);
            booking.ExternalBookingId = reader.GetSafeString(index++);
            booking.BookingProviderName = reader.GetSafeString(index++);
            booking.ETA = reader.GetSafeDateTimeNullable(index++);
            booking.StatusId = reader.GetSafeInt32(index++);
            booking.Notes = reader.GetSafeString(index++);
            booking.Nights = reader.GetSafeInt32(index++);
            booking.Total = reader.GetSafeDecimal(index++);
            booking.BalanceDue = reader.GetSafeDecimal(index++);
            booking.ArrivingRooms = reader.DeserializeObjectSafely<List<Lookup>>(index++, () => null);
            booking.OtherRooms = reader.DeserializeObjectSafely<List<Lookup>>(index++, () => null);
            booking.Customer.Id = reader.GetSafeInt32(index++);
            booking.Customer.FirstName = reader.GetSafeString(index++);
            booking.Customer.LastName = reader.GetSafeString(index++);
            booking.Customer.Phone = reader.GetSafeString(index++);
            booking.Customer.DocumentNumber = reader.GetSafeString(index++);
            return booking;
        }

        private static BookingStay MapBookingStay(IDataReader reader, ref int index)
        {
            BookingStay stay = new BookingStay();
            stay.Id = reader.GetSafeInt32(index++);
            stay.ExternalBookingId = reader.GetSafeString(index++);
            stay.BookingProviderName = reader.GetSafeString(index++);
            stay.StatusId = reader.GetSafeInt32(index++);
            stay.Notes = reader.GetSafeString(index++);
            stay.Nights = reader.GetSafeInt32(index++);
            stay.ArrivalDate = DateOnly.FromDateTime(reader.GetSafeDateTime(index++));
            stay.DepartureDate = DateOnly.FromDateTime(reader.GetSafeDateTime(index++));
            stay.Rooms = reader.DeserializeObjectSafely<List<Lookup>>(index++, () => null);

            stay.Customer = new Customer();
            stay.Customer.Id = reader.GetSafeInt32(index++);
            stay.Customer.FirstName = reader.GetSafeString(index++);
            stay.Customer.LastName = reader.GetSafeString(index++);
            stay.Customer.Phone = reader.GetSafeString(index++);
            stay.Customer.DocumentNumber = reader.GetSafeString(index++);

            return stay;
        }
    }
}
