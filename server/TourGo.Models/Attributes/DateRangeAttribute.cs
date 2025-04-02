using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TourGo.Models.Attributes
{
    public class DateRangeAttribute : ValidationAttribute
    {
        private readonly string _endDatePropertyName;

        public DateRangeAttribute(string endDatePropertyName)
        {
            _endDatePropertyName = endDatePropertyName;
        }

        protected override ValidationResult IsValid(object value, ValidationContext validationContext)
        {
            // Get the StartDate value
            if (value is DateOnly startDate)
            {
                // Get the EndDate property from the object
                var endDateProperty = validationContext.ObjectType.GetProperty(_endDatePropertyName);
                if (endDateProperty == null)
                {
                    return new ValidationResult($"Unknown property: {_endDatePropertyName}");
                }

                // Get the EndDate value
                var endDateValue = endDateProperty.GetValue(validationContext.ObjectInstance);
                if (endDateValue is DateOnly endDate)
                {
                    // Compare the dates
                    if (startDate >= endDate)
                    {
                        return new ValidationResult("Start date must be before the end date.");
                    }
                    return ValidationResult.Success;
                }
            }
            return new ValidationResult("Invalid date format.");
        }
    }
}
