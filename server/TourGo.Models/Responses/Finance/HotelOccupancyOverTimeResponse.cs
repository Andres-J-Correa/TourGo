namespace TourGo.Models.Responses.Finance
{
    public class HotelOccupancyOverTimeResponse
    {
        public string MonthLabel { get; set; } = string.Empty;
        public int TotalRooms { get; set; }
        public decimal OccupancyRate { get; set; }
    }
}