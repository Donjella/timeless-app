// src/utils/imageUtils.js

/**
 * Get a fallback image placeholder
 * @returns {string} - Static placeholder image data URI
 */
export const getImagePlaceholder = () => {
  // Simple gray square with "Watch" text
  return 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiB2aWV3Qm94PSIwIDAgMjAwIDIwMCI+PHJlY3QgZmlsbD0iI2YwZjBmMCIgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiLz48dGV4dCBmaWxsPSIjODg4IiBmb250LWZhbWlseT0iQXJpYWwsU2Fucy1zZXJpZiIgZm9udC1zaXplPSIyMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgeD0iMTAwIiB5PSIxMDAiPldhdGNoPC90ZXh0Pjwvc3ZnPg==';
};

/**
 * Validate an image URL (simple check)
 * @param {string} url - The URL to check
 * @returns {boolean} - Whether the URL appears valid
 */
export const validateImageUrl = (url) => {
  return !!url && typeof url === 'string' && url.trim().length > 0;
};

/**
 * Checks if an image URL is accessible
 * @param {string} url - Image URL to check
 * @returns {Promise<boolean>} - Whether the image can be loaded
 */
export const isImageUrlAccessible = async (url) => {
  if (!validateImageUrl(url)) return false;

  try {
    // Create an image element to test loading
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
    });
  } catch (error) {
    console.warn('Image URL check failed:', error);
    return false;
  }
};

/**
 * Normalize an image URL by adding protocol if missing
 * @param {string} url - Original URL
 * @returns {string} - Normalized URL
 */
export const normalizeImageUrl = (url) => {
  if (!url) return '';

  url = url.trim();

  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = `https://${url}`;
  }

  return url;
};
