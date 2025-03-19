using MySql.Data.MySqlClient;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TourGo.Data;
using TourGo.Data.Providers;
using TourGo.Models.Domain;
using TourGo.Models.Domain.Hotels;
using TourGo.Models.Domain.Users;
using TourGo.Models.Requests.Hotels;
using TourGo.Services.Interfaces.Hotels;

namespace TourGo.Services.Hotels
{
    public class HotelService : IHotelService
    {
        private readonly IMySqlDataProvider _mySqlDataProvider;

        public HotelService(IWebAuthenticationService<int> authService, IMySqlDataProvider dataProvider)
        {
            _mySqlDataProvider = dataProvider;
        }
        public int Create(HotelAddRequest model, int userId)
        {
            int newId = 0;

            string proc = "hotels_insert";

            _mySqlDataProvider.ExecuteNonQuery(proc, (param) =>
            {
                param.AddWithValue("p_name", model.Name);
                param.AddWithValue("p_phone", model.Phone);
                param.AddWithValue("p_address", model.Address);
                param.AddWithValue("p_email", model.Email);
                param.AddWithValue("p_taxId", model.TaxId);
                param.AddWithValue("p_modifiedBy", userId);

                MySqlParameter newIdOut = new MySqlParameter("p_newId", MySqlDbType.Int32);
                newIdOut.Direction = ParameterDirection.Output;
                param.Add(newIdOut);
            }, (returnColl) =>
            {
                object newIdObj = returnColl["p_newId"].Value;

                newId = int.TryParse(newIdObj.ToString(), out newId) ? newId : 0;
            });

            return newId;
        }

        public Hotel ? GetDetails(int id)
        {
            string proc = "hotels_select_details_by_id";
            Hotel ? hotel = null;

            _mySqlDataProvider.ExecuteCmd(proc, (param) =>
            {
                param.AddWithValue("p_hotelId", id);
            }, (reader, set) =>
            {
                int index = 0;

                if (set == 0)
                {
                    hotel = MapHotel(reader, ref index);
                }
                else if(set == 1 && hotel != null)
                {
                    UserBase user = new();
                    index = 0;
                    user.Id = reader.GetSafeInt32(index++);
                    user.FirstName = reader.GetSafeString(index++);
                    user.LastName = reader.GetSafeString(index++);
                    hotel.Owner = user;
                }
            });

            return hotel;
        }

        public Lookup? GetMinimal(int id)
        {
            string proc = "hotels_select_minimal_by_id";

            Lookup? lookup = null;

            _mySqlDataProvider.ExecuteCmd(proc, (param) =>
            {
                param.AddWithValue("p_hotelId", id);
            }, (reader, set) =>
            {
                int index = 0;

                lookup = new Lookup();
                lookup.Id = reader.GetSafeInt32(index++);
                lookup.Name = reader.GetSafeString(index++);
            });

            return lookup;
        }

        public List<Lookup>? GetUserHotelsMinimal(int userId)
        {
            string proc = "hotels_select_minimal_by_user";
            List<Lookup>? hotels = null;

            _mySqlDataProvider.ExecuteCmd(proc, (param) =>
            {
                param.AddWithValue("p_userId", userId);
            }, (reader, set) =>
            {
                int index = 0;
                Lookup hotel = new();
                hotel.Id = reader.GetSafeInt32(index++);
                hotel.Name = reader.GetSafeString(index++);

                hotels ??= new List<Lookup>();

                hotels.Add(hotel);
            });

            return hotels;
        }

        private static Hotel MapHotel(IDataReader reader, ref int index)
        {
            Hotel hotel = new();
            hotel.Id = reader.GetSafeInt32(index++);
            hotel.Name = reader.GetSafeString(index++);
            hotel.Phone = reader.GetSafeString(index++);
            hotel.Address = reader.GetSafeString(index++);
            hotel.Email = reader.GetSafeString(index++);
            hotel.TaxId = reader.GetSafeString(index++);
            return hotel;
        }
    }
}
