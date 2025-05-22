using MySql.Data.MySqlClient;
using System.Data;
using TourGo.Data;
using TourGo.Data.Providers;
using TourGo.Models.Domain;
using TourGo.Models.Domain.Finances;
using TourGo.Models.Requests.Finances;
using TourGo.Services.Interfaces.Finances;

namespace TourGo.Services.Finances
{
    public class PaymentMethodService : IPaymentMethodService
    {
        private readonly IMySqlDataProvider _dataProvider;

        public PaymentMethodService(IMySqlDataProvider dataProvider)
        {
            _dataProvider = dataProvider;
        }

        public List<Lookup>? GetMinimal(int hotelId)
        {
            string proc = "payment_methods_select_minimal_by_hotel_id";
            List<Lookup>? paymentMethods = null;
            _dataProvider.ExecuteCmd(proc, (param) =>
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

        public List<PaymentMethod>? Get(int hotelId)
        {
            string proc = "payment_methods_select_all_by_hotel_id";
            List<PaymentMethod>? paymentMethods = null;

            _dataProvider.ExecuteCmd(proc, (param) =>
            {
                param.AddWithValue("p_hotelId", hotelId);
            }, (reader, set) =>
            {
                int index = 0;
                PaymentMethod paymentMethod = MapPaymentMethod(reader, ref index);

                paymentMethods ??= new List<PaymentMethod>();

                paymentMethods.Add(paymentMethod);
            });

            return paymentMethods;
        }

        public int Add(PaymentMethodAddUpdateRequest model, int userId)
        {
            string proc = "payment_methods_insert";
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

        public void Update(PaymentMethodAddUpdateRequest model, int userId)
        {
            string proc = "payment_methods_update";

            _dataProvider.ExecuteNonQuery(proc, (param) =>
            {
                param.AddWithValue("p_name", model.Name);
                param.AddWithValue("p_paymentMethodId", model.Id);
                param.AddWithValue("p_modifiedBy", userId);
            });
        }

        public void Delete(int id, int userId)
        {
            string proc = "payment_methods_delete";

            _dataProvider.ExecuteNonQuery(proc, (param) =>
            {
                param.AddWithValue("p_modifiedBy", userId);
                param.AddWithValue("p_paymentMethodId", id);
            });
        }

        private static PaymentMethod MapPaymentMethod(IDataReader reader, ref int index)
        {
            PaymentMethod paymentMethod = new();
            paymentMethod.Id = reader.GetSafeInt32(index++);
            paymentMethod.Name = reader.GetSafeString(index++);
            paymentMethod.IsActive = reader.GetSafeBool(index++);
            paymentMethod.MapFromReader(reader, ref index);
            return paymentMethod;
        }
    }
}
