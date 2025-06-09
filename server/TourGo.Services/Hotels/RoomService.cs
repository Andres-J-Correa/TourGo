using MySql.Data.MySqlClient;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TourGo.Data;
using TourGo.Data.Providers;
using TourGo.Models.Domain.Finances;
using TourGo.Models.Domain.Hotels;
using TourGo.Models.Requests.Hotels;
using TourGo.Services.Interfaces.Hotels;

namespace TourGo.Services.Hotels
{
    public class RoomService : IRoomService
    {
        private readonly IMySqlDataProvider _mySqlDataProvider;

        public RoomService(IMySqlDataProvider dataProvider)
        {
            _mySqlDataProvider = dataProvider;
        }

        public int Create(RoomAddUpdateRequest model, string userId)
        {
            string proc = "rooms_insert_v2";
            int newId = 0;

            _mySqlDataProvider.ExecuteNonQuery(proc, (param) =>
            {
                param.AddWithValue("p_name", model.Name);
                param.AddWithValue("p_capacity", model.Capacity);
                param.AddWithValue("p_description", string.IsNullOrEmpty(model.Description) ? DBNull.Value : model.Description);
                param.AddWithValue("p_hotelId", model.Id);
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

        public void Update(RoomAddUpdateRequest model, string userId)
        {
            string proc = "rooms_update_v2";

            _mySqlDataProvider.ExecuteNonQuery(proc, (param) =>
            {
                param.AddWithValue("p_name", model.Name);
                param.AddWithValue("p_capacity", model.Capacity);
                param.AddWithValue("p_description", string.IsNullOrEmpty(model.Description) ? DBNull.Value : model.Description);
                param.AddWithValue("p_roomId", model.Id);
                param.AddWithValue("p_modifiedBy", userId);
            });
        }

        public void Delete(int id, string userId)
        {
            string proc = "rooms_delete";

            _mySqlDataProvider.ExecuteNonQuery(proc, (param) =>
            {
                param.AddWithValue("p_modifiedBy", userId);
                param.AddWithValue("p_roomId", id);
            });
        }

        public List<Room>? GetByHotel(int hotelId, bool? isActive)
        {
            string proc = "rooms_select_by_hotel_v2";
            List<Room>? list = null;

            _mySqlDataProvider.ExecuteCmd(proc, (param) =>
            {
                param.AddWithValue("p_hotelId", hotelId);
                param.AddWithValue("p_isActive", isActive.HasValue ? isActive: DBNull.Value);
            }, (reader, set) =>
            {
                int index = 0;

                Room room = MapRoom(reader, ref index);

                list ??= new List<Room>();

                list.Add(room);
            });

            return list;
        }

        private static Room MapRoom(IDataReader reader, ref int index)
        {
            Room room = new Room();
            room.Id = reader.GetSafeInt32(index++);
            room.Name = reader.GetSafeString(index++);
            room.Description = reader.GetSafeString(index++);
            room.Capacity = reader.GetSafeInt32(index++);
            room.IsActive = reader.GetSafeBool(index++);
            room.MapFromReader(reader, ref index);
            return room;
        }
    }
}
