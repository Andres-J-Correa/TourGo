using TourGo.Models.Domain.Finances;
using TourGo.Models.Requests.Finances;

namespace TourGo.Services.Interfaces.Finances
{
    public interface ITransactionSubcategoryService
    {
        int Add(TransactionSubcategoryAddUpdateRequest model, string userId);
        void Delete(int id, string userId);
        List<TransactionSubcategoryBase>? GetMinimal(int hotelId);
        List<TransactionSubcategory>? GetAll(int hotelId);
        void Update(TransactionSubcategoryAddUpdateRequest model, string userId);
    }
}