namespace TourGo.Services.Interfaces
{
    public interface ITemplateService
    {
        Task<string> RenderTemplate(string templateName, object model);
    }
}