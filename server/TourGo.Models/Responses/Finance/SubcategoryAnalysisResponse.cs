namespace TourGo.Models.Responses.Finance
{
    public class SubcategoryAnalysisResponse
    {
        public string Subcategory { get; set; } = string.Empty;
        public decimal Total { get; set; }
        public bool IsActive { get; set; }
    }
}