using TourGo.Models;
using TourGo.Models.Domain;
using TourGo.Models.Domain.Finances;
using TourGo.Models.Enums.Transactions;
using TourGo.Models.Requests.Finances;

namespace TourGo.Services.Interfaces
{
    public interface ITransactionService
    {
        int Add(TransactionAddRequest request, int userId);
        List<Transaction>? GetByEntityId(int entityId);
        void UpdateDocumentUrl(int transactionId, string fileKey);
        string? GetSupportDocumentUrl(int transactionId);
        string GetFileKey(TransactionFileAddRequest model);
        Paged<Transaction>? GetPaginated(int pageIndex, int pageSize, string? sortColumn, string? sortDirection,
            DateOnly? startDate, DateOnly? endDate, int? id, int? parentId, int? entityId, int? categoryId, int? statusId, string? referenceNumber,
            string? description, bool? hasDocumentUrl, int? paymentMethodId, int? subcategoryId, int? financePartnerId);
        bool IsValidSortDirection(string? direction);
        bool IsValidSortColumn(string? column);
    }
}