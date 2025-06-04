namespace TourGo.Models.Responses.Finance
{
    public class RevenueBreakdownResponse
    {
        public int CategoryId { get; set; }
        public string Category { get; set; } = string.Empty;
        public decimal TotalRevenue { get; set; }
    }
}