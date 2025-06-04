namespace TourGo.Models.Responses.Finance
{
    public class UtilityCostAnalysisResponse
    {
        public int SubcategoryId { get; set; }
        public string Subcategory { get; set; } = string.Empty;
        public decimal Total { get; set; }
        public bool IsActive { get; set; }
    }
}