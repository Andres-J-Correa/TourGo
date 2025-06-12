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
using TourGo.Models.Domain;
using TourGo.Models.Domain.Finances;
using TourGo.Models.Domain.Hotels;
using TourGo.Models.Domain.Users;
using TourGo.Models.Requests.Finances;
using TourGo.Models.Requests.Hotels;
using TourGo.Services.Interfaces.Hotels;

namespace TourGo.Services.Hotels
{
    public class HotelService : IHotelService
    {
        private readonly IMySqlDataProvider _mySqlDataProvider;

        public HotelService(IMySqlDataProvider dataProvider)
        {
            _mySqlDataProvider = dataProvider;
        }
        public int Create(HotelAddRequest model, string userId, string publicId)
        {
            int newId = 0;

            string proc = "hotels_insert_v3";

            _mySqlDataProvider.ExecuteNonQuery(proc, (param) =>
            {
                param.AddWithValue("p_name", model.Name);
                param.AddWithValue("p_phone", model.Phone);
                param.AddWithValue("p_address", model.Address);
                param.AddWithValue("p_email", model.Email);
                param.AddWithValue("p_taxId", model.TaxId);
                param.AddWithValue("p_modifiedBy", userId);
                param.AddWithValue("p_publicId", publicId);

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

        public void Update(HotelUpdateRequest model, string userId)
        {

            string proc = "hotels_update_v3";

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

        public void Delete(string id, string userId)
        {
            string proc = "hotels_delete_v3";

            _mySqlDataProvider.ExecuteNonQuery(proc, (param) =>
            {
                param.AddWithValue("p_modifiedBy", userId);
                param.AddWithValue("p_hotelId", id);
            });
        }

        public Hotel? GetDetails(string id)
        {
            string proc = "hotels_select_details_by_id_v3";
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
                    user.Id = reader.GetSafeString(index++);
                    user.FirstName = reader.GetSafeString(index++);
                    user.LastName = reader.GetSafeString(index++);
                    hotel.Owner = user;
                }
            });

            return hotel;
        }

        public HotelMinimal? GetMinimal(string id)
        {
            string proc = "hotels_select_minimal_by_id_v2";

            HotelMinimal? lookup = null;

            _mySqlDataProvider.ExecuteCmd(proc, (param) =>
            {
                param.AddWithValue("p_hotelId", id);
            }, (reader, set) =>
            {
                int index = 0;

                lookup = new HotelMinimal();
                lookup.Id = reader.GetSafeString(index++);
                lookup.Name = reader.GetSafeString(index++);
            });

            return lookup;
        }

        public HotelMinimal? GetMinimalByTransactionId(int txnId)
        {
            string proc = "hotels_select_minimal_by_transaction_id_v2";

            HotelMinimal? lookup = null;

            _mySqlDataProvider.ExecuteCmd(proc, (param) =>
            {
                param.AddWithValue("p_txnId", txnId);
            }, (reader, set) =>
            {
                int index = 0;

                lookup = new HotelMinimal();
                lookup.Id = reader.GetSafeString(index++);
                lookup.Name = reader.GetSafeString(index++);
            });

            return lookup;
        }
        public HotelMinimalWithUserRole? GetMinimalWithUserRole(string id, string userId)
        {

            string proc = "hotels_select_minimal_by_id_with_user_role_v3";

            HotelMinimalWithUserRole? hotel = null;

            _mySqlDataProvider.ExecuteCmd(proc, (param) =>
            {
                param.AddWithValue("p_hotelId", id);
                param.AddWithValue("p_userId", userId);
            }, (reader, set) =>
            {
                int index = 0;

                hotel = new HotelMinimalWithUserRole();
                hotel.Id = reader.GetSafeString(index++);
                hotel.Name = reader.GetSafeString(index++);
                hotel.RoleId = reader.GetSafeInt32(index++);
            });

            return hotel;
        }

        public List<HotelMinimal>? GetUserHotelsMinimal(string userId)
        {
            string proc = "hotels_select_minimal_by_user_v3";
            List<HotelMinimal>? hotels = null;

            _mySqlDataProvider.ExecuteCmd(proc, (param) =>
            {
                param.AddWithValue("p_userId", userId);
            }, (reader, set) =>
            {
                int index = 0;
                HotelMinimal hotel = new();
                hotel.Id = reader.GetSafeString(index++);
                hotel.Name = reader.GetSafeString(index++);

                hotels ??= new List<HotelMinimal>();

                hotels.Add(hotel);
            });

            return hotels;
        }

        public List<RolePermission>? GetRolePermissions()
        {
            string proc = "hotel_roles_permissions_select_all";
            List<RolePermission>? permissions = null;

            _mySqlDataProvider.ExecuteCmd(proc, null, (reader, set) =>
            {
                int index = 0;
                RolePermission permission = new();
                permission.RoleId = reader.GetSafeInt32(index++);
                permission.ResourceTypeId = reader.GetSafeInt32(index++);
                permission.Create = reader.GetSafeBool(index++);
                permission.Read = reader.GetSafeBool(index++);
                permission.Update = reader.GetSafeBool(index++);
                permission.Delete = reader.GetSafeBool(index++);

                permissions ??= new List<RolePermission>();
                permissions.Add(permission);
            });
            return permissions;
        }

        public List<string>? GetAvailablePublicIds(List<string> possibleIds)
        {
            string proc = "hotels_select_available_public_ids";
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

        private static Hotel MapHotel(IDataReader reader, ref int index)
        {
            Hotel hotel = new();
            hotel.Id = reader.GetSafeString(index++);
            hotel.Name = reader.GetSafeString(index++);
            hotel.Phone = reader.GetSafeString(index++);
            hotel.Address = reader.GetSafeString(index++);
            hotel.Email = reader.GetSafeString(index++);
            hotel.TaxId = reader.GetSafeString(index++);
            return hotel;
        }
    }
}
