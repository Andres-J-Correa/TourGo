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
using TourGo.Models.Domain.Hotels;
using TourGo.Models.Domain.Invoices;
using TourGo.Models.Domain.Users;
using TourGo.Models.Requests.Bookings;
using TourGo.Services.Customers;
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
                    booking = MapBookingBase(reader, ref index);
                }

                if (set == 1 && booking != null)
                {
                    index = 0;
                    booking.Customer = CustomerService.MapCustomer(reader, ref index);
                }  
            });

            return booking;
        }

        public int Add(BookingAddUpdateRequest model, int userId, int hotelId)
        {
            int newId = 0;

            string proc = "bookings_insert";
            _mySqlDataProvider.ExecuteNonQuery(proc, (coll) =>
            {
                coll.AddWithValue("p_customerId", model.CustomerId);
                coll.AddWithValue("p_externalBookingId", model.ExternalId);
                coll.AddWithValue("p_bookingProviderId", model.BookingProviderId);
                coll.AddWithValue("p_arrivalDate", model.ArrivalDate.ToString("yyyy-MM-dd"));
                coll.AddWithValue("p_departureDate", model.DepartureDate.ToString("yyyy-MM-dd"));
                coll.AddWithValue("p_eta", model.ETA.ToString("yyyy-MM-ddTHH:mm:ss"));
                coll.AddWithValue("p_adultGuests", model.AdultGuests);
                coll.AddWithValue("p_childGuests", model.ChildGuests);
                coll.AddWithValue("p_notes", model.Notes);
                coll.AddWithValue("p_modifiedBy", userId);
                coll.AddWithValue("p_hotelId", hotelId);
                coll.AddWithValue("p_externalComission", model.ExternalComission);
                coll.AddWithValue("p_roomBookingsJson", JsonConvert.SerializeObject(model.RoomBookings));
                coll.AddWithValue("p_extraChargesJson", JsonConvert.SerializeObject(model.ExtraCharges));

                MySqlParameter newIdOut = new MySqlParameter("p_newId", MySqlDbType.Int32);
                newIdOut.Direction = ParameterDirection.Output;
                coll.Add(newIdOut);
            }, (returnColl) =>
            {
                object resultObj = returnColl["p_newId"].Value;
                newId = Convert.ToInt32(resultObj);
            });

            return newId;
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

        private static Booking MapBookingBase(IDataReader reader, ref int index)
        {
            Booking booking = new Booking();
            booking.Id = reader.GetSafeInt32(index++);
            booking.ExternalId = reader.GetSafeString(index++);
            booking.BookingProvider = new Lookup();
            booking.BookingProvider.Id = reader.GetSafeInt32(index++);
            booking.BookingProvider.Name = reader.GetSafeString(index++);
            booking.ArrivalDate = DateOnly.FromDateTime(reader.GetSafeDateTime(index++));
            booking.DepartureDate = DateOnly.FromDateTime(reader.GetSafeDateTime(index++));
            booking.ETA = reader.GetSafeUtcDateTime(index++);
            booking.AdultGuests = reader.GetSafeInt32(index++);
            booking.ChildGuests = reader.GetSafeInt32(index++);
            booking.Status = new Lookup();
            booking.Status.Id = reader.GetSafeInt32(index++);
            booking.Status.Name = reader.GetSafeString(index++);
            booking.Notes = reader.GetSafeString(index++);
            booking.ExternalComission = reader.GetSafeDecimal(index++);
            booking.Nights = reader.GetSafeInt32(index++);
            booking.ModifiedBy = new UserBase();
            booking.ModifiedBy.Id = reader.GetSafeInt32(index++);
            booking.ModifiedBy.FirstName = reader.GetSafeString(index++);
            booking.ModifiedBy.LastName = reader.GetSafeString(index++);
            booking.DateCreated = reader.GetSafeDateTime(index++);
            booking.DateModified = reader.GetSafeDateTime(index++);

            return booking;
        }
    }
}
