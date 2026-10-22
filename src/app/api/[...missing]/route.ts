import { apiError } from "@/lib/api";

// Unknown API paths answer like the real API routes: JSON, not an HTML page.
const notFound = () => apiError(404, "not_found");

export { notFound as GET, notFound as POST, notFound as PUT, notFound as PATCH, notFound as DELETE };
