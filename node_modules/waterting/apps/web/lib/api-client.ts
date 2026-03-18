const getBase = () => {
  const url = process.env.NEXT_PUBLIC_API_URL;
  if (!url && typeof window !== 'undefined') {
    console.error('[Waterting] NEXT_PUBLIC_API_URL not set');
  }
  return url?.replace(/\/$/, '') ?? '';
};

export const getToken = () =>
  typeof window !== 'undefined' ? localStorage.getItem('waterting_token') : null;

export const setToken = (t: string) => localStorage.setItem('waterting_token', t);
export const clearToken = () => {
  localStorage.removeItem('waterting_token');
  localStorage.removeItem('waterting_user');
};

async function request<T>(method: string, path: string, body?: unknown, auth = true): Promise<T> {
  const url = `${getBase()}${path}`;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = getToken();
    if (!token) { window.location.href = '/login'; throw new Error('No token'); }
    headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (res.status === 401) { clearToken(); window.location.href = '/login'; throw new Error('Unauthorized'); }
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message ?? `Error ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  get:    <T>(p: string) => request<T>('GET', p),
  post:   <T>(p: string, b: unknown) => request<T>('POST', p, b),
  patch:  <T>(p: string, b: unknown) => request<T>('PATCH', p, b),
  put:    <T>(p: string, b: unknown) => request<T>('PUT', p, b),
  delete: <T>(p: string) => request<T>('DELETE', p),
  publicPost: <T>(p: string, b: unknown) => request<T>('POST', p, b, false),
};
