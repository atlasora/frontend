export default function resolveURL(url) {
  if (!url) return '';
  console.log(url);
  // Check if the URL is already absolute (starts with http or https)
  if (/^https?:\/\//i.test(url)) {
    console.log(url);
    return url;
  }

  // Otherwise, prepend the admin base URL from environment
  //todo if url is blank return the default image set it in an env var
  console.log(url);

  return `${import.meta.env.VITE_APP_ADMIN_URL}${url}`;
}
