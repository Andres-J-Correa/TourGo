using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TourGo.Models.Interfaces
{
    /// <summary>
    /// Required for all request models
    /// </summary>
    public interface IModelIdentifier
    {
        int Id { get; set; }
    }
}
