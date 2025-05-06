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
using TourGo.Models.Domain.Finances;
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

        public void Update(HotelUpdateRequest model, int userId)
        {

            string proc = "hotels_update";

            _mySqlDataProvider.ExecuteNonQuery(proc, (param) =>
            {
                param.AddWithValue("p_name", model.Name);
                param.AddWithValue("p_phone", model.Phone);
                param.AddWithValue("p_address", model.Address);
                param.AddWithValue("p_email", model.Email);
                param.AddWithValue("p_taxId", model.TaxId);
                param.AddWithValue("p_modifiedBy", userId);
                param.AddWithValue("p_hotelId", model.Id);
            });

        }

        public void Delete(int id, int userId)
        {
            string proc = "hotels_delete";

            _mySqlDataProvider.ExecuteNonQuery(proc, (param) =>
            {
                param.AddWithValue("p_modifiedBy", userId);
                param.AddWithValue("p_hotelId", id);
            });
        }

        public Hotel? GetDetails(int id)
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

        public List<Lookup>? GetPaymentMethods(int hotelId)
        {
            string proc = "payment_methods_select_by_hotel_id";
            List<Lookup>? paymentMethods = null;
            _mySqlDataProvider.ExecuteCmd(proc, (param) =>
            {
                param.AddWithValue("p_hotelId", hotelId);
            }, (reader, set) =>
            {
                int index = 0;
                Lookup paymentMethod = new();
                paymentMethod.Id = reader.GetSafeInt32(index++);
                paymentMethod.Name = reader.GetSafeString(index++);

                paymentMethods ??= new List<Lookup>();

                paymentMethods.Add(paymentMethod);
            });

            return paymentMethods;
        }

        public List<Lookup>? GetFinancePartners(int hotelId)
        {
            string proc = "finance_partners_select_by_hotel_id";
            List<Lookup>? financePartners = null;
            _mySqlDataProvider.ExecuteCmd(proc, (param) =>
            {
                param.AddWithValue("p_hotelId", hotelId);
            }, (reader, set) =>
            {
                int index = 0;
                Lookup financePartner = new();
                financePartner.Id = reader.GetSafeInt32(index++);
                financePartner.Name = reader.GetSafeString(index++);

                financePartners ??= new List<Lookup>();

                financePartners.Add(financePartner);
            });

            return financePartners;
        }

        public List<TransactionSubcategory>? GetTransactionSubcategories(int hotelId)
        {
            string proc = "transaction_subcategories_select_by_hotel_id";
            List<TransactionSubcategory>? transactionSubcategories = null;
            _mySqlDataProvider.ExecuteCmd(proc, (param) =>
            {
                param.AddWithValue("p_hotelId", hotelId);
            }, (reader, set) =>
            {
                int index = 0;
                TransactionSubcategory transactionSubcategory = new();
                transactionSubcategory.Id = reader.GetSafeInt32(index++);
                transactionSubcategory.Name = reader.GetSafeString(index++);
                transactionSubcategory.CategoryId = reader.GetSafeInt32(index++);

                transactionSubcategories ??= new List<TransactionSubcategory>();

                transactionSubcategories.Add(transactionSubcategory);
            });

            return transactionSubcategories;
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
