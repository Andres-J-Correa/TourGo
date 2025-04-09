using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TourGo.Models.Interfaces;

namespace TourGo.Models.Requests.Customers
{
    public class CustomerAddEditRequest: IModelIdentifier
    {
        public int Id { get; set; }

        [Required]
        [StringLength(100)]
		public string FirstName { get; set; }

        [Required]
        [StringLength(100)]
        public string LastName { get; set; }

        [Required]
        [RegularExpression(@"^(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$",
        ErrorMessage = "Invalid phone number format")]
        public string Phone { get; set; }

        [Required]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        [StringLength(100)]
        public string DocumentNumber { get; set; }
    }
}
