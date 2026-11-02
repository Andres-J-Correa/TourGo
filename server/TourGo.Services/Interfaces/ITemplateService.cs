namespace TourGo.Services.Interfaces
{
    public interface ITemplateService
    {
        Task<string> RenderTemplate(string templateName, object model);

        Task<string> GetTemplateByName(string templateName);
    }
}