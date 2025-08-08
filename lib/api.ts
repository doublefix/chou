const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";

export async function fetcher(path: string, options?: RequestInit) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
    ...options,
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(
      `Request failed: ${res.status} ${res.statusText} - ${errorBody}`
    );
  }

  const contentType = res.headers.get("content-type");
  const data =
    contentType && contentType.includes("application/json")
      ? await res.json()
      : await res.text();

  return {
    data,
    headers: res.headers,
    status: res.status,
  };
}
