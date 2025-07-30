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

        public Booking? GetById(string id, string hotelId)
        {
            string proc = "bookings_select_details_by_id_v10";
            Booking? booking = null;

            _mySqlDataProvider.ExecuteCmd(proc, (param) =>
            {
                param.AddWithValue("p_bookingId", id);
                param.AddWithValue("p_hotelId", hotelId);
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
                                                            string? firstName, string? lastName, string? bookingExternalId, int? statusId,
                                                            string? bookingId)
        {
            string proc = "bookings_select_minimal_by_date_range_paginated_v6";
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
                param.AddWithValue("p_bookingId", string.IsNullOrWhiteSpace(bookingId) ? DBNull.Value : bookingId);
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

        public BookingMinimal? GetBookingMinimal(string bookingId, string hotelId)
        {
            string proc = "bookings_select_minimal_by_id_v3";
            BookingMinimal? booking = null;

            _mySqlDataProvider.ExecuteCmd(proc, (param) =>
            {
                param.AddWithValue("p_id", bookingId);
                param.AddWithValue("p_hotelId", hotelId);
            }, (reader, set) =>
            {
                int index = 0;
                booking = MapBookingMinimal(reader, ref index);
            });

            return booking;
        }

        public BookingAddResponse? Add(BookingAddRequest model, string userId, string hotelId, string publicId)
        {
            BookingAddResponse? response = null;

            string proc = "bookings_insert_v7";
            _mySqlDataProvider.ExecuteCmd(proc, (param) =>
            {
                param.AddWithValue("p_customerId", model.CustomerId);
                param.AddWithValue("p_externalBookingId", string.IsNullOrEmpty(model.ExternalId) ? (object)DBNull.Value : model.ExternalId);
                param.AddWithValue("p_bookingProviderId", model.BookingProviderId > 0 ? model.BookingProviderId: DBNull.Value);
                param.AddWithValue("p_arrivalDate", model.ArrivalDate.ToString("yyyy-MM-dd"));
                param.AddWithValue("p_departureDate", model.DepartureDate.ToString("yyyy-MM-dd"));
                param.AddWithValue("p_eta", model.ETA?.ToString("yyyy-MM-ddTHH:mm:ss") ?? (object)DBNull.Value);
                param.AddWithValue("p_adultGuests", model.AdultGuests);
                param.AddWithValue("p_childGuests", model.ChildGuests > 0 ? model.ChildGuests : DBNull.Value);
                param.AddWithValue("p_notes", model.Notes ?? (object)DBNull.Value);
                param.AddWithValue("p_modifiedBy", userId);
                param.AddWithValue("p_hotelId", hotelId);
                param.AddWithValue("p_externalComission", model.ExternalCommission > 0 ? model.ExternalCommission : 0);
                param.AddWithValue("p_roomBookingsJson", JsonConvert.SerializeObject(model.RoomBookings));
                param.AddWithValue("p_extraChargesJson", model.ExtraCharges?.Count > 0 ? JsonConvert.SerializeObject(model.ExtraCharges) : DBNull.Value);
                param.AddWithValue("p_personalizedChargesJson", model.PersonalizedCharges?.Count > 0 ? JsonConvert.SerializeObject(model.PersonalizedCharges) : DBNull.Value);
                param.AddWithValue("p_subtotal", model.Subtotal);
                param.AddWithValue("p_charges", model.Charges);
                param.AddWithValue("p_total", model.Total);
                param.AddWithValue("p_publicId", publicId);

            }, (reader, set) =>
            {             
                int index = 0;
                int newBookingId = reader.GetSafeInt32(index++);
                string newInvoiceId = reader.GetSafeString(index++);

                if (newBookingId <= 0)
                {
                    return;
                }

                response = new BookingAddResponse
                {
                    BookingId = publicId,
                    InvoiceId = newInvoiceId,
                };
            });

            return response;
        }

        public void Update(BookingsUpdateRequest model, string userId, string hotelId)
        {
            string proc = "bookings_update_v5";
            _mySqlDataProvider.ExecuteNonQuery(proc, (param) =>
            {
                param.AddWithValue("p_id", model.Id);
                param.AddWithValue("p_hotelId", hotelId);
                param.AddWithValue("p_externalBookingId", string.IsNullOrEmpty(model.ExternalId) ? (object)DBNull.Value : model.ExternalId);
                param.AddWithValue("p_bookingProviderId", model.BookingProviderId > 0 ? model.BookingProviderId : DBNull.Value);
                param.AddWithValue("p_arrivalDate", model.ArrivalDate.ToString("yyyy-MM-dd"));
                param.AddWithValue("p_departureDate", model.DepartureDate.ToString("yyyy-MM-dd"));
                param.AddWithValue("p_eta", model.ETA?.ToString("yyyy-MM-ddTHH:mm:ss") ?? (object)DBNull.Value);
                param.AddWithValue("p_adultGuests", model.AdultGuests);
                param.AddWithValue("p_childGuests", model.ChildGuests > 0 ? model.ChildGuests : DBNull.Value);
                param.AddWithValue("p_notes", model.Notes ?? (object)DBNull.Value);
                param.AddWithValue("p_modifiedBy", userId);
                param.AddWithValue("p_externalComission", model.ExternalCommission > 0 ? model.ExternalCommission : 0);
                param.AddWithValue("p_roomBookingsJson", JsonConvert.SerializeObject(model.RoomBookings));
                param.AddWithValue("p_extraChargesJson", model.ExtraCharges?.Count > 0 ? JsonConvert.SerializeObject(model.ExtraCharges) : DBNull.Value);
                param.AddWithValue("p_personalizedChargesJson", model.PersonalizedCharges?.Count > 0 ? JsonConvert.SerializeObject(model.PersonalizedCharges) : DBNull.Value);
                param.AddWithValue("p_subtotal", model.Subtotal);
                param.AddWithValue("p_charges", model.Charges);
                param.AddWithValue("p_total", model.Total);
            });
        }

        public List<RoomBooking>? GetRoomBookingsByDateRange(DateOnly startDate, DateOnly endDate, string hotelId)
        {
            string proc = "room_bookings_select_by_date_range_v3";
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

        public void UpdateStatus(string bookingId, string userId, BookingStatusEnum status, string hotelId)
        {
            string proc = "bookings_update_status_v3";
            _mySqlDataProvider.ExecuteNonQuery(proc, (param) =>
            {
                param.AddWithValue("p_bookingId", bookingId);
                param.AddWithValue("p_modifiedBy", userId);
                param.AddWithValue("p_statusId", (int)status);
                param.AddWithValue("p_hotelId", hotelId);
            });
        }

        public List<BookingArrival>? GetArrivalsByDate(DateOnly arrivalDate, string hotelId)
        {
            string proc = "bookings_select_by_arrival_date_v4";
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
            string proc = "bookings_select_by_departure_date_v4";
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
            string proc = "room_bookings_select_departing_by_date_v4";
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
                roomBooking.BookingId = reader.GetSafeString(index++);
                roomBooking.IsRoomChange = reader.GetSafeBool(index++);

                list ??= new List<RoomBooking>();
                list.Add(roomBooking);
            });
            return list;
        }

        public List<RoomBooking>? GetArrivingRoomBookings(DateOnly arrivalDate, string hotelId)
        {
            string proc = "room_bookings_select_arriving_by_date_v4";
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
                roomBooking.BookingId = reader.GetSafeString(index++);
                roomBooking.IsRoomChange = reader.GetSafeBool(index++);

                list ??= new List<RoomBooking>();
                list.Add(roomBooking);
            });

            return list;
        }

        public List<BookingStay>? GetStaysByDate(DateOnly date, string hotelId)
        {
            string proc = "bookings_select_by_stay_date_v4";
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

        public List<string>? GetAvailablePublicIds(List<string> possibleIds)
        {
            string proc = "bookings_select_available_public_ids";
            List<string>? availableIds = null;

            _mySqlDataProvider.ExecuteCmd(proc, (coll) =>
            {
                coll.AddWithValue("p_jsonData", JsonConvert.SerializeObject(possibleIds));
            }, (reader, set) =>
            {
                int index = 0;
                string availableId = reader.GetSafeString(index++);
                availableIds ??= new List<string>();
                availableIds.Add(availableId);
            });

            return availableIds;
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
            roomBooking.BookingId = reader.GetSafeString(index++);
            roomBooking.Price = reader.GetSafeDecimal(index++);
            roomBooking.FirstName = reader.GetSafeString(index++);
            roomBooking.LastName = reader.GetSafeString(index++);
            return roomBooking;
        }

        public static Booking MapBooking(IDataReader reader, ref int index)
        {
            Booking booking = new Booking();
            booking.Id = reader.GetSafeString(index++);
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
            booking.InvoiceId = reader.GetSafeString(index++);

            return booking;
        }

        private static BookingMinimal MapBookingMinimal(IDataReader reader, ref int index)
        {
            BookingMinimal booking = new BookingMinimal();
            booking.Id = reader.GetSafeString(index++);
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
            booking.Id = reader.GetSafeString(index++);
            booking.ExternalBookingId = reader.GetSafeString(index++);
            booking.BookingProviderName = reader.GetSafeString(index++);
            booking.StatusId = reader.GetSafeInt32(index++);
            booking.Notes = reader.GetSafeString(index++);
            booking.Nights = reader.GetSafeInt32(index++);
            booking.ArrivalDate = DateOnly.FromDateTime(reader.GetSafeDateTime(index++));
            booking.DepartureDate = DateOnly.FromDateTime(reader.GetSafeDateTime(index++));
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
            booking.Id = reader.GetSafeString(index++);
            booking.ExternalBookingId = reader.GetSafeString(index++);
            booking.BookingProviderName = reader.GetSafeString(index++);
            booking.ETA = reader.GetSafeDateTimeNullable(index++);
            booking.StatusId = reader.GetSafeInt32(index++);
            booking.Notes = reader.GetSafeString(index++);
            booking.Nights = reader.GetSafeInt32(index++);
            booking.ArrivalDate = DateOnly.FromDateTime(reader.GetSafeDateTime(index++));
            booking.DepartureDate = DateOnly.FromDateTime(reader.GetSafeDateTime(index++));
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
            stay.Id = reader.GetSafeString(index++);
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
