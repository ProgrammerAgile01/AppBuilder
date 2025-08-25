const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export type ActionUiField = { name: string; label: string; input?: string; placeholder?: string; };
export type ActionUiSchema = { type: "none" | "file" | "form"; method?: "GET" | "POST"; download?: "stream"; title?: string; fields?: ActionUiField[]; accept?: string; };
export type ActionMeta = { key: string; label: string; position: "toolbar" | "row" | "bulk" | "detail"; ui: ActionUiSchema; };

export async function fetchActions(entity: string): Promise<ActionMeta[]> {
  const res = await fetch(`${API_URL}/${entity}/actions`, { cache: "no-store" });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function runAction(entity: string, key: string, payload?: FormData | Record<string, any>, method: "GET" | "POST" = "POST") {
  if (method === "GET") {
    const qs = payload && !(payload instanceof FormData) ? `?${new URLSearchParams(payload as Record<string, string>).toString()}` : "";
    const res = await fetch(`${API_URL}/${entity}/actions/${key}${qs}`, { method: "GET" });
    if (!res.ok) throw new Error(await res.text());
    try { return await res.json(); } catch { return {}; }
  }
  const opts: RequestInit = { method: "POST" };
  if (payload instanceof FormData) opts.body = payload;
  else if (payload) { opts.headers = { "Content-Type": "application/json" }; opts.body = JSON.stringify(payload); }
  const res = await fetch(`${API_URL}/${entity}/actions/${key}`, opts);
  if (!res.ok) throw new Error(await res.text());
  try { return await res.json(); } catch { return {}; }
}
