using MySql.Data.MySqlClient;
using System;
using TourGo.Data.Providers;
using TourGo.Models.Responses.Finance;
using TourGo.Data;
using TourGo.Services.Interfaces.Finances;

namespace TourGo.Services.Finances
{
    public class FinancialReportService : IFinancialReportService
    {
        private readonly IMySqlDataProvider _mySqlDataProvider;

        public FinancialReportService(IMySqlDataProvider dataProvider)
        {
            _mySqlDataProvider = dataProvider;
        }

        public List<CategoryPerformanceOverTimeResponse>? GetCategoryPerformanceOverTime(int hotelId, int categoryId, DateOnly startDate, DateOnly endDate, string currencyCode)
        {
            string proc = "financial_reports_get_category_performance_over_time";
            List<CategoryPerformanceOverTimeResponse>? list = null;

            _mySqlDataProvider.ExecuteCmd(proc, (param) =>
            {
                param.AddWithValue("p_hotelId", hotelId);
                param.AddWithValue("p_categoryId", categoryId);
                param.AddWithValue("p_startDate", startDate.ToString("yyyy-MM-dd"));
                param.AddWithValue("p_endDate", endDate.ToString("yyyy-MM-dd"));
                param.AddWithValue("p_currencyCode", currencyCode);
            }, (reader, set) =>
            {
                int index = 0;
                var item = new CategoryPerformanceOverTimeResponse
                {
                    Month = reader.GetSafeString(index++),
                    Category = reader.GetSafeString(index++),
                    Total = reader.GetSafeDecimal(index++)
                };
                list ??= new List<CategoryPerformanceOverTimeResponse>();
                list.Add(item);
            });

            return list;
        }

        public List<CostToRevenueRatioResponse>? GetCostToRevenueRatio(int hotelId, int revenueCategoryId, int expenseCategoryId, DateOnly startDate, DateOnly endDate, string currencyCode)
        {
            string proc = "financial_reports_get_cost_to_revenue_ratio";
            List<CostToRevenueRatioResponse>? list = null;

            _mySqlDataProvider.ExecuteCmd(proc, (param) =>
            {
                param.AddWithValue("p_hotelId", hotelId);
                param.AddWithValue("p_revenueCategoryId", revenueCategoryId);
                param.AddWithValue("p_expenseCategoryId", expenseCategoryId);
                param.AddWithValue("p_startDate", startDate.ToString("yyyy-MM-dd"));
                param.AddWithValue("p_endDate", endDate.ToString("yyyy-MM-dd"));
                param.AddWithValue("p_currencyCode", currencyCode);
            }, (reader, set) =>
            {
                int index = 0;
                var item = new CostToRevenueRatioResponse
                {
                    RevenueCategory = reader.GetSafeString(index++),
                    ExpenseCategory = reader.GetSafeString(index++),
                    CostToRevenueRatio = reader.GetSafeDecimal(index++)
                };
                list ??= new List<CostToRevenueRatioResponse>();
                list.Add(item);
            });

            return list;
        }

        public List<ExpenseBreakdownResponse>? GetExpenseBreakdown(int hotelId, DateOnly startDate, DateOnly endDate, string currencyCode)
        {
            string proc = "financial_reports_get_expense_breakdown";
            List<ExpenseBreakdownResponse>? list = null;

            _mySqlDataProvider.ExecuteCmd(proc, (param) =>
            {
                param.AddWithValue("p_hotelId", hotelId);
                param.AddWithValue("p_startDate", startDate.ToString("yyyy-MM-dd"));
                param.AddWithValue("p_endDate", endDate.ToString("yyyy-MM-dd"));
                param.AddWithValue("p_currencyCode", currencyCode);
            }, (reader, set) =>
            {
                int index = 0;
                var item = new ExpenseBreakdownResponse
                {
                    Category = reader.GetSafeString(index++),
                    TotalExpenses = reader.GetSafeDecimal(index++)
                };
                list ??= new List<ExpenseBreakdownResponse>();
                list.Add(item);
            });

            return list;
        }

        public List<PaymentMethodTotalsResponse>? GetPaymentMethodsTotalsByHotelId(int hotelId, string currencyCode)
        {
            string proc = "financial_reports_get_payment_methods_totals_by_hotel_id";
            List<PaymentMethodTotalsResponse>? list = null;

            _mySqlDataProvider.ExecuteCmd(proc, (param) =>
            {
                param.AddWithValue("p_hotelId", hotelId);
                param.AddWithValue("p_currencyCode", currencyCode);
            }, (reader, set) =>
            {
                int index = 0;
                var item = new PaymentMethodTotalsResponse
                {
                    PaymentMethod = reader.GetSafeString(index++),
                    Total = reader.GetSafeDecimal(index++),
                    IsActive = reader.GetSafeBool(index++)
                };
                list ??= new List<PaymentMethodTotalsResponse>();
                list.Add(item);
            });

            return list;
        }

