using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Options;
using System.Security.Claims;
using TourGo.Models.Domain;
using TourGo.Models.Domain.Config;
using TourGo.Models.Domain.Users;
using TourGo.Services.Interfaces.Security;
using TourGo.Services.Interfaces.Users;

public class ClaimsEnrichmentTransformation : IClaimsTransformation
{
    private readonly IUserService _userService;
    private readonly IMemoryCache _cache;
    private readonly IEncryptionService _encryptionService;
    private readonly EncryptionConfig _encryptionConfig;

    public ClaimsEnrichmentTransformation(
        IUserService userService,
        IMemoryCache cache,
        IEncryptionService encryptionService,
        IOptions<EncryptionConfig> encryptionConfigOptions)
    {
        _userService = userService;
        _cache = cache;
        _encryptionService = encryptionService;
        _encryptionConfig = encryptionConfigOptions.Value;
    }

    public Task<ClaimsPrincipal> TransformAsync(ClaimsPrincipal principal)
    {
        var identity = principal.Identity as ClaimsIdentity;
        if (identity == null || !identity.IsAuthenticated)
            return Task.FromResult(principal);

        if (!identity.HasClaim(c => c.Type == ClaimTypes.Email))
        {
            var userIdClaim = identity.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim != null && int.TryParse(userIdClaim.Value, out int userId))
            {
                UserBase user = null;
                string cacheKey = GetCacheKey(userId);
                CacheEntry<UserBase>? cachedEntry;

                if (_cache.TryGetValue(cacheKey, out cachedEntry) && cachedEntry != null && cachedEntry.ExpirationTime > DateTime.UtcNow.AddMinutes(5))
                {
                    user = DecryptUserPII(cachedEntry.Item);
                }
                else
                {
                    user = _userService.GetPII(userId);
                    if (user != null)
                    {
                        var encryptedToCache = EncryptUserPII(user);
                        var expiresAt = DateTime.UtcNow.AddMinutes(15);
                        var cacheEntryOptions = new MemoryCacheEntryOptions
                        {
                            AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(60),
                            SlidingExpiration = TimeSpan.FromMinutes(30)
                        };
                        var cacheEntry = new CacheEntry<UserBase>(encryptedToCache, expiresAt);
                        _cache.Set(cacheKey, cacheEntry, cacheEntryOptions);
                    }
                }

                if (user != null)
                {
                    identity.AddClaim(new Claim(ClaimTypes.Name, user.FirstName ?? ""));
                    identity.AddClaim(new Claim(ClaimTypes.Surname, user.LastName ?? ""));
                    identity.AddClaim(new Claim(ClaimTypes.Email, user.Email ?? ""));
                    identity.AddClaim(new Claim(ClaimTypes.MobilePhone, user.Phone ?? ""));
                }
            }
        }

        return Task.FromResult(principal);
    }

    private string GetCacheKey(int userId)
    {
        // Use a hash or substring of the encryption key for versioning
        var keyVersion = _encryptionConfig.UserPIICacheVersion ?? "v1";
        return $"UserPII_{userId}_v{keyVersion}";
    }
    private UserBase EncryptUserPII(UserBase? user)
    {
        if (user == null)
            return new UserBase();

        return new UserBase
        {
            Id = user.Id,
            FirstName = string.IsNullOrEmpty(user.FirstName) ? string.Empty : _encryptionService.EncryptString(user.FirstName, _encryptionConfig.UserPIIKey),
            LastName = string.IsNullOrEmpty(user.LastName) ? string.Empty : _encryptionService.EncryptString(user.LastName, _encryptionConfig.UserPIIKey),
            Email = string.IsNullOrEmpty(user.Email) ? string.Empty : _encryptionService.EncryptString(user.Email, _encryptionConfig.UserPIIKey),
            Phone = string.IsNullOrEmpty(user.Phone) ? string.Empty : _encryptionService.EncryptString(user.Phone, _encryptionConfig.UserPIIKey),
            Roles = user.Roles,
            IsVerified = user.IsVerified
        };
    }

    private UserBase DecryptUserPII(UserBase? encryptedUser)
    {
        if (encryptedUser == null)
            return new UserBase();

        return new UserBase
        {
            Id = encryptedUser.Id,
            FirstName = string.IsNullOrEmpty(encryptedUser.FirstName) ? string.Empty : _encryptionService.DecryptString(encryptedUser.FirstName, _encryptionConfig.UserPIIKey),
            LastName = string.IsNullOrEmpty(encryptedUser.LastName) ? string.Empty : _encryptionService.DecryptString(encryptedUser.LastName, _encryptionConfig.UserPIIKey),
            Email = string.IsNullOrEmpty(encryptedUser.Email) ? string.Empty : _encryptionService.DecryptString(encryptedUser.Email, _encryptionConfig.UserPIIKey),
            Phone = string.IsNullOrEmpty(encryptedUser.Phone) ? string.Empty : _encryptionService.DecryptString(encryptedUser.Phone, _encryptionConfig.UserPIIKey),
            Roles = encryptedUser.Roles,
            IsVerified = encryptedUser.IsVerified
        };
    }
}