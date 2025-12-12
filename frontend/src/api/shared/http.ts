export async function postJSON<T>(url: string, body: unknown, timeoutMs = 120000): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    const text = await res.text();
    if (!res.ok) {
      try {
        const err = JSON.parse(text);
        throw new Error(err?.detail || err?.message || `HTTP ${res.status}`);
      } catch {
        throw new Error(text || `HTTP ${res.status}`);
      }
    }
    return text ? (JSON.parse(text) as T) : ({} as T);
  } finally {
    clearTimeout(timer);
  }
}
