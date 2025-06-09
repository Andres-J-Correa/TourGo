using System.Data;
using TourGo.Data;
using TourGo.Data.Providers;
using TourGo.Models.Domain.Finances;
using TourGo.Models.Domain;
using TourGo.Models.Requests.Finances;
using MySql.Data.MySqlClient;
using TourGo.Services.Interfaces.Finances;

namespace TourGo.Services.Finances
{
    public class FinancePartnerService : IFinancePartnerService
    {
        private readonly IMySqlDataProvider _dataProvider;

        public FinancePartnerService(IMySqlDataProvider dataProvider)
        {
            _dataProvider = dataProvider;
        }

        public List<Lookup>? GetMinimal(int hotelId)
        {
            string proc = "finance_partners_select_minimal_by_hotel_id";
            List<Lookup>? financePartners = null;
            _dataProvider.ExecuteCmd(proc, (param) =>
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

        public List<FinancePartner>? Get(int hotelId)
        {
            string proc = "finance_partners_select_all_by_hotel_id_v2";
            List<FinancePartner>? financePartners = null;

            _dataProvider.ExecuteCmd(proc, (param) =>
            {
                param.AddWithValue("p_hotelId", hotelId);
            }, (reader, set) =>
            {
                int index = 0;
                FinancePartner financePartner = MapFinancePartner(reader, ref index);

                financePartners ??= new List<FinancePartner>();

                financePartners.Add(financePartner);
            });

            return financePartners;
        }

        public int Add(FinancePartnerAddUpdateRequest model, string userId)
        {
            string proc = "finance_partners_insert_v2";
            int newId = 0;

            _dataProvider.ExecuteNonQuery(proc, (param) =>
            {
                param.AddWithValue("p_name", model.Name);
                param.AddWithValue("p_hotelId", model.Id);
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

        public void Update(FinancePartnerAddUpdateRequest model, string userId)
        {
            string proc = "finance_partners_update_v2";

            _dataProvider.ExecuteNonQuery(proc, (param) =>
            {
                param.AddWithValue("p_name", model.Name);
                param.AddWithValue("p_financePartnerId", model.Id);
                param.AddWithValue("p_modifiedBy", userId);
            });
        }

        public void Delete(int id, string userId)
        {
            string proc = "finance_partners_delete_v2";

            _dataProvider.ExecuteNonQuery(proc, (param) =>
            {
                param.AddWithValue("p_modifiedBy", userId);
                param.AddWithValue("p_financePartnerId", id);
            });
        }

        private static FinancePartner MapFinancePartner(IDataReader reader, ref int index)
        {
            FinancePartner financePartner = new();
            financePartner.Id = reader.GetSafeInt32(index++);
            financePartner.Name = reader.GetSafeString(index++);
            financePartner.IsActive = reader.GetSafeBool(index++);
            financePartner.MapFromReader(reader, ref index);
            return financePartner;
        }
    }
}
