export const compressImage = (
  file,
  targetSize = 100 * 1024, // 100 KB
  {
    initialQuality = 0.7,
    minQuality = 0.3,
    step = 0.05,
    maxWidth = 700,
    outputFormat = "image/webp",
    maxIterations = 10,
    onProgress = null, // Optional callback(progressPercent)
  } = {}
) => {
  return new Promise((resolve, reject) => {
    if (!(file instanceof File)) {
      return reject(new Error("Input must be a valid file."));
    }

    if (file.size <= targetSize) {
      return resolve(file); // Already small enough
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;

      img.onload = async () => {
        try {
          let width = img.width;
          let height = img.height;

          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          const compress = (quality) =>
            new Promise((resolve) =>
              canvas.toBlob((blob) => resolve(blob), outputFormat, quality)
            );

          // Main compression loop
          let quality = initialQuality;
          let blob = null;
          let iteration = 0;

          while (iteration < maxIterations) {
            if (maxWidth && width > maxWidth) {
              height = Math.floor((maxWidth / width) * height);
              width = maxWidth;
            }

            canvas.width = width;
            canvas.height = height;
            ctx.clearRect(0, 0, width, height);
            ctx.drawImage(img, 0, 0, width, height);

            blob = await compress(quality);

            if (onProgress) {
              const percent = Math.min(
                100,
                Math.round((targetSize / blob.size) * 100)
              );
              onProgress(percent);
            }

            if (blob.size <= targetSize || quality <= minQuality) {
              break;
            }

            quality = Math.max(quality - step, minQuality);
            iteration++;
          }

          // If still too large, attempt downscaling further
          while (
            blob.size > targetSize &&
            width > 100 &&
            iteration < maxIterations
          ) {
            width = Math.floor(width * 0.9);
            height = Math.floor(height * 0.9);
            canvas.width = width;
            canvas.height = height;
            ctx.clearRect(0, 0, width, height);
            ctx.drawImage(img, 0, 0, width, height);

            blob = await compress(quality);
            iteration++;
          }

          // Fallback if compression failed
          if (!blob || blob.size > file.size) {
            return resolve(file);
          }

          const compressedFile = new File([blob], file.name, {
            type: blob.type,
            lastModified: Date.now(),
          });

          resolve(compressedFile);
        } catch (err) {
          reject(err);
        }
      };

      img.onerror = () => reject(new Error("Failed to load image."));
    };

    reader.onerror = () => reject(new Error("Failed to read file."));
  });
};
