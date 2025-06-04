using TourGo.Models.Responses.Finance;

namespace TourGo.Services.Interfaces.Finances
{
    public interface IFinancialReportService
    {
        List<CategoryPerformanceOverTimeResponse>? GetCategoryPerformanceOverTime(int hotelId, int categoryId, DateOnly startDate, DateOnly endDate, string currencyCode);
        List<CostToRevenueRatioResponse>? GetCostToRevenueRatio(int hotelId, int revenueCategoryId, int expenseCategoryId, DateOnly startDate, DateOnly endDate, string currencyCode);
        List<ExpenseBreakdownResponse>? GetExpenseBreakdown(int hotelId, DateOnly startDate, DateOnly endDate, string currencyCode);
        List<PaymentMethodTotalsResponse>? GetPaymentMethodsTotalsByHotelId(int hotelId, string currencyCode);
        ProfitAndLossSummaryResponse? GetProfitAndLossSummary(int hotelId, DateOnly startDate, DateOnly endDate, string currencyCode);
        List<RevenueBreakdownResponse>? GetRevenueBreakdown(int hotelId, DateOnly startDate, DateOnly endDate, string currencyCode);
        List<SubcategoryAnalysisResponse>? GetSubcategoryAnalysis(int hotelId, int categoryId, DateOnly startDate, DateOnly endDate, string currencyCode);
        List<UtilityCostAnalysisResponse>? GetUtilityCostAnalysis(int hotelId, DateOnly startDate, DateOnly endDate, string currencyCode);
    }
}