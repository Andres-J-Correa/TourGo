namespace TourGo.Models.Domain.Users
{
    public class UserBase : IUserAuthData
    {
        public int Id { get; set; }

        public string? FirstName { get; set; }

        public string? LastName { get; set; }

        public string Email { get; set; } = string.Empty;

        public IEnumerable<string> Roles { get; set; } = new List<string>();
        public bool? IsVerified { get; set; }
    }
}