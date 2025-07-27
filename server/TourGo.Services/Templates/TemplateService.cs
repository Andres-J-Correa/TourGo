using Scriban;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TourGo.Services.Interfaces;

namespace TourGo.Services.Templates
{
    public class TemplateService : ITemplateService
    {
        public TemplateService() { }

        public async Task<string> RenderTemplate(string templateName, object model)
        {
            try
            {
                string templateContent = await GetTemplateByName(templateName);

                Template template = Template.Parse(templateContent);
                if (template.HasErrors)
                {
                    throw new InvalidOperationException($"Scriban template error: {string.Join(", ", template.Messages.Select(m => m.ToString()))}");
                }

                return template.Render(model);
            }
            catch (Exception)
            {
                string errorFallbackContent = await GetTemplateByName("error-fallback");
                Template errorTemplate = Template.Parse(errorFallbackContent);
                return errorTemplate.Render();
            }
        }

        public virtual async Task<string> GetTemplateByName(string templateName)
        {
            try
            {
                string templatePath = Path.Combine(AppContext.BaseDirectory, "Templates", $"{templateName}.html");
                string templateText = await File.ReadAllTextAsync(templatePath);
                return templateText;
            }
            catch (Exception)
            {
                    throw new FileNotFoundException($"Template {templateName} not found.");
            }
        }
    }
}
