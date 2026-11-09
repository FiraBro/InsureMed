// utils/resolveUrl.js
export const resolveDocumentUrl = (url) => {
  // If it's already absolute, just return it
  if (url.startsWith("http")) return url;

  // Use your backend base URL
  const BASE_URL =
    import.meta.env.VITE_API_URL?.replace("/api/v1", "") ||
    "http://localhost:3001";

  // Combine base URL with relative path
  return `${BASE_URL}/${url}`;
};
