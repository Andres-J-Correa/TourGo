using Quartz;
using System.Reflection;
using TourGo.Models.Attributes;
using TourGo.Web.Core.Configs;

namespace TourGo.Web.Api.Extensions
{
    public static class QuartzExtensions
    {
        public static void AddQuartzJobsFromConfig(
            this IServiceCollectionQuartzConfigurator q,
            IConfiguration config,
            Assembly assembly)
        {
            // 1. Bind the JSON section to our list of objects
            var jobConfigs = config.GetSection("QuartzJobs").Get<List<QuartzJobConfig>>();

            if (jobConfigs == null || jobConfigs.Count == 0) return;

            // 2. Get all IJob classes from the assembly once, to search efficiently
            var allJobTypes = assembly.GetTypes()
                .Where(t => typeof(IJob).IsAssignableFrom(t) && !t.IsAbstract && t.IsClass)
                .ToList();

            foreach (var jobConfig in jobConfigs)
            {
                // Skip if disabled in JSON
                if (!jobConfig.Enabled) continue;

                // 3. Find the Type by Name (Case-insensitive search)
                var jobType = allJobTypes.FirstOrDefault(t =>
                    t.Name.Equals(jobConfig.Name, StringComparison.InvariantCultureIgnoreCase));

                if (jobType == null)
                {
                    // Log warning or throw error if the JSON names a job that doesn't exist in code
                    throw new Exception($"Quartz Config Error: Could not find job class '{jobConfig.Name}' in assembly {assembly.FullName}");
                }

                // 4. Register Job and Trigger
                var jobKey = new JobKey(jobConfig.Name, jobConfig.Group);

                q.AddJob(jobType, jobKey, opts => opts.WithIdentity(jobKey));

                q.AddTrigger(opts => opts
                    .ForJob(jobKey)
                    .WithIdentity(jobConfig.Name + "-trigger", jobConfig.Group)
                    .WithCronSchedule(jobConfig.Cron));
            }
        }
    }
}
