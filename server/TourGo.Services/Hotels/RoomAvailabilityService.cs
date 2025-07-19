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
using TourGo.Models.Domain.Hotels;
using TourGo.Models.Requests.Hotels;
using TourGo.Services.Interfaces.Hotels;

namespace TourGo.Services.Hotels
{
    public class RoomAvailabilityService : IRoomAvailabilityService
    {
        private readonly IMySqlDataProvider _mySqlDataProvider;

        public RoomAvailabilityService(IMySqlDataProvider mySqlDataProvider)
        {
            _mySqlDataProvider = mySqlDataProvider;
        }

        public void Upsert(string hotelId, string userId, RoomAvailabilityUpsertRequest request)
        {
            string proc = "room_availability_upsert";

            _mySqlDataProvider.ExecuteNonQuery(proc,
                (MySqlParameterCollection param) =>
                {
                    param.AddWithValue("p_hotelId", hotelId);
                    param.AddWithValue("p_isOpen", request.IsOpen);
                    param.AddWithValue("p_jsonData", JsonConvert.SerializeObject(request.Requests));
                    param.AddWithValue("p_userId", userId);
                });
        }

        public List<RoomAvailability>? GetAll(string hotelId, DateOnly startDate, DateOnly endDate)
        {
            string proc = "room_availability_select_by_date_range";

            List<RoomAvailability>? results = null;

            _mySqlDataProvider.ExecuteCmd(proc,
                (MySqlParameterCollection param) =>
                {
                    param.AddWithValue("p_hotelId", hotelId);
                    param.AddWithValue("p_startDate", startDate);
                    param.AddWithValue("p_endDate", endDate);
                },
                (IDataReader reader, short set) =>
                {
                    int index = 0;
                    RoomAvailability roomAvailability = new RoomAvailability
                    {
                        Date = DateOnly.FromDateTime(reader.GetSafeDateTime(index++)),
                        RoomId = reader.GetSafeInt32(index++),
                        IsOpen = reader.GetSafeBool(index++)

                    };
                    results ??= new List<RoomAvailability>();
                    results.Add(roomAvailability);
                });

            return results;
        }
    }
}
