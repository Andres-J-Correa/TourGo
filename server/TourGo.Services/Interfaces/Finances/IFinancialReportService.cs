using TourGo.Models.Responses.Finance;

namespace TourGo.Services.Interfaces.Finances
{
    public interface IFinancialReportService
    {
        List<CategoryPerformanceOverTimeResponse>? GetCategoryPerformanceOverTime(string hotelId, int categoryId, DateOnly startDate, DateOnly endDate, string currencyCode);
        List<CostToRevenueRatioResponse>? GetCostToRevenueRatio(string hotelId, int revenueCategoryId, int expenseCategoryId, DateOnly startDate, DateOnly endDate, string currencyCode);
        List<ExpenseBreakdownResponse>? GetExpenseBreakdown(string hotelId, DateOnly startDate, DateOnly endDate, string currencyCode);
        List<PaymentMethodTotalsResponse>? GetPaymentMethodsTotalsByHotelId(string hotelId, string currencyCode, DateOnly? startDate, DateOnly? endDate);
        ProfitAndLossSummaryResponse? GetProfitAndLossSummary(string hotelId, DateOnly startDate, DateOnly endDate, string currencyCode);
        List<RevenueBreakdownResponse>? GetRevenueBreakdown(string hotelId, DateOnly startDate, DateOnly endDate, string currencyCode);
        List<SubcategoryAnalysisResponse>? GetSubcategoryAnalysis(string hotelId, int categoryId, DateOnly startDate, DateOnly endDate, string currencyCode);
        List<UtilityCostAnalysisResponse>? GetUtilityCostAnalysis(string hotelId, DateOnly startDate, DateOnly endDate, string currencyCode);
        List<RevPAROverTimeResponse>? GetRevPAROverTime(string hotelId, DateOnly startDate, DateOnly endDate);
        List<HotelOccupancyOverTimeResponse>? GetHotelOccupancyOverTime(string hotelId, DateOnly startDate, DateOnly endDate);
        decimal GetRoomOccupancyByDateRange(DateOnly start, DateOnly end, int roomId);
    }
}