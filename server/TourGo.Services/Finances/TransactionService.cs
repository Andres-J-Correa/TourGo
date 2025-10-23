using MySql.Data.MySqlClient;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TourGo.Data;
using TourGo.Data.Extensions;
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

        public int Add(TransactionAddRequest request, string userId, string hotelId, string publicId)
        {
            string proc = "transactions_insert_v7";
            int newId = 0;

            _dataProvider.ExecuteNonQuery(proc, (col) =>
            {
                col.AddWithNullableString("p_entityId", request.EntityId);
                col.AddWithNullableString("p_invoiceId", request.InvoiceId);
                col.AddWithValue("p_amount", request.Amount);
                col.AddWithValue("p_transactionDate", request.TransactionDate.ToString("yyyy-MM-dd"));
                col.AddWithValue("p_paymentMethodId", request.PaymentMethodId);
                col.AddWithValue("p_categoryId", request.CategoryId);
                col.AddWithValue("p_subcategoryId", request.SubcategoryId);
                col.AddWithNullableString("p_referenceNumber", request.ReferenceNumber);
                col.AddWithValue("p_statusId", request.StatusId);
                col.AddWithValue("p_description", request.Description);
                col.AddWithValue("p_currencyCode", request.CurrencyCode);
                col.AddWithNullableInt("p_financePartnerId", request.FinancePartnerId);
                col.AddWithValue("p_createdBy", userId);
                col.AddWithValue("p_approvedBy", userId);
                col.AddWithValue("p_hotelId", hotelId);
                col.AddWithValue("p_publicId", publicId);

                MySqlParameter resultOut = new MySqlParameter("p_newId", MySqlDbType.Int32);
                resultOut.Direction = ParameterDirection.Output;
                col.Add(resultOut);

            }, (returnCol =>
            {
                object newIdObj = returnCol["p_newId"].Value;

                if(newIdObj != null && int.TryParse(newIdObj.ToString(), out int parsedId)){
                    newId = parsedId;
                }

            }));

            return newId;
        }

        public int Reverse(string txnId, string userId, string publicId)
        {
            string proc = "transactions_reverse_v5";
            int newId = 0;

            _dataProvider.ExecuteNonQuery(proc, (col) =>
            {
                col.AddWithValue("p_txnId", txnId);
                col.AddWithValue("p_reversedBy", userId);
                col.AddWithValue("p_publicId", publicId);

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
        public Paged<Transaction>? GetPaginated(string hotelId, int pageIndex, int pageSize, string? sortColumn, string? sortDirection,
            DateOnly? startDate, DateOnly? endDate, string? txnId, string? parentId, string? entityId, string? categoryId, string? statusId, string? referenceNumber, 
            string? description, bool? hasDocumentUrl, string? paymentMethodId, string? subcategoryId, string? financePartnerId)
        {
            string proc = "transactions_select_paginated_v8";
            Paged<Transaction>? paged = null;
            List<Transaction>? transactions = null;
            int totalCount = 0;

            string mappedColumn = !string.IsNullOrEmpty(sortColumn) && TransactionSortColumns.TryGetValue(sortColumn, out var value) ? value : string.Empty;

            _dataProvider.ExecuteCmd(proc, (col) =>
            {
                col.AddWithValue("p_pageIndex", pageIndex);
                col.AddWithValue("p_pageSize", pageSize);
                col.AddWithValue("p_hotelId", hotelId);


                col.AddWithNullableString("p_sortColumn", mappedColumn);
                col.AddWithNullableString("p_sortDirection", sortDirection);
                col.AddWithNullableDateOnly("p_startDate", startDate);
                col.AddWithNullableDateOnly("p_endDate", endDate);

                col.AddWithNullableString("p_id", txnId);
                col.AddWithNullableString("p_parentId", parentId);
                col.AddWithNullableString("p_entityId", entityId);
                col.AddWithNullableString("p_categoryId", categoryId);
                col.AddWithNullableString("p_statusId", statusId);
                col.AddWithNullableString("p_referenceNumber", referenceNumber);
                col.AddWithNullableString("p_description", description);

                col.AddWithNullableObject("p_hasDocumentUrl", hasDocumentUrl);

                col.AddWithNullableString("p_paymentMethodId", paymentMethodId);
                col.AddWithNullableString("p_subcategoryId", subcategoryId);
                col.AddWithNullableString("p_financePartnerId", financePartnerId);
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

        public void UpdateDocumentUrl (string transactionId, string fileKey, string userId)
        {

           string proc = "transactions_update_document_url_by_id_v2";

            _dataProvider.ExecuteNonQuery(proc, (col) =>
            {
                col.AddWithValue("p_id", transactionId);
                col.AddWithValue("p_documentUrl", fileKey);
                col.AddWithValue("p_modifiedBy", userId);
            });
        }

        public string? GetSupportDocumentUrl (string transactionId)
        {
            string proc = "transactions_select_document_url_by_id_v2";
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

        public string? GetVersionSupportDocumentUrl(string transactionId, int versionId)
        {
            string proc = "transactions_versions_select_document_url_by_id_v2";
            string? fileKey = null;

            _dataProvider.ExecuteCmd(proc, (col) =>
            {
                col.AddWithValue("p_txnId", transactionId);
                col.AddWithValue("p_versionId", versionId);
            }, (reader, returnCol) =>
            {
                int index = 0;

                fileKey = reader.GetSafeString(index++);
            });

            return fileKey;
        }

        public void UpdateDescription(TransactionDescriptionUpdateRequest model)
        {
            string proc = "transactions_update_description_v2";

            _dataProvider.ExecuteNonQuery(proc, (col) =>
            {
                col.AddWithValue("p_txnId", model.Id);
                col.AddWithValue("p_description", model.Description);
            });
        }

        public List<TransactionVersion>? GetVersionsByTransactionId(string transactionId)
        {
            string proc = "transactions_versions_select_by_transaction_id_v2";
            List<TransactionVersion>? transactions = null;
            _dataProvider.ExecuteCmd(proc, (col) =>
            {
                col.AddWithValue("p_id", transactionId);
            }, (reader, returnCol) =>
            {
                int index = 0;
                TransactionVersion transaction = MapTransactionVersion(reader, ref index);
                transaction.ParentId = transactionId;

                transactions ??= new List<TransactionVersion>();
                transactions.Add(transaction);
            });
            return transactions;
        }
   
        public void Update(TransactionUpdateRequest model, string userId, string hotelId)
        {
            string proc = "transactions_update_v2";

            _dataProvider.ExecuteNonQuery(proc, (col) =>
            {
                col.AddWithValue("p_transactionDate", model.TransactionDate.ToString("yyyy-MM-dd"));
                col.AddWithValue("p_paymentMethodId", model.PaymentMethodId);
                col.AddWithValue("p_categoryId", model.CategoryId);
                col.AddWithValue("p_subcategoryId", model.SubcategoryId);
                col.AddWithNullableString("p_referenceNumber", model.ReferenceNumber);
                col.AddWithNullableString("p_description", model.Description);
                col.AddWithValue("p_currencyCode", model.CurrencyCode);
                col.AddWithNullableInt("p_financerPartnerId", model.FinancePartnerId);
                col.AddWithValue("p_hotelId", hotelId);
                col.AddWithValue("p_modifiedBy", userId);
                col.AddWithValue("p_txnId", model.Id);
            });
        }

        public List<string>? GetAvailablePublicIds(List<string> possibleIds)
        {
            string proc = "transactions_select_available_public_ids";
            List<string>? availableIds = null;

            _dataProvider.ExecuteCmd(proc, (coll) =>
            {
                coll.AddWithValue("p_jsonData", JsonConvert.SerializeObject(possibleIds));
            }, (reader, set) =>
            {
                int index = 0;
                string availableId = reader.GetSafeString(index++);
                availableIds ??= new List<string>();
                availableIds.Add(availableId);
            });

            return availableIds;
        }
        public string GetFileKey(TransactionFileAddRequest model, string hotelId)
        {
            string folder = GetFolderName(model.Amount);
            string fileExtension = Path.GetExtension(model.File.FileName).ToLower();
            string date = DateTime.UtcNow.ToString("yyyy-MM-dd_HH-mm-ss-fff");
            string fileKey = $"hotels/{hotelId}/{folder}/transaction-{model.Id}-{date}{fileExtension}";
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

            transaction.Id = reader.GetSafeString(index++);
            transaction.ParentId = reader.GetSafeString(index++);
            transaction.EntityId = reader.GetSafeString(index++);
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
            transaction.ModifiedBy.Id = reader.GetSafeString(index++);
            transaction.ModifiedBy.FirstName = reader.GetSafeString(index++);
            transaction.ModifiedBy.LastName = reader.GetSafeString(index++);
            transaction.DateModified = reader.GetSafeDateTime(index++);

            return transaction;
        }

        private static TransactionVersion MapTransactionVersion(IDataReader reader, ref int index)
        {
            TransactionVersion transaction = new TransactionVersion();
            transaction.Id = reader.GetSafeInt32(index++);
            transaction.Amount = reader.GetSafeDecimal(index++);
            transaction.TransactionDate = reader.GetSafeDateTime(index++);
            transaction.PaymentMethod.Name = reader.GetSafeString(index++);
            transaction.CategoryId = reader.GetSafeInt32(index++);
            string subcategoryName = reader.GetSafeString(index++);
            if (!string.IsNullOrEmpty(subcategoryName))
            {
                transaction.Subcategory = new Lookup
                {
                    Name = subcategoryName
                };
            }
            transaction.ReferenceNumber = reader.GetSafeString(index++);
            transaction.StatusId = reader.GetSafeInt32(index++);
            transaction.HasDocumentUrl = reader.GetSafeBool(index++);
            transaction.Description = reader.GetSafeString(index++);
            transaction.CurrencyCode = reader.GetSafeString(index++);
            string financePartnerName = reader.GetSafeString(index++);
            if (!string.IsNullOrEmpty(financePartnerName))
            {
                transaction.FinancePartner = new Lookup
                {
                    Name = financePartnerName
                };
            }
            transaction.CreatedBy.Id = reader.GetSafeString(index++);
            transaction.CreatedBy.FirstName = reader.GetSafeString(index++);
            transaction.CreatedBy.LastName = reader.GetSafeString(index++);
            transaction.ApprovedBy.Id = reader.GetSafeString(index++);
            transaction.ApprovedBy.FirstName = reader.GetSafeString(index++);
            transaction.ApprovedBy.LastName = reader.GetSafeString(index++);
            transaction.ModifiedBy.Id = reader.GetSafeString(index++);
            transaction.ModifiedBy.FirstName = reader.GetSafeString(index++);
            transaction.ModifiedBy.LastName = reader.GetSafeString(index++);
            transaction.DateModified = reader.GetSafeDateTime(index++);
            transaction.DateCreated = reader.GetSafeDateTime(index++);
            transaction.DocumentUrlChanged = reader.GetSafeBool(index++);
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
