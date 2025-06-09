using System.Security.Cryptography;

namespace TourGo.Services.Security
{
    public static class PublicIdGeneratorService
    {
        public static List<string> GenerateSecureIds(int numberOfIdsToGenerate, int length, string characters)
        {
            var ids = new List<string>(numberOfIdsToGenerate);

            for (int n = 0; n < numberOfIdsToGenerate; n++)
            {
                using var rng = RandomNumberGenerator.Create();
                var bytes = new byte[length];
                rng.GetBytes(bytes);

                var result = new char[length];
                for (int i = 0; i < length; i++)
                {
                    result[i] = characters[bytes[i] % characters.Length];
                }

                ids.Add(new string(result));
            }

            return ids;
        }
    }
}
