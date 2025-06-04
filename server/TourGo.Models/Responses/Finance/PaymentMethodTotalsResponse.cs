namespace TourGo.Models.Responses.Finance
{
    public class PaymentMethodTotalsResponse
    {
        public string PaymentMethod { get; set; } = string.Empty;
        public decimal Total { get; set; }
        public bool IsActive { get; set; }
    }
}