// Shared utility for resolving image URLs from the backend.
// Handles Cloudinary full URLs, partial Cloudinary paths, local /uploads paths, and fallback.

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const CLOUDINARY_BASE = 'https://res.cloudinary.com/';
const CLOUDINARY_HTTP_BASE = 'http://res.cloudinary.com/';
const CLOUDINARY_HOST = 'res.cloudinary.com/';

/**
 * Resolves any image URL from the backend into a fully-qualified URL.
 * Returns null if no valid URL can be constructed (caller should render fallback).
 */
export function resolveImageUrl(raw: string | null | undefined): string | null {
  if (!raw) return null;

  const value = raw.trim();
  if (!value) return null;

  // Fix doubled Cloudinary base URLs like
  // https://res.cloudinary.com/https://res.cloudinary.com/<cloud>/image/upload/...
  if (
    value.startsWith(`${CLOUDINARY_BASE}https://`) ||
    value.startsWith(`${CLOUDINARY_BASE}http://`)
  ) {
    return resolveImageUrl(value.slice(CLOUDINARY_BASE.length));
  }

  // Old Cloudinary URLs may still be stored as http. Upgrade them for production-safe rendering.
  if (value.startsWith(CLOUDINARY_HTTP_BASE)) {
    return `${CLOUDINARY_BASE}${value.slice(CLOUDINARY_HTTP_BASE.length)}`;
  }

  if (value.startsWith(`https://${CLOUDINARY_HOST}`)) {
    return value;
  }

  if (value.startsWith(`http://${CLOUDINARY_HOST}`)) {
    return `https://${value.slice('http://'.length)}`;
  }

  // Already a full non-Cloudinary URL (CDN, API image, etc.)
  if (value.startsWith('http://') || value.startsWith('https://')) {
    return value;
  }

  // Relative path from local uploads.
  if (value.startsWith('/uploads')) {
    return `${API_URL}${value}`;
  }

  // Missing protocol but otherwise already a Cloudinary URL.
  if (value.startsWith(CLOUDINARY_HOST)) {
    return `https://${value}`;
  }

  // Incomplete Cloudinary path like "<cloud>/image/upload/v123/file.jpg".
  if (value.includes('image/upload')) {
    const normalizedPath = value
      .replace(/^\/+/, '')
      .replace(/^https?:\/\/res\.cloudinary\.com\//, '')
      .replace(/^res\.cloudinary\.com\//, '');

    return `${CLOUDINARY_BASE}${normalizedPath}`;
  }

  // Other relative path.
  if (value.startsWith('/')) {
    return `${API_URL}${value}`;
  }

  // Single-word / emoji / unknown - not a valid image URL.
  return null;
}
