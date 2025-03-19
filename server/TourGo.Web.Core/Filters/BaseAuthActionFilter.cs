using Microsoft.AspNetCore.Mvc.Filters;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TourGo.Models.Enums;

namespace TourGo.Web.Core.Filters
{
    public abstract class BaseAuthActionFilter : System.Attribute, Microsoft.AspNetCore.Mvc.Filters.IAsyncActionFilter
    {

        /// <summary>
        /// The parameter name to look for in the Request that holds the Id of the given entity.
        /// </summary>
        public string EntityIdField { get; set; }

        public EntityTypeEnum EntityTypeId { get; set; }

        public EntityActionTypeEnum Action { get; set; }

        public abstract Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next);


    }
}
