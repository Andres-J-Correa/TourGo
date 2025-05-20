using MySql.Data.MySqlClient;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TourGo.Data;
using TourGo.Data.Providers;
using TourGo.Models.Domain.Finances;
using TourGo.Models.Requests.Finances;
using TourGo.Services.Interfaces.Finances;

namespace TourGo.Services.Finances
{
    public class TransactionSubcategoryService : ITransactionSubcategoryService
    {
        private readonly IMySqlDataProvider _mySqlDataProvider;

        public TransactionSubcategoryService(IMySqlDataProvider dataProvider)
        {
            _mySqlDataProvider = dataProvider;
        }

        public int Add(TransactionSubcategoryAddUpdateRequest model, int userId)
        {
            string proc = "transaction_subcategories_insert";
            int newId = 0;

            _mySqlDataProvider.ExecuteNonQuery(proc, (param) =>
            {
                param.AddWithValue("p_name", model.Name);
                param.AddWithValue("p_categoryId", model.CategoryId);
                param.AddWithValue("p_hotelId", model.Id);
                param.AddWithValue("p_modifiedBy", userId);

                MySqlParameter newIdOut = new MySqlParameter("p_newId", MySqlDbType.Int32);
                newIdOut.Direction = ParameterDirection.Output;
                param.Add(newIdOut);
            }, (returnColl) =>
            {
                object newIdObj = returnColl["p_newId"].Value;

                newId = int.TryParse(newIdObj.ToString(), out newId) ? newId : 0;
            });

            return newId;
        }

        public void Update(TransactionSubcategoryAddUpdateRequest model, int userId)
        {
            string proc = "transaction_subcategories_update";

            _mySqlDataProvider.ExecuteNonQuery(proc, (param) =>
            {
                param.AddWithValue("p_name", model.Name);
                param.AddWithValue("p_categoryId", model.CategoryId);
                param.AddWithValue("p_subcategoryId", model.Id);
                param.AddWithValue("p_modifiedBy", userId);
            });
        }

        public void Delete(int id, int userId)
        {
            string proc = "transaction_subcategories_delete";

            _mySqlDataProvider.ExecuteNonQuery(proc, (param) =>
            {
                param.AddWithValue("p_modifiedBy", userId);
                param.AddWithValue("p_subcategoryId", id);
            });
        }

        public List<TransactionSubcategoryBase>? GetMinimal(int hotelId)
        {
            string proc = "transaction_subcategories_select_minimal_by_hotel_id";
            List<TransactionSubcategoryBase>? transactionSubcategories = null;
            _mySqlDataProvider.ExecuteCmd(proc, (param) =>
            {
                param.AddWithValue("p_hotelId", hotelId);
            }, (reader, set) =>
            {
                int index = 0;
                TransactionSubcategoryBase transactionSubcategory = new();
                transactionSubcategory.Id = reader.GetSafeInt32(index++);
                transactionSubcategory.Name = reader.GetSafeString(index++);
                transactionSubcategory.CategoryId = reader.GetSafeInt32(index++);

                transactionSubcategories ??= new List<TransactionSubcategoryBase>();

                transactionSubcategories.Add(transactionSubcategory);
            });

            return transactionSubcategories;
        }

        public List<TransactionSubcategory>? GetAll(int hotelId)
        {
            string proc = "transaction_subcategories_select_all_by_hotel_id";
            List<TransactionSubcategory>? transactionSubcategories = null;

            _mySqlDataProvider.ExecuteCmd(proc, (param) =>
            {
                param.AddWithValue("p_hotelId", hotelId);
            }, (reader, set) =>
            {
                int index = 0;
                TransactionSubcategory transactionSubcategory = MapTransactionSubcategory(reader, ref index);

                transactionSubcategories ??= new List<TransactionSubcategory>();

                transactionSubcategories.Add(transactionSubcategory);
            });

            return transactionSubcategories;
        }

        private static TransactionSubcategory MapTransactionSubcategory(IDataReader reader, ref int index)
        {
            TransactionSubcategory transactionSubcategory = new();
            transactionSubcategory.Id = reader.GetSafeInt32(index++);
            transactionSubcategory.Name = reader.GetSafeString(index++);
            transactionSubcategory.CategoryId = reader.GetSafeInt32(index++);
            transactionSubcategory.IsActive = reader.GetSafeBool(index++);
            transactionSubcategory.CreatedBy.Id = reader.GetSafeInt32(index++);
            transactionSubcategory.CreatedBy.FirstName = reader.GetSafeString(index++);
            transactionSubcategory.CreatedBy.LastName = reader.GetSafeString(index++);
            transactionSubcategory.ModifiedBy.Id = reader.GetSafeInt32(index++);
            transactionSubcategory.ModifiedBy.FirstName = reader.GetSafeString(index++);
            transactionSubcategory.ModifiedBy.LastName = reader.GetSafeString(index++);
            transactionSubcategory.DateCreated = reader.GetSafeDateTime(index++);
            transactionSubcategory.DateModified = reader.GetSafeDateTime(index++);
            return transactionSubcategory;
        }

    }
}
