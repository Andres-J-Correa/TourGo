using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TourGo.Models.Attributes
{
    public class Iso4217CurrencyAttribute : ValidationAttribute
    {
        protected override ValidationResult IsValid(object? value, ValidationContext validationContext)
        {
            var code = value as string;

            if (string.IsNullOrWhiteSpace(code))
            {
                return new ValidationResult("Currency code is required.");
            }

            if (!Iso4217CurrencyProvider.ValidCurrencyCodes.Contains(code))
            {
                return new ValidationResult($"{code} is not a valid or supported ISO 4217 currency code.");
            }

            return ValidationResult.Success!;
        }

        private static class Iso4217CurrencyProvider
        {
            public static readonly HashSet<string> ValidCurrencyCodes = new(StringComparer.OrdinalIgnoreCase)
            {
                "COP", // Colombian Peso
                "USD", // US Dollar
                "EUR", // Euro
                "JPY", // Japanese Yen
                "GBP", // British Pound
                "CNY"  // Chinese Yuan
            };
        }
    }

}
