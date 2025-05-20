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
    }
}