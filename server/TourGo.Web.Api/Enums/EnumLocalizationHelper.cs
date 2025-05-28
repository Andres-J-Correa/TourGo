using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;

namespace TourGo.Models.Enums
{
    public class EnumLocalizationHelper
    {
        public static string GetLocalizedEnumDisplayName(Enum enumValue)
        {
            var memberInfo = enumValue.GetType().GetMember(enumValue.ToString());
            if (memberInfo.Length > 0)
            {
                var attr = memberInfo[0].GetCustomAttribute<DisplayAttribute>();
                if (attr != null)
                {
                    return attr.GetName();
                }
            }
            return enumValue.ToString();
        }

    }
}
