export const generateSlug = (title = '') =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') // Replace spaces & symbols with hyphens
    .replace(/^-+|-+$/g, ''); // Trim hyphens from start/end
