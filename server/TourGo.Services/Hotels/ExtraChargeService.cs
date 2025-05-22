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
using TourGo.Models.Requests.Hotels;
using TourGo.Services.Interfaces.Hotels;

namespace TourGo.Services.Hotels
{
    public class ExtraChargeService : IExtraChargeService
    {
        private readonly IMySqlDataProvider _mySqlDataProvider;

        public ExtraChargeService(IMySqlDataProvider dataProvider)
        {
            _mySqlDataProvider = dataProvider;
        }

        public int Create(ExtraChargeAddUpdateRequest model, int userId)
        {

            string proc = "extra_charges_insert";
            int newId = 0;

            _mySqlDataProvider.ExecuteNonQuery(proc, (param) =>
            {
                param.AddWithValue("p_name", model.Name);
                param.AddWithValue("p_typeId", model.TypeId);
                param.AddWithValue("p_amount", model.Amount);
                param.AddWithValue("p_hotelId", model.Id);
                param.AddWithValue("p_modifiedBy", userId);

                MySqlParameter newIdOut = new MySqlParameter("p_newId", MySqlDbType.Int32);
                newIdOut.Direction = System.Data.ParameterDirection.Output;
                param.Add(newIdOut);
            }, (returnColl) =>
            {
                object newIdObj = returnColl["p_newId"].Value;

                newId = int.TryParse(newIdObj.ToString(), out newId) ? newId : 0;
            });

            return newId;
        }

        public void Update(ExtraChargeAddUpdateRequest model, int userId)
        {
            string proc = "extra_charges_update";

            _mySqlDataProvider.ExecuteNonQuery(proc, (param) =>
            {
                param.AddWithValue("p_name", model.Name);
                param.AddWithValue("p_typeId", model.TypeId);
                param.AddWithValue("p_amount", model.Amount);
                param.AddWithValue("p_extraChargeId", model.Id);
                param.AddWithValue("p_modifiedBy", userId);
            });
        }
        public void Delete(int id, int userId)
        {
            string proc = "extra_charges_delete";

            _mySqlDataProvider.ExecuteNonQuery(proc, (param) =>
            {
                param.AddWithValue("p_modifiedBy", userId);
                param.AddWithValue("p_extraChargeId", id);
            });
        }

        public List<ExtraCharge>? GetByHotel(int hotelId, bool?isActive)
        {

            string proc = "extra_charges_select_by_hotel";
            List<ExtraCharge>? list = null;

            _mySqlDataProvider.ExecuteCmd(proc, (param) =>
            {
                param.AddWithValue("p_hotelId", hotelId);
                param.AddWithValue("p_isActive", isActive.HasValue ? isActive : DBNull.Value);
            }, (reader, set) =>
            {
                int index = 0;
                ExtraCharge extraCharge = MapExtraCharge(reader, ref index);

                list ??= new List<ExtraCharge>();

                list.Add(extraCharge);

            });

            return list;

        }

        public static ExtraCharge MapExtraCharge(IDataReader reader, ref int index)
        {
            ExtraCharge extraCharge = new ExtraCharge();
            extraCharge.Id = reader.GetSafeInt32(index++);
            extraCharge.Name = reader.GetSafeString(index++);
            extraCharge.Amount = reader.GetSafeDecimal(index++);
            extraCharge.Type = new Lookup
            {
                Id = reader.GetSafeInt32(index++),
                Name = reader.GetSafeString(index++)
            };
            extraCharge.IsActive = reader.GetSafeBool(index++);
            extraCharge.CreatedBy.Id = reader.GetSafeInt32(index++);
            extraCharge.CreatedBy.FirstName = reader.GetSafeString(index++);
            extraCharge.CreatedBy.LastName = reader.GetSafeString(index++);
            extraCharge.ModifiedBy.Id = reader.GetSafeInt32(index++);
            extraCharge.ModifiedBy.FirstName = reader.GetSafeString(index++);
            extraCharge.ModifiedBy.LastName = reader.GetSafeString(index++);
            extraCharge.DateCreated = reader.GetSafeDateTime(index++);
            extraCharge.DateModified = reader.GetSafeDateTime(index++);

            return extraCharge;
        }
    }
}
