using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TourGo.Models.Requests.Tasks
{
    public class TaskAddRequest
    {
        [Required]
        [Length(2, 100)]
        public string Title { get; set; } = string.Empty;

        [Length(0, 500)]
        public string? Description { get; set; }

        [Required]
        public DateTime DueDate { get; set; }

        [Required]
        [Length(8, 8)]
        public string AssignedUserId { get; set; } = string.Empty;

        public bool RemindersEnabled { get; set; } = false;
    }
}
