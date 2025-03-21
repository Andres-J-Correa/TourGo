using MySql.Data.MySqlClient;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TourGo.Data;
using TourGo.Data.Providers;
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

        public int Create(RoomAddEditRequest model, int userId)
        {
            string proc = "rooms_insert";
            int newId = 0;

            _mySqlDataProvider.ExecuteNonQuery(proc, (param) =>
            {
                param.AddWithValue("p_name", model.Name);
                param.AddWithValue("p_capacity", model.Capacity);
                param.AddWithValue("p_description", model.Description);
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

        public int Update(RoomAddEditRequest model, int userId)
        {
            string proc = "rooms_update_v2";
            int newId = 0;

            _mySqlDataProvider.ExecuteNonQuery(proc, (param) =>
            {
                param.AddWithValue("p_name", model.Name);
                param.AddWithValue("p_capacity", model.Capacity);
                param.AddWithValue("p_description", model.Description);
                param.AddWithValue("p_roomId", model.Id);
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

        public void Delete(int id, int userId)
        {
            string proc = "rooms_delete";

            _mySqlDataProvider.ExecuteNonQuery(proc, (param) =>
            {
                param.AddWithValue("p_modifiedBy", userId);
                param.AddWithValue("p_roomId", id);
            });
        }

        public List<Room>? GetByHotel(int hotelId)
        {
            string proc = "rooms_select_by_hotel";
            List<Room>? list = null;

            _mySqlDataProvider.ExecuteCmd(proc, (param) =>
            {
                param.AddWithValue("p_hotelId", hotelId);
            }, (reader, set) =>
            {
                Room room = new Room();
                int index = 0;

                room.Id = reader.GetSafeInt32(index++);
                room.Name = reader.GetSafeString(index++);
                room.Description = reader.GetSafeString(index++);
                room.Capacity = reader.GetSafeInt32(index++);

                list ??= new List<Room>();

                list.Add(room);
            });

            return list;
        }
    }
}
