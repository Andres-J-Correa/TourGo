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
using TourGo.Models.Domain.Invoices;
using TourGo.Models.Requests.Bookings;
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

        public Paged<BookingBase>? GetBookingsByArrivalDate(DateOnly startDate, DateOnly endDate, int pageIndex, int pageSize, int userId, int hotelId)
        {
            Paged<BookingBase>? pagedBookings = null;
            List<BookingBase>? bookings = null;
            int totalCount = 0;

            string proc = "bookings_select_byArrivalDate";
            _mySqlDataProvider.ExecuteCmd(proc, (coll) =>
            {
                coll.AddWithValue("p_startDate", startDate.ToString("yyyy-MM-dd"));
                coll.AddWithValue("p_endDate", endDate.ToString("yyyy-MM-dd"));
                coll.AddWithValue("p_pageIndex", pageIndex);
                coll.AddWithValue("p_pageSize", pageSize);
                coll.AddWithValue("p_userId", userId);
                coll.AddWithValue("p_hotelId", hotelId);
            }, (reader, set) =>
            {
                int index = 0;

                BookingBase booking = MapBookingBase(reader, ref index);
                bookings ??= new List<BookingBase>();
                bookings.Add(booking);

                if (totalCount == 0)
                    totalCount = reader.GetSafeInt32(index++);
            });

            if (bookings != null)
                pagedBookings = new Paged<BookingBase>(bookings, pageIndex, pageSize, totalCount);

            return pagedBookings;
        }

        public Paged<BookingBase>? GetBookingsByDepartureDate(DateOnly startDate, DateOnly endDate, int pageIndex, int pageSize, int userId, int hotelId)
        {
            Paged<BookingBase>? pagedBookings = null;
            List<BookingBase>? bookings = null;
            int totalCount = 0;

            string proc = "bookings_select_byDepartureDate";
            _mySqlDataProvider.ExecuteCmd(proc, (coll) =>
            {
                coll.AddWithValue("p_startDate", startDate.ToString("yyyy-MM-dd"));
                coll.AddWithValue("p_endDate", endDate.ToString("yyyy-MM-dd"));
                coll.AddWithValue("p_pageIndex", pageIndex);
                coll.AddWithValue("p_pageSize", pageSize);
                coll.AddWithValue("p_userId", userId);
                coll.AddWithValue("p_hotelId", hotelId);
            }, (reader, set) =>
            {
                int index = 0;

                BookingBase booking = MapBookingBase(reader, ref index);
                bookings ??= new List<BookingBase>();
                bookings.Add(booking);

                if (totalCount == 0)
                    totalCount = reader.GetSafeInt32(index++);
            });

            if (bookings != null)
                pagedBookings = new Paged<BookingBase>(bookings, pageIndex, pageSize, totalCount);

            return pagedBookings;
        }

        public int Add(BookingAddEditRequest model, int userId, int hotelId)
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
        private static BookingBase MapBookingBase(IDataReader reader, ref int index)
        {
            BookingBase booking = new BookingBase();
            booking.Id = reader.GetSafeInt32(index++);
            booking.Customer = new Customer();
            booking.Customer.Id = reader.GetSafeInt32(index++);
            booking.Customer.FirstName = reader.GetSafeString(index++);
            booking.Customer.LastName = reader.GetSafeString(index++);
            booking.ExternalId = reader.GetSafeString(index++);
            booking.ArrivalDate = DateOnly.FromDateTime(reader.GetSafeDateTime(index++));
            booking.DepartureDate = DateOnly.FromDateTime(reader.GetSafeDateTime(index++));
            booking.ETA = reader.GetSafeUtcDateTime(index++);
            booking.AdultGuests = reader.GetSafeInt32(index++);
            booking.ChildGuests = reader.GetSafeInt32(index++);
            booking.Status = new Lookup();
            booking.Status.Id = reader.GetSafeInt32(index++);
            booking.Status.Name = reader.GetSafeString(index++);
            booking.Notes = reader.GetSafeString(index++);
            booking.DateCreated = reader.GetSafeDateTime(index++);
            booking.DateModified = reader.GetSafeDateTime(index++);
            booking.Invoices = new List<Invoice>();
            Invoice activeInvoice = new Invoice();
            activeInvoice.Subtotal = reader.GetSafeDecimal(index++);
            activeInvoice.Charges = reader.GetSafeDecimal(index++);
            activeInvoice.Paid = reader.GetSafeDecimal(index++);
            booking.Invoices.Add(activeInvoice);

            return booking;
        }
    }
}
