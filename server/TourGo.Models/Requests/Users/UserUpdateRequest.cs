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

        [Phone, StringLength(20, MinimumLength = 4)]
        public string? Phone { get; set; }
    }
}