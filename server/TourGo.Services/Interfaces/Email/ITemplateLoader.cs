namespace TourGo.Services.Interfaces.Email
{
    public interface ITemplateLoader
    {
        string LoadTemplate(string templateFileName);
    }
}