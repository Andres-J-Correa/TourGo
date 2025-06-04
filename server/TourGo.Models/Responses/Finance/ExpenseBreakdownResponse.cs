namespace TourGo.Models.Responses.Finance
{
    public class ExpenseBreakdownResponse
    {
        public string Category { get; set; } = string.Empty;
        public decimal TotalExpenses { get; set; }
    }
}