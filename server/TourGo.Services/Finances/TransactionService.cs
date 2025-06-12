using MySql.Data.MySqlClient;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TourGo.Data;
using TourGo.Data.Providers;
using TourGo.Models;
using TourGo.Models.Domain;
using TourGo.Models.Domain.Bookings;
using TourGo.Models.Domain.Finances;
using TourGo.Models.Domain.Users;
using TourGo.Models.Enums.Transactions;
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

        public int Add(TransactionAddRequest request, string userId, string hotelId)
        {
            string proc = "transactions_insert_v4";
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
                col.AddWithValue("p_referenceNumber", string.IsNullOrEmpty(request.ReferenceNumber) ? DBNull.Value : request.ReferenceNumber);
                col.AddWithValue("p_statusId", request.StatusId);
                col.AddWithValue("p_description", request.Description);
                col.AddWithValue("p_currencyCode", request.CurrencyCode);
                col.AddWithValue("p_financePartnerId", request.FinancePartnerId > 0 ? request.FinancePartnerId : DBNull.Value);
                col.AddWithValue("p_createdBy", userId);
                col.AddWithValue("p_approvedBy", userId);
                col.AddWithValue("p_hotelId", hotelId);

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

        public int Reverse(int txnId, string userId)
        {
            string proc = "transactions_reverse_v2";
            int newId = 0;

            _dataProvider.ExecuteNonQuery(proc, (col) =>
            {
                col.AddWithValue("p_txnId", txnId);
                col.AddWithValue("p_reversedBy", userId);

                MySqlParameter resultOut = new MySqlParameter("p_newId", MySqlDbType.Int32);
                resultOut.Direction = ParameterDirection.Output;
                col.Add(resultOut);

            }, (returnCol) =>
            {
                object newIdObj = returnCol["p_newId"].Value;

                newId = int.TryParse(newIdObj.ToString(), out newId) ? newId : 0;

            });

            return newId;
        }

        public List<Transaction>? GetByEntityId (int entityId)
        {

            string proc = "transactions_select_by_entity_id_v3";
            List<Transaction>? transactions = null;

            _dataProvider.ExecuteCmd(proc, (col) =>
            {
                col.AddWithValue("p_id", entityId);
            }, (reader, returnCol) =>
            {
                int index = 0;

                Transaction transaction = MapTransaction(reader, ref index);

                transactions ??= new List<Transaction>();

                transactions.Add(transaction);
            });

            return transactions;
        }

        public Paged<Transaction>? GetPaginated(string hotelId, int pageIndex, int pageSize, string? sortColumn, string? sortDirection,
            DateOnly? startDate, DateOnly? endDate, int? txnId, int? parentId, int? entityId, int? categoryId, int? statusId, string? referenceNumber, 
            string? description, bool? hasDocumentUrl, int? paymentMethodId, int? subcategoryId, int? financePartnerId)
        {
            string proc = "transactions_select_paginated_v4";
            Paged<Transaction>? paged = null;
            List<Transaction>? transactions = null;
            int totalCount = 0;

            string mappedColumn = !string.IsNullOrEmpty(sortColumn) && TransactionSortColumns.TryGetValue(sortColumn, out var value) ? value : string.Empty;

            _dataProvider.ExecuteCmd(proc, (col) =>
            {
                col.AddWithValue("p_pageIndex", pageIndex);
                col.AddWithValue("p_pageSize", pageSize);
                col.AddWithValue("p_hotelId", hotelId);

                col.AddWithValue("p_sortColumn", string.IsNullOrEmpty(mappedColumn) ? DBNull.Value: mappedColumn);
                col.AddWithValue("p_sortDirection", string.IsNullOrEmpty(sortDirection) ? DBNull.Value : sortDirection);
                col.AddWithValue("p_startDate", startDate.HasValue ? startDate.Value.ToString("yyyy-MM-dd") : DBNull.Value);
                col.AddWithValue("p_endDate", endDate.HasValue ? endDate.Value.ToString("yyyy-MM-dd") : DBNull.Value);
                col.AddWithValue("p_id", txnId > 0 ? txnId : DBNull.Value);
                col.AddWithValue("p_parentId", parentId > 0 ? parentId : DBNull.Value);
                col.AddWithValue("p_entityId", entityId > 0 ? entityId : DBNull.Value);
                col.AddWithValue("p_categoryId", categoryId > 0 ? categoryId : DBNull.Value);
                col.AddWithValue("p_statusId", statusId > 0 ? statusId : DBNull.Value);
                col.AddWithValue("p_referenceNumber", string.IsNullOrEmpty(referenceNumber) ? DBNull.Value : referenceNumber);
                col.AddWithValue("p_description", string.IsNullOrEmpty(description) ? DBNull.Value : description);
                col.AddWithValue("p_hasDocumentUrl", hasDocumentUrl.HasValue ? hasDocumentUrl.Value : DBNull.Value);
                col.AddWithValue("p_paymentMethodId", paymentMethodId > 0 ? paymentMethodId : DBNull.Value);
                col.AddWithValue("p_subcategoryId", subcategoryId > 0 ? subcategoryId : DBNull.Value);
                col.AddWithValue("p_financePartnerId", financePartnerId > 0 ? financePartnerId : DBNull.Value);
                }, (reader, returnCol) =>
                {
                    int index = 0;
                    Transaction transaction = MapTransaction(reader, ref index);
                    transaction.Total = reader.GetSafeDecimal(index++);

                    if (totalCount == 0)
                    {
                        totalCount = reader.GetSafeInt32(index++);
                    }

                    transactions ??= new List<Transaction>();
                    transactions.Add(transaction);
                });

            if(transactions != null)
            {
                paged = new Paged<Transaction>(
                        transactions,
                        pageIndex,
                        pageSize,
                        totalCount
                        );
            }

            return paged;
        }

        public void UpdateDocumentUrl (int transactionId, string fileKey)
        {

           string proc = "transactions_update_by_id_document_url";

            _dataProvider.ExecuteNonQuery(proc, (col) =>
            {
                col.AddWithValue("p_id", transactionId);
                col.AddWithValue("p_documentUrl", fileKey);
            });
        }

        public string? GetSupportDocumentUrl (int transactionId)
        {
            string proc = "transactions_select_document_url_by_id";
            string? fileKey = null;

            _dataProvider.ExecuteCmd(proc, (col) =>
            {
                col.AddWithValue("p_id", transactionId);
            }, (reader, returnCol) =>
            {
                int index = 0;

                fileKey = reader.GetSafeString(index++);
            });

            return fileKey;
        }

        public void UpdateDescription(TransactionDescriptionUpdateRequest model)
        {
            string proc = "transactions_update_description";

            _dataProvider.ExecuteNonQuery(proc, (col) =>
            {
                col.AddWithValue("p_txnId", model.Id);
                col.AddWithValue("p_description", model.Description);
            });
        }
        public string GetFileKey(TransactionFileAddRequest model, string hotelId)
        {
            string folder = GetFolderName(model.Amount);
            string fileExtension = Path.GetExtension(model.File.FileName).ToLower();
            string date = DateTime.UtcNow.ToString("yyyy-MM-dd");
            string fileKey = $"hotels/{hotelId}/{folder}/transaction-{model.Id}-date-{date}{fileExtension}";
            return fileKey;
        }

        public bool IsValidSortDirection(string? direction)
        {
            return string.Equals(direction, "ASC", StringComparison.OrdinalIgnoreCase)
                || string.Equals(direction, "DESC", StringComparison.OrdinalIgnoreCase);
        }

        public bool IsValidSortColumn(string? column)
        {
            return !string.IsNullOrWhiteSpace(column) && TransactionSortColumns.ContainsKey(column);
        }

        private string GetFolderName(decimal amount)
        {
            if (amount >= 0)
                return "payments-received";
            else
                return "payments-made";
        }

        public static Transaction MapTransaction(IDataReader reader, ref int index)
        {
            Transaction transaction = new();

            transaction.Id = reader.GetSafeInt32(index++);
            transaction.ParentId = reader.GetSafeInt32(index++);
            transaction.EntityId = reader.GetSafeInt32(index++);
            transaction.Amount = reader.GetSafeDecimal(index++);
            transaction.TransactionDate = reader.GetSafeDateTime(index++);
            transaction.DateCreated = reader.GetSafeDateTime(index++);
            transaction.CategoryId = reader.GetSafeInt32(index++);
            transaction.StatusId = reader.GetSafeInt32(index++);
            transaction.ReferenceNumber = reader.GetSafeString(index++);
            transaction.Description = reader.GetSafeString(index++);
            transaction.CurrencyCode = reader.GetSafeString(index++);
            transaction.HasDocumentUrl = reader.GetSafeBool(index++);


            transaction.CreatedBy.Id = reader.GetSafeString(index++);
            transaction.CreatedBy.FirstName = reader.GetSafeString(index++);
            transaction.CreatedBy.LastName = reader.GetSafeString(index++);
            transaction.PaymentMethod.Id = reader.GetSafeInt32(index++);
            transaction.PaymentMethod.Name = reader.GetSafeString(index++);

            int subcategoryId = reader.GetSafeInt32(index++);
            if(subcategoryId > 0)
            {
                transaction.Subcategory = new Lookup();
                transaction.Subcategory.Id = subcategoryId;
                transaction.Subcategory.Name = reader.GetSafeString(index++);
            }
            else
            {
                transaction.Subcategory = null;
                index++;
            }
            transaction.ApprovedBy.Id = reader.GetSafeString(index++);
            transaction.ApprovedBy.FirstName = reader.GetSafeString(index++);
            transaction.ApprovedBy.LastName = reader.GetSafeString(index++);

            int financePartnerId = reader.GetSafeInt32(index++);

            if (financePartnerId > 0)
            {
                transaction.FinancePartner = new Lookup();
                transaction.FinancePartner.Id = financePartnerId;
                transaction.FinancePartner.Name = reader.GetSafeString(index++);
            }
            else
            {
                transaction.FinancePartner = null;
                index++;
            }

            return transaction;
        }

        private readonly Dictionary<string, string> TransactionSortColumns = new(StringComparer.OrdinalIgnoreCase)
        {
            {"Id", "t.Id"},
            {"EntityId", "t.EntityId"},
            {"Amount", "t.Amount"},
            {"TransactionDate", "t.TransactionDate"},
            {"DateCreated", "t.DateCreated"},
            {"CategoryId", "t.CategoryId"},
            {"Subcategory_Name", "tsc.Name" },
            {"StatusId", "t.StatusId"},
            {"PaymentMethod_Name", "pm.Name"},
            {"FinancePartner_Name", "fp.Name"}
        };
    }
}
