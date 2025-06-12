using MySql.Data.MySqlClient;
using System.Data;
using TourGo.Data;
using TourGo.Data.Providers;
using TourGo.Models.Domain;
using TourGo.Models.Domain.Hotels;
using TourGo.Models.Requests.Hotels;
using TourGo.Services.Interfaces.Hotels;

namespace TourGo.Services.Hotels
{
    public class BookingProviderService : IBookingProviderService
    {
        private readonly IMySqlDataProvider _dataProvider;

        public BookingProviderService(IMySqlDataProvider dataProvider)
        {
            _dataProvider = dataProvider;
        }

        public List<BookingProvider>? Get(string hotelId)
        {
            string proc = "booking_providers_select_all_by_hotel_id_v3";
            List<BookingProvider>? bookingProviders = null;

            _dataProvider.ExecuteCmd(proc, (param) =>
            {
                param.AddWithValue("p_hotelId", hotelId);
            }, (reader, set) =>
            {
                int index = 0;
                BookingProvider bookingProvider = MapBookingProvider(reader, ref index);

                bookingProviders ??= new List<BookingProvider>();

                bookingProviders.Add(bookingProvider);
            });

            return bookingProviders;
        }

        public List<Lookup>? GetMinimal(string hotelId)
        {
            string proc = "booking_providers_select_minimal_by_hotel_id_v2";
            List<Lookup>? bookingProviders = null;
            _dataProvider.ExecuteCmd(proc, (param) =>
            {
                param.AddWithValue("p_hotelId", hotelId);
            }, (reader, set) =>
            {
                int index = 0;
                Lookup paymentMethod = new();
                paymentMethod.Id = reader.GetSafeInt32(index++);
                paymentMethod.Name = reader.GetSafeString(index++);

                bookingProviders ??= new List<Lookup>();

                bookingProviders.Add(paymentMethod);
            });

            return bookingProviders;
        }

        public int Add(BookingProviderAddRequest model, string userId, string hotelId)
        {
            string proc = "booking_providers_insert_v3";
            int newId = 0;

            _dataProvider.ExecuteNonQuery(proc, (param) =>
            {
                param.AddWithValue("p_name", model.Name);
                param.AddWithValue("p_hotelId", hotelId);
                param.AddWithValue("p_modifiedBy", userId);

                MySqlParameter idOut = new MySqlParameter("p_newId", MySqlDbType.Int32);
                idOut.Direction = ParameterDirection.Output;
                param.Add(idOut);
            }, (returnColl) =>
            {
                object newIdObj = returnColl["p_newId"].Value;

                newId = int.TryParse(newIdObj.ToString(), out newId) ? newId : 0;
            });

            return newId;
        }

        public void Update(BookingProviderUpdateRequest model, string userId)
        {
            string proc = "booking_providers_update_v2";

            _dataProvider.ExecuteNonQuery(proc, (param) =>
            {
                param.AddWithValue("p_name", model.Name);
                param.AddWithValue("p_bookingProviderId", model.Id);
                param.AddWithValue("p_modifiedBy", userId);
            });
        }

        public void Delete(int id, string userId)
        {
            string proc = "booking_providers_delete_v2";

            _dataProvider.ExecuteNonQuery(proc, (param) =>
            {
                param.AddWithValue("p_modifiedBy", userId);
                param.AddWithValue("p_bookingProviderId", id);
            });
        }

        private BookingProvider MapBookingProvider(IDataReader reader, ref int index)
        {
            BookingProvider bookingProvider = new();
            bookingProvider.Id = reader.GetSafeInt32(index++);
            bookingProvider.Name = reader.GetSafeString(index++);
            bookingProvider.IsActive = reader.GetSafeBool(index++);
            bookingProvider.MapFromReader(reader, ref index);

            return bookingProvider;
        }
    }
}
