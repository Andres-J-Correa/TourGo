using TourGo.Models.Responses.Finance;

namespace TourGo.Services.Interfaces.Finances
{
    public interface IFinancialReportService
    {
        List<CategoryPerformanceOverTimeResponse>? GetCategoryPerformanceOverTime(int hotelId, int categoryId, DateOnly startDate, DateOnly endDate, string currencyCode);
        List<CostToRevenueRatioResponse>? GetCostToRevenueRatio(int hotelId, int revenueCategoryId, int expenseCategoryId, DateOnly startDate, DateOnly endDate, string currencyCode);
        List<ExpenseBreakdownResponse>? GetExpenseBreakdown(int hotelId, DateOnly startDate, DateOnly endDate, string currencyCode);
        List<PaymentMethodTotalsResponse>? GetPaymentMethodsTotalsByHotelId(int hotelId, string currencyCode, DateOnly? startDate, DateOnly? endDate);
        ProfitAndLossSummaryResponse? GetProfitAndLossSummary(int hotelId, DateOnly startDate, DateOnly endDate, string currencyCode);
        List<RevenueBreakdownResponse>? GetRevenueBreakdown(int hotelId, DateOnly startDate, DateOnly endDate, string currencyCode);
        List<SubcategoryAnalysisResponse>? GetSubcategoryAnalysis(int hotelId, int categoryId, DateOnly startDate, DateOnly endDate, string currencyCode);
        List<UtilityCostAnalysisResponse>? GetUtilityCostAnalysis(int hotelId, DateOnly startDate, DateOnly endDate, string currencyCode);
        List<RevPAROverTimeResponse>? GetRevPAROverTime(int hotelId, DateOnly startDate, DateOnly endDate);
        List<HotelOccupancyOverTimeResponse>? GetHotelOccupancyOverTime(int hotelId, DateOnly startDate, DateOnly endDate);
        decimal GetRoomOccupancyByDateRange(DateOnly start, DateOnly end, int roomId);
    }
}