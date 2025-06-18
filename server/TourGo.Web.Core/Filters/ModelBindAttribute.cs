using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TourGo.Models.Interfaces;
using TourGo.Web.Models.Responses;

namespace TourGo.Web.Core.Filters
{
    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, Inherited = true, AllowMultiple = true)]
    public class ModelBindAttribute : System.Attribute, Microsoft.AspNetCore.Mvc.Filters.IAsyncActionFilter
    {

        public Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
        {
            if (context != null && context.ActionArguments != null &&
                 context.ActionArguments.ContainsKey("model") &&
                 (context.ActionArguments["model"] is IModelIdentifier
                 || context.ActionArguments["model"] is IModelIdentifierString))
            {
                SetEntityId(context.ActionArguments, context);
            }

            if (context.Result == null)
            {
                return next();

            }
            else
            {
                return Task.CompletedTask;
            }
        }

        public virtual void SetEntityId(IDictionary<string, object> actionArguments, ActionExecutingContext actionContext)
        {
            int parseId = 0;
            object? oId = null;
            string idField = "id";

            ControllerBase? c = actionContext.Controller as ControllerBase;

            actionContext.RouteData?.Values?.TryGetValue(idField, out oId);

            if (oId != null)
            {
                Int32.TryParse(oId.ToString(), out parseId);

                if (parseId > 0 && actionArguments["model"] is IModelIdentifier modelIdentifier)
                {
                    modelIdentifier.Id = parseId;
                    actionContext.ModelState.Clear();
                    c.TryValidateModel(modelIdentifier);
                }
                else if (oId is string s && !string.IsNullOrEmpty(s) && actionArguments["model"] is IModelIdentifierString stringModelIdentifier)
                {
                    stringModelIdentifier.Id = s;
                    actionContext.ModelState.Clear();
                    c.TryValidateModel(stringModelIdentifier);
                }
                else
                {
                    c.ModelState.AddModelError("Id", "A valid Id is Required");
                }
            } else
            {
                c.ModelState.AddModelError("Id", "An Id is Required");
            }

            if (!c.ModelState.IsValid)
            {
                ErrorResponse err = new ErrorResponse(c.ModelState.Values
                       .SelectMany(e => e.Errors)
                       .Select(e => e.ErrorMessage));

                var result = new BadRequestObjectResult(err);

                result.ContentTypes.Add("application/json");

                actionContext.Result = result;
            }
        }
    }
}
