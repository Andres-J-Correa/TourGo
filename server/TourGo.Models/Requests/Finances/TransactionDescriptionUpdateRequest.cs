using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TourGo.Models.Interfaces;

namespace TourGo.Models.Requests.Finances
{
    public class TransactionDescriptionUpdateRequest : IModelIdentifierString
    {
        public string Id { get; set; } = string.Empty;

        [StringLength(500, MinimumLength = 2)]
        public string? Description { get; set; } = string.Empty;
    }
}
