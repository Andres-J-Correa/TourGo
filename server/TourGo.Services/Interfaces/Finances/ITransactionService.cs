using TourGo.Models;
using TourGo.Models.Domain;
using TourGo.Models.Domain.Finances;
using TourGo.Models.Enums.Transactions;
using TourGo.Models.Requests.Finances;

namespace TourGo.Services.Interfaces
{
    public interface ITransactionService
    {
        int Add(TransactionAddRequest request, string userId, string hotelId);
        List<Transaction>? GetByEntityId(int entityId);
        void UpdateDocumentUrl(int transactionId, string fileKey, string userId);
        string? GetSupportDocumentUrl(int transactionId);
        string GetFileKey(TransactionFileAddRequest model, string hotelId);
        Paged<Transaction>? GetPaginated(string hotelId, int pageIndex, int pageSize, string? sortColumn, string? sortDirection,
            DateOnly? startDate, DateOnly? endDate, int? txnId, int? parentId, int? entityId, int? categoryId, int? statusId, string? referenceNumber,
            string? description, bool? hasDocumentUrl, int? paymentMethodId, int? subcategoryId, int? financePartnerId);
        bool IsValidSortDirection(string? direction);
        bool IsValidSortColumn(string? column);
        int Reverse(int txnId, string userId);
        void UpdateDescription(TransactionDescriptionUpdateRequest model);
        List<TransactionVersion>? GetVersionsByTransactionId(int transactionId);
        string? GetVersionSupportDocumentUrl(int transactionId, int versionId);
        void Update(TransactionUpdateRequest model, string userId, string hotelId);
    }
}