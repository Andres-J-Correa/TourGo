using System.ComponentModel.DataAnnotations;

namespace TourGo.Models.Attributes
{
    public class ValidEnumAttribute : ValidationAttribute
    {
        private readonly Type _enumType;

        public ValidEnumAttribute(Type enumType)
        {
            _enumType = enumType;
        }

        public override bool IsValid(object value)
        {
            bool result = false;
            if (value != null)
            {
                if (Enum.IsDefined(_enumType, value))
                {
                    result = true;
                }
            }
            return result;
        }
    }
}
