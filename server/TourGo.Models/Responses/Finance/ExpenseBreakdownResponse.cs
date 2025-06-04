namespace TourGo.Models.Responses.Finance
{
    public class ExpenseBreakdownResponse
    {
        public string Category { get; set; } = string.Empty;
        public int CategoryId { get; set; }
        public decimal TotalExpenses { get; set; }
    }
}