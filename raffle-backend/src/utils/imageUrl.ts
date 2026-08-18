/**
 * Utility functions for handling image URLs from Cloudinary
 */

const CLOUDINARY_BASE = 'https://res.cloudinary.com/';
const CLOUDINARY_HTTP_BASE = 'http://res.cloudinary.com/';
const CLOUDINARY_HOST = 'res.cloudinary.com/';

/**
 * Ensure a Cloudinary image URL is complete with protocol and domain
 * @param url - The URL from Cloudinary (might be partial)
 * @returns Complete HTTPS URL
 */
export function ensureCloudinaryUrl(url: string): string {
  if (!url) return '';

  const value = url.trim();
  if (!value) return '';

  if (
    value.startsWith(`${CLOUDINARY_BASE}https://`) ||
    value.startsWith(`${CLOUDINARY_BASE}http://`)
  ) {
    return ensureCloudinaryUrl(value.slice(CLOUDINARY_BASE.length));
  }

  if (value.startsWith(CLOUDINARY_HTTP_BASE)) {
    return `${CLOUDINARY_BASE}${value.slice(CLOUDINARY_HTTP_BASE.length)}`;
  }

  if (value.startsWith(`https://${CLOUDINARY_HOST}`)) return value;
  if (value.startsWith(`http://${CLOUDINARY_HOST}`)) {
    return `https://${value.slice('http://'.length)}`;
  }

  // If it already starts with a different full URL, return as-is.
  if (value.startsWith('https://') || value.startsWith('http://')) return value;

  if (value.startsWith(CLOUDINARY_HOST)) {
    return `https://${value}`;
  }

  // If it looks like a Cloudinary partial URL (contains 'image/upload')
  if (value.includes('image/upload')) {
    const normalizedPath = value
      .replace(/^\/+/, '')
      .replace(/^https?:\/\/res\.cloudinary\.com\//, '')
      .replace(/^res\.cloudinary\.com\//, '');

    return `${CLOUDINARY_BASE}${normalizedPath}`;
  }

  // If it starts with /, it's a local URL.
  if (value.startsWith('/')) return value;

  // Otherwise, assume it might be a partial Cloudinary path.
  if (value.includes('/')) {
    return `${CLOUDINARY_BASE}${value}`;
  }

  return value;
}

/**
 * Format a URL for database storage - ensure it's complete
 * @param url - URL from upload service
 * @returns URL ready for storage
 */
export function formatImageUrlForStorage(url: string): string {
  return ensureCloudinaryUrl(url);
}

/**
 * Get a properly formatted Cloudinary URL for display
 * @param storedUrl - URL stored in database
 * @returns Complete HTTPS URL for display
 */
export function getImageUrlForDisplay(storedUrl: string): string {
  return ensureCloudinaryUrl(storedUrl);
}
