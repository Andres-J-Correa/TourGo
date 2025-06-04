namespace TourGo.Models.Responses.Finance
{
    public class ProfitAndLossSummaryResponse
    {
        public decimal TotalRevenue { get; set; }
        public decimal TotalExpenses { get; set; }
        public decimal NetProfit { get; set; }
    }
}