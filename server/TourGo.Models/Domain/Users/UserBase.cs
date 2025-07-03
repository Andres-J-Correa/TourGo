using TourGo.Models.Interfaces;

namespace TourGo.Models.Domain.Users
{
    public class UserBase : IUserAuthData
    {
        public string Id { get; set; } = string.Empty;

        public string FirstName { get; set; } = string.Empty;

        public string LastName { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;

        public IEnumerable<string> Roles { get; set; } = new List<string>();
        public bool IsVerified { get; set; }
        public string Phone { get; set; } = string.Empty;
    }
}