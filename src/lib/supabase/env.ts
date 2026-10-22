// The URL and publishable key are designed to be public: every request they
// authorize is still filtered by RLS. Secret keys never go through this file
// and must never carry a NEXT_PUBLIC_ prefix.

export function supabaseUrl(): string {
  const value = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!value) throw new Error("NEXT_PUBLIC_SUPABASE_URL is not set. Copy .env.example to .env.local.");
  return value;
}

export function supabasePublishableKey(): string {
  const value = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!value) {
    throw new Error("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is not set. Copy .env.example to .env.local.");
  }
  return value;
}
