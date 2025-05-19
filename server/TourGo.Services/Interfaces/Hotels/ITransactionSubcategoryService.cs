using TourGo.Models.Domain.Finances;
using TourGo.Models.Requests.Finances;

namespace TourGo.Services.Interfaces.Hotels
{
    public interface ITransactionSubcategoryService
    {
        int Add(TransactionSubcategoryAddUpdateRequest model, int userId);
        void Delete(int id, int userId);
        List<TransactionSubcategoryBase>? GetMinimal(int hotelId);
        List<TransactionSubcategory>? GetAll(int hotelId);
        void Update(TransactionSubcategoryAddUpdateRequest model, int userId);
    }
}