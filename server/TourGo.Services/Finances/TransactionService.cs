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
using TourGo.Models.Domain.Finances;
using TourGo.Models.Domain.Users;
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
                col.AddWithValue("p_invoiceId", request.InvoiceId > 0 ? request.InvoiceId : DBNull.Value);
                col.AddWithValue("p_amount", request.Amount);
                col.AddWithValue("p_transactionDate", request.TransactionDate.ToString("yyyy-MM-dd"));
                col.AddWithValue("p_paymentMethodId", request.PaymentMethodId);
                col.AddWithValue("p_categoryId", request.CategoryId);
                col.AddWithValue("p_subcategoryId", request.SubcategoryId);
                col.AddWithValue("p_referenceNumber", request.ReferenceNumber);
                col.AddWithValue("p_statusId", request.StatusId);
                col.AddWithValue("p_documentUrl", request.DocumentUrl?? (object)DBNull.Value);
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

        public static Transaction MapTransaction(IDataReader reader, ref int index)
        {
            Transaction transaction = new();

            transaction.Id = reader.GetSafeInt32(index++);
            transaction.ParentId = reader.GetSafeInt32(index++);
            transaction.Amount = reader.GetSafeDecimal(index++);
            transaction.TransactionDate = reader.GetSafeDateTime(index++);
            transaction.DateCreated = reader.GetSafeDateTime(index++);
            transaction.CreatedBy = new UserBase();
            transaction.CreatedBy.Id = reader.GetSafeInt32(index++);
            transaction.CreatedBy.FirstName = reader.GetSafeString(index++);
            transaction.CreatedBy.LastName = reader.GetSafeString(index++);
            transaction.PaymentMethod = new Lookup();
            transaction.PaymentMethod.Id = reader.GetSafeInt32(index++);
            transaction.PaymentMethod.Name = reader.GetSafeString(index++);
            transaction.Category = new Lookup();
            transaction.Category.Id = reader.GetSafeInt32(index++);
            transaction.Category.Name = reader.GetSafeString(index++);
            transaction.Subcategory = new Lookup();
            transaction.Subcategory.Id = reader.GetSafeInt32(index++);
            transaction.Subcategory.Name = reader.GetSafeString(index++);
            transaction.ReferenceNumber = reader.GetSafeString(index++);
            transaction.Status = new Lookup();
            transaction.Status.Id = reader.GetSafeInt32(index++);
            transaction.Status.Name = reader.GetSafeString(index++);
            transaction.DocumentUrl = reader.GetSafeString(index++);
            transaction.Description = reader.GetSafeString(index++);
            transaction.ApprovedBy = new UserBase();
            transaction.ApprovedBy.Id = reader.GetSafeInt32(index++);
            transaction.ApprovedBy.FirstName = reader.GetSafeString(index++);
            transaction.ApprovedBy.LastName = reader.GetSafeString(index++);
            transaction.CurrencyCode = reader.GetSafeString(index++);
            transaction.HotelId = reader.GetSafeInt32(index++);
            transaction.FinancePartner = new Lookup();
            transaction.FinancePartner.Id = reader.GetSafeInt32(index++);
            transaction.FinancePartner.Name = reader.GetSafeString(index++);
            transaction.EntityId = reader.GetSafeInt32(index++);

            return transaction;
        }
    }
}
