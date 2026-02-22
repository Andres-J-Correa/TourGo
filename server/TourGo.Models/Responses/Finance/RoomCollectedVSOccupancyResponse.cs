using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TourGo.Models.Responses.Finance
{
    public class RoomCollectedVSOccupancyResponse
    {
        public int RoomId { get; set; }
        public string RoomName { get; set; } = string.Empty;
        public decimal CollectedAmount { get; set; }
        public decimal OccupancyRate { get; set; }
    }
}
