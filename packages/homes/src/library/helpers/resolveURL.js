export default function resolveURL(url) {
  if (!url) return '';
  console.log(url);
  // Check if the URL is already absolute (starts with http or https)
  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  // Otherwise, prepend the admin base URL from environment
  return `${import.meta.env.VITE_APP_ADMIN_URL}${url}`;
}
