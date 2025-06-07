
namespace TourGo.Models.Domain
{
    /// <summary>
    /// Represents a generic cache entry with an expiration time.
    /// </summary>
    /// <typeparam name="T">The type of the cached item.</typeparam>
    public class CacheEntry<T>
    {
        /// <summary>
        /// Gets or sets the expiration time of the cache entry.
        /// </summary>
        public DateTime ExpirationTime { get; set; }

        /// <summary>
        /// Gets or sets the cached item.
        /// </summary>
        public T Item { get; set; }

        public CacheEntry() { }

        public CacheEntry(T item, DateTime expirationTime)
        {
            Item = item;
            ExpirationTime = expirationTime;
        }
    }
}
