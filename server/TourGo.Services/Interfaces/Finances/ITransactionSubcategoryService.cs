using TourGo.Models.Domain.Finances;
using TourGo.Models.Requests.Finances;

namespace TourGo.Services.Interfaces.Finances
{
    public interface ITransactionSubcategoryService
    {
        int Add(TransactionSubcategoryAddRequest model, string userId, string hotelId);
        void Delete(int id, string userId, string hotelId);
        List<TransactionSubcategoryBase>? GetMinimal(string hotelId);
        List<TransactionSubcategory>? GetAll(string hotelId);
        void Update(TransactionSubcategoryUpdateRequest model, string userId, string hotelId);
    }
}