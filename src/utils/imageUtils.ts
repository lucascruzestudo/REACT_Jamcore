/**
 * Resolves a path relative to the Vite base URL so assets work on sub-path
 * deployments like GitHub Pages (e.g. /REACT_Jamcore/logo.png).
 */
export function publicUrl(path: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return `${base}${path}`;
}

/**
 * Crops an image file to a centered square and resizes it to `outputSize x outputSize`.
 * Always returns a JPEG file regardless of original format.
 */
export function cropToSquare(file: File, outputSize = 600): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      const size = Math.min(img.naturalWidth, img.naturalHeight);
      const offsetX = (img.naturalWidth - size) / 2;
      const offsetY = (img.naturalHeight - size) / 2;

      const canvas = document.createElement('canvas');
      canvas.width = outputSize;
      canvas.height = outputSize;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      ctx.drawImage(img, offsetX, offsetY, size, size, 0, 0, outputSize, outputSize);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Canvas toBlob failed'));
            return;
          }
          const squaredFile = new File(
            [blob],
            file.name.replace(/\.[^.]+$/, '.jpg'),
            { type: 'image/jpeg' }
          );
          resolve(squaredFile);
        },
        'image/jpeg',
        0.92
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Image failed to load'));
    };

    img.src = objectUrl;
  });
}
