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

        public string? Add(InvoiceAddRequest model, int userId)
        {
            string proc = "invoices_upsert";
            string? newId = null;

            _mySqlDataProvider.ExecuteNonQuery(proc, (param) =>
            {
                param.AddWithValue("p_externalId", model.ExternalId);
                param.AddWithValue("p_url", model.Url);
                param.AddWithValue("p_modifiedBy", userId);
                param.AddWithValue("p_bookingId", model.BookingId);
                param.AddWithValue("p_subtotal", model.Subtotal);
                param.AddWithValue("p_paid", model.Paid);
                param.AddWithValue("p_charges", model.Charges);
                param.AddWithValue("p_total", model.Total);
                param.AddWithValue("p_balanceDue", model.BalanceDue);
                param.AddWithValue("p_hotelId", model.Id);

                MySqlParameter newIdOut = new MySqlParameter("p_newId", MySqlDbType.VarChar);
                newIdOut.Direction = ParameterDirection.Output;
                param.Add(newIdOut);

            }, (returnColl) =>
            {
                object newIdObj = returnColl["p_newId"].Value;

                newId = newIdObj.ToString() ?? string.Empty;
            });

            return newId;

        }



    }
}
