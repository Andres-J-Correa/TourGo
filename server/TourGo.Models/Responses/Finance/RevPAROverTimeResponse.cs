namespace TourGo.Models.Responses.Finance
{
    public class RevPAROverTimeResponse
    {
        public string MonthLabel { get; set; } = string.Empty;
        public int TotalRooms { get; set; }
        public decimal RevPAR { get; set; }
    }
}