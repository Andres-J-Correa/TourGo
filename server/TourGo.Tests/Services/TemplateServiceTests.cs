using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.IO;
using Scriban;
using TourGo.Services.Templates;
using Xunit;

namespace TourGo.Tests.Services
{
    public class TemplateServiceTests
    {
        [Fact]
        public async Task GetTemplateByName_ValidTemplate_ReturnsTemplateContent()
        {
            // Arrange
            var templateName = "invoice-template";
            var templatePath = Path.Combine("Templates", $"{templateName}.html");
            var expectedContent = await File.ReadAllTextAsync(templatePath);
            var service = new TemplateService();

            // Act
            var result = await service.GetTemplateByName(templateName);

            // Assert
            Assert.Equal(expectedContent, result);
        }

        [Fact]
        public async Task RenderTemplate_ValidTemplate_RendersWithModel()
        {
            // Arrange
            var templateName = "test-template";
            var templateContent = "Hello {{ model.name }}!";
            var model = new { name = "World" };

            // Mock GetTemplateByName to return templateContent
            var service = new TestableTemplateService(templateContent);

            // Act
            var result = await service.RenderTemplate(templateName, model);

            // Assert
            Assert.Equal("Hello World!", result);
        }

        [Fact]
        public async Task RenderTemplate_TemplateHasErrors_ThrowsInvalidOperationException()
        {
            // Arrange
            var templateName = "broken-template";
            var invalidTemplateContent = "{{ model.name } "; // Missing closing braces
            var model = new { name = "World" };

            var service = new TestableTemplateService(invalidTemplateContent);

            // Act & Assert
            var ex = await Assert.ThrowsAsync<InvalidOperationException>(() =>
                service.RenderTemplate(templateName, model));
            Assert.Contains("Scriban template error", ex.Message);
        }

        [Fact]
        public async Task RenderTemplate_NullModel_RendersWithNull()
        {
            // Arrange
            var templateName = "null-model-template";
            var templateContent = "{{ model == null }}";
            object model = null;

            var service = new TestableTemplateService(templateContent);

            // Act
            string result = await service.RenderTemplate(templateName, model);

            // Assert
            Assert.Equal("true", result);
        }

        // Helper class to override GetTemplateByName for isolation
        private class TestableTemplateService : TemplateService
        {
            private readonly string _templateContent;

            public TestableTemplateService(string templateContent)
            {
                _templateContent = templateContent;
            }

            public override Task<string> GetTemplateByName(string templateName)
            {
                return Task.FromResult(_templateContent);
            }
        }
    }
}
