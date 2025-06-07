using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TourGo.Models.Interfaces
{
    public interface IUserAuthDataV2
    {
        int Id { get; }
        IEnumerable<string> Roles { get; }
        bool IsVerified { get; }
    }
}
