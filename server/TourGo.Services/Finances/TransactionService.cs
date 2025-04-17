using MySql.Data.MySqlClient;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TourGo.Data.Providers;
using TourGo.Models.Requests.Finances;
using TourGo.Services.Interfaces;

namespace TourGo.Services.Finances
{
    public class TransactionService : ITransactionService
    {
        private readonly IMySqlDataProvider _dataProvider;

        public TransactionService(IMySqlDataProvider provider)
        {
            _dataProvider = provider;
        }

        public int Add(TransactionAddRequest request, int userId)
        {
            string proc = "transactions_insert";
            int newId = 0;

            _dataProvider.ExecuteNonQuery(proc, (col) =>
            {
                col.AddWithValue("p_entityId", request.EntityId > 0 ? request.EntityId : DBNull.Value);
                col.AddWithValue("p_parentId", request.ParentId > 0 ? request.ParentId: DBNull.Value);
                col.AddWithValue("p_amount", request.Amount);
                col.AddWithValue("p_transactionDate", request.TransactionDate.ToString("yyyy-MM-dd"));
                col.AddWithValue("p_paymentMethodId", request.PaymentMethodId);
                col.AddWithValue("p_categoryId", request.CategoryId);
                col.AddWithValue("p_subcategoryId", request.SubcategoryId);
                col.AddWithValue("p_referenceNumber", request.ReferenceNumber);
                col.AddWithValue("p_statusId", request.StatusId);
                col.AddWithValue("p_documentUrl", request.DocumentUrl);
                col.AddWithValue("p_description", request.Description);
                col.AddWithValue("p_currencyCode", request.CurrencyCode);
                col.AddWithValue("p_financePartnerId", request.FinancePartnerId > 0 ? request.FinancePartnerId : DBNull.Value);
                col.AddWithValue("p_createdBy", userId);
                col.AddWithValue("p_approvedBy", userId);
                col.AddWithValue("p_hotelId", request.Id);

                MySqlParameter resultOut = new MySqlParameter("p_newId", MySqlDbType.Int32);
                resultOut.Direction = ParameterDirection.Output;
                col.Add(resultOut);

            }, (returnCol =>
            {
                object newIdObj = returnCol["p_newId"].Value;

                newId = int.TryParse(newIdObj.ToString(), out newId) ? newId : 0;

            }));

            return newId;
        }
    }
}
