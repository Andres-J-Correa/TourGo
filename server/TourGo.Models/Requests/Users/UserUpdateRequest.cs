using System.ComponentModel.DataAnnotations;
using TourGo.Models.Interfaces;

namespace TourGo.Models.Requests.Users
{
    public class UserUpdateRequest
    {

        [Required, StringLength(50, MinimumLength = 2)]
        public string FirstName { get; set; }

        [Required, StringLength(50, MinimumLength = 2)]
        public string LastName { get; set; }

        [Phone]
        public string? Phone { get; set; }
    }
}