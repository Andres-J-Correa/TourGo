namespace TourGo.Models.Responses.Finance
{
    public class CostToRevenueRatioResponse
    {
        public string RevenueCategory { get; set; } = string.Empty;
        public string ExpenseCategory { get; set; } = string.Empty;
        public decimal CostToRevenueRatio { get; set; }
    }
}