using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TourGo.Data;
using TourGo.Data.Providers;
using TourGo.Models.Domain.Hotels;
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

        public HotelBase? GetHotel(int userId)
        {

            HotelBase? hotel = null;

            string proc = "hotels_select_byUserId";

            _mySqlDataProvider.ExecuteCmd(proc, (param) =>
            {
                param.AddWithValue("p_userId", userId);
            }, (reader, set) =>
            {
                hotel = new HotelBase();
                int index = 0;

                hotel.Id = reader.GetSafeInt32(index++);
                hotel.Name = reader.GetSafeString(index++);
            });

            return hotel;
        }
    }
}
