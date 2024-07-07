namespace TourGo.Models.Domain
{
    public class UserBase : IUserAuthData
    {
        public int Id { get; set; }

        public string FirstName { get; set; }

        public string LastName { get; set; }

        public IEnumerable<string> Roles { get; set; }
    }
}