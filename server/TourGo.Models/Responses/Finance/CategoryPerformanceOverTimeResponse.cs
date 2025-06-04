namespace TourGo.Models.Responses.Finance
{
    public class CategoryPerformanceOverTimeResponse
    {
        public string Month { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public decimal Total { get; set; }
    }
}