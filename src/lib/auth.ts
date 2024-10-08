import { browser } from '$app/environment';

export async function getSession() {
  if (browser) {
    const response = await fetch('/api/auth/session');
    if (response.ok) {
      return response.json();
    }
  }
  return null;
}