using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TourGo.Models.Interfaces;

namespace TourGo.Models.Requests.Hotels
{
    public class RoomAddRequest : IModelIdentifier
    {
        public int Id { get; set; } // this is the hotel id
        [Required, StringLength(100)]
		public string Name { get; set; }
        [Required, Range(1, 50)]
        public int Capacity { get; set; }
        [Required, StringLength(100)]
        public string Description { get; set; }
    }
}
