namespace TourGo.Models.Domain.Users
{
    public class UserBase : IUserAuthData
    {
        public int Id { get; set; }

        public string FirstName { get; set; }

        public string LastName { get; set; }

        public string Email { get; set; }

        public IEnumerable<string> Roles { get; set; }
    }
}