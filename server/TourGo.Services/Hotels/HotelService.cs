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

                MySqlParameter newIdOut = new MySqlParameter("@p_newId", MySqlDbType.Int32);
                newIdOut.Direction = ParameterDirection.Output;
                param.Add(newIdOut);
            }, (returnColl) =>
            {
                object newIdObj = returnColl["p_newId"].Value;

                newId = int.TryParse(newIdObj.ToString(), out newId) ? newId : 0;
            });

            return newId;
        }
    }
}
