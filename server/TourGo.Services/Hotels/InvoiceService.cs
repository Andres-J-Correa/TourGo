using MySql.Data.MySqlClient;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TourGo.Data.Providers;
using TourGo.Models.Requests.Invoices;
using TourGo.Services.Interfaces.Hotels;

namespace TourGo.Services.Hotels
{
    public class InvoiceService : IInvoiceService
    {
        readonly private IMySqlDataProvider _mySqlDataProvider;

        public InvoiceService(IMySqlDataProvider mySqlDataProvider)
        {
            _mySqlDataProvider = mySqlDataProvider;
        }


        public int Add(InvoiceAddRequest model, int userId)
        {
            string proc = "invoices_insert";
            int newId = 0;

            _mySqlDataProvider.ExecuteNonQuery(proc, (param) =>
            {
                param.AddWithValue("p_parentId", model.ParentId.HasValue ? model.ParentId : DBNull.Value);
                param.AddWithValue("p_externalId", model.ExternalId ?? (object)DBNull.Value);
                param.AddWithValue("p_customerId", model.CustomerId);
                param.AddWithValue("p_hotelId", model.Id);
                param.AddWithValue("p_typeId", model.TypeId);
                param.AddWithValue("p_statusId", model.StatusId);
                param.AddWithValue("p_url", model.Url ?? (object)DBNull.Value);
                param.AddWithValue("p_modifiedBy", userId);
                param.AddWithValue("p_subtotal", model.Subtotal);
                param.AddWithValue("p_paid", model.Paid);
                param.AddWithValue("p_charges", model.Charges);
                param.AddWithValue("p_total", model.Total);
                param.AddWithValue("p_balanceDue", model.BalanceDue);

                MySqlParameter newIdOut = new MySqlParameter("p_newId", MySqlDbType.Int32);
                newIdOut.Direction = ParameterDirection.Output;
                param.Add(newIdOut);
            }, (returnColl) =>
            {
                object resultObj = returnColl["p_newId"].Value;
                newId = Convert.ToInt32(resultObj);
            });

            return newId;
        }

        public void Update(InvoiceUpdateRequest model, int userId)
        {
            string proc = "invoices_update";

            _mySqlDataProvider.ExecuteNonQuery(proc, (param) =>
            {
                param.AddWithValue("p_id", model.Id);
                param.AddWithValue("p_parentId", model.ParentId.HasValue ? model.ParentId : DBNull.Value);
                param.AddWithValue("p_externalId", model.ExternalId ?? (object)DBNull.Value);
                param.AddWithValue("p_customerId", model.CustomerId);
                param.AddWithValue("p_typeId", model.TypeId);
                param.AddWithValue("p_statusId", model.StatusId);
                param.AddWithValue("p_url", model.Url ?? (object)DBNull.Value);
                param.AddWithValue("p_modifiedBy", userId);
                param.AddWithValue("p_subtotal", model.Subtotal);
                param.AddWithValue("p_paid", model.Paid);
                param.AddWithValue("p_charges", model.Charges);
                param.AddWithValue("p_total", model.Total);
                param.AddWithValue("p_balanceDue", model.BalanceDue);
                param.AddWithValue("p_locked", model.Locked ? 1 : 0);
            });

        }



    }
}
