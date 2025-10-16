using TourGo.Models;
using TourGo.Models.Domain;
using TourGo.Models.Domain.Finances;
using TourGo.Models.Enums.Transactions;
using TourGo.Models.Requests.Finances;

namespace TourGo.Services.Interfaces
{
    public interface ITransactionService
    {
        int Add(TransactionAddRequest request, string userId, string hotelId, string publicId);
        void UpdateDocumentUrl(string transactionId, string fileKey, string userId);
        string? GetSupportDocumentUrl(string transactionId);
        string GetFileKey(TransactionFileAddRequest model, string hotelId);
        Paged<Transaction>? GetPaginated(string hotelId, int pageIndex, int pageSize, string? sortColumn, string? sortDirection,
            DateOnly? startDate, DateOnly? endDate, string? txnId, string? parentId, string? entityId, string? categoryId, string? statusId, string? referenceNumber,
            string? description, bool? hasDocumentUrl, string? paymentMethodId, string? subcategoryId, string? financePartnerId);
        bool IsValidSortDirection(string? direction);
        bool IsValidSortColumn(string? column);
        int Reverse(string txnId, string userId, string publicId);
        void UpdateDescription(TransactionDescriptionUpdateRequest model);
        List<TransactionVersion>? GetVersionsByTransactionId(string transactionId);
        string? GetVersionSupportDocumentUrl(string transactionId, int versionId);
        void Update(TransactionUpdateRequest model, string userId, string hotelId);
        List<string>? GetAvailablePublicIds(List<string> possibleIds);
    }
}