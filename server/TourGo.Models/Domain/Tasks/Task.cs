using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TourGo.Models.Domain.Users;

namespace TourGo.Models.Domain.Tasks
{
    public class Task
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public DateTime DueDate { get; set; }
        public bool RemindersEnabled { get; set; }
        public UserBase AssignedUser { get; set; } = new UserBase();
        public UserBase CreatedBy { get; set; } = new UserBase();
        public UserBase ModifiedBy { get; set; } = new UserBase();
        public DateTime DateCreated { get; set; }
        public DateTime DateModified { get; set; }
    }
}
