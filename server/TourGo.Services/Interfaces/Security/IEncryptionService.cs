namespace TourGo.Services.Interfaces.Security
{
    public interface IEncryptionService
    {
        string DecryptString(string cipherText, string key);
        string EncryptString(string plainText, string key);
    }
}