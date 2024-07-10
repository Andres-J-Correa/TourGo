using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TourGo.Services.Interfaces.Email;

namespace TourGo.Services.Email
{
    public class TemplateLoader : ITemplateLoader
    {
        private readonly IWebHostEnvironment _environment;
        private readonly ILogger<TemplateLoader> _logger;

        public TemplateLoader(IWebHostEnvironment environment, ILogger<TemplateLoader> logger)
        {
            _environment = environment;
            _logger = logger;
        }

        public string LoadTemplate(string templateFileName)
        {
            try
            {
                string templatePath = Path.Combine(_environment.WebRootPath, "EmailTemplates", templateFileName);
                if (File.Exists(templatePath))
                {
                    return File.ReadAllText(templatePath);
                }
                else
                {
                    _logger.LogWarning("Email template not found: {TemplatePath}", templatePath);
                    return string.Empty;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to load email template: {TemplateFileName}", templateFileName);
                return string.Empty;
            }
        }
    }
}
