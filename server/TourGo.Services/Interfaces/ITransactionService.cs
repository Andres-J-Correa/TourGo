using TourGo.Models.Requests.Finances;

namespace TourGo.Services.Interfaces
{
    public interface ITransactionService
    {
        int Add(TransactionAddRequest request, int userId);
    }
}