        public ProfitAndLossSummaryResponse? GetProfitAndLossSummary(int hotelId, DateOnly startDate, DateOnly endDate, string currencyCode)
        {
            string proc = "financial_reports_get_profit_and_loss_summary";
            ProfitAndLossSummaryResponse? response = null;

            _mySqlDataProvider.ExecuteCmd(proc, (param) =>
            {
                param.AddWithValue("p_hotelId", hotelId);
                param.AddWithValue("p_startDate", startDate.ToString("yyyy-MM-dd"));
                param.AddWithValue("p_endDate", endDate.ToString("yyyy-MM-dd"));
                param.AddWithValue("p_currencyCode", currencyCode);
            }, (reader, set) =>
            {
                int index = 0;
                response = new ProfitAndLossSummaryResponse
                {
                    TotalRevenue = reader.GetSafeDecimal(index++),
                    TotalExpenses = reader.GetSafeDecimal(index++),
                    NetProfit = reader.GetSafeDecimal(index++)
                };
            });

            return response;
        }

        public List<RevenueBreakdownResponse>? GetRevenueBreakdown(int hotelId, DateOnly startDate, DateOnly endDate, string currencyCode)
        {
            string proc = "financial_reports_get_revenue_breakdown";
            List<RevenueBreakdownResponse>? list = null;

            _mySqlDataProvider.ExecuteCmd(proc, (param) =>
            {
                param.AddWithValue("p_hotelId", hotelId);
                param.AddWithValue("p_startDate", startDate.ToString("yyyy-MM-dd"));
                param.AddWithValue("p_endDate", endDate.ToString("yyyy-MM-dd"));
                param.AddWithValue("p_currencyCode", currencyCode);
            }, (reader, set) =>
            {
                int index = 0;
                var item = new RevenueBreakdownResponse
                {
                    CategoryId = reader.GetSafeInt32(index++),
                    Category = reader.GetSafeString(index++),
                    TotalRevenue = reader.GetSafeDecimal(index++)
                };
                list ??= new List<RevenueBreakdownResponse>();
                list.Add(item);
            });

            return list;
        }

        public List<SubcategoryAnalysisResponse>? GetSubcategoryAnalysis(int hotelId, int categoryId, DateOnly startDate, DateOnly endDate, string currencyCode)
        {
            string proc = "financial_reports_get_subcategory_analysis";
            List<SubcategoryAnalysisResponse>? list = null;

            _mySqlDataProvider.ExecuteCmd(proc, (param) =>
            {
                param.AddWithValue("p_hotelId", hotelId);
                param.AddWithValue("p_categoryId", categoryId);
                param.AddWithValue("p_startDate", startDate.ToString("yyyy-MM-dd"));
                param.AddWithValue("p_endDate", endDate.ToString("yyyy-MM-dd"));
                param.AddWithValue("p_currencyCode", currencyCode);
            }, (reader, set) =>
            {
                int index = 0;
                var item = new SubcategoryAnalysisResponse
                {
                    Subcategory = reader.GetSafeString(index++),
                    Total = reader.GetSafeDecimal(index++),
                    IsActive = reader.GetSafeBool(index++)
                };
                list ??= new List<SubcategoryAnalysisResponse>();
                list.Add(item);
            });

            return list;
        }

        public List<UtilityCostAnalysisResponse>? GetUtilityCostAnalysis(int hotelId, DateOnly startDate, DateOnly endDate, string currencyCode)
        {
            string proc = "financial_reports_get_utility_cost_analysis";
            List<UtilityCostAnalysisResponse>? list = null;

            _mySqlDataProvider.ExecuteCmd(proc, (param) =>
            {
                param.AddWithValue("p_hotelId", hotelId);
                param.AddWithValue("p_startDate", startDate.ToString("yyyy-MM-dd"));
                param.AddWithValue("p_endDate", endDate.ToString("yyyy-MM-dd"));
                param.AddWithValue("p_currencyCode", currencyCode);
            }, (reader, set) =>
            {
                int index = 0;
                var item = new UtilityCostAnalysisResponse
                {
                    SubcategoryId = reader.GetSafeInt32(index++),
                    Subcategory = reader.GetSafeString(index++),
                    Total = reader.GetSafeDecimal(index++),
                    IsActive = reader.GetSafeBool(index++)
                };
                list ??= new List<UtilityCostAnalysisResponse>();
                list.Add(item);
            });

            return list;
        }
    }
}
