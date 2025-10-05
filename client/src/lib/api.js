// /src/lib/api.js
const API_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

/**
 * fetchConsultations - جلب الاستشارات من Strapi مع populate للعلاقة file و stagiaire
 * تُعيد مصفوفة عناصر كل منها: { id, date, note, file, stagiaire }
 */
export async function fetchConsultations(token) {
  const headers = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}/api/consultations?populate=stagiaire,file`, {
    method: "GET",
    headers,
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to fetch consultations: ${res.status} ${text}`);
  }

  const json = await res.json();

  // Normalize response: handle multiple Strapi shapes robustly
  let rawItems = [];
  if (Array.isArray(json)) rawItems = json;
  else if (Array.isArray(json.data)) rawItems = json.data;
  else if (Array.isArray(json.results)) rawItems = json.results;
  else if (Array.isArray(json.items)) rawItems = json.items;

  const items = rawItems.map((it) => {
    // support both shapes: {id, attributes} and flat {id, date,...}
    const payload = it.attributes ? { id: it.id, ...it.attributes } : { id: it.id || it._id || null, ...it };
    // handle stagiaire populate
    let stagiaire = null;
    if (payload.stagiaire) {
      if (payload.stagiaire.data) {
        const s = payload.stagiaire.data;
        stagiaire = s.attributes ? { id: s.id, ...s.attributes } : { id: s.id, ...s };
      } else stagiaire = payload.stagiaire;
    }
    // handle file populate (keep as-is)
    const file = payload.file && payload.file.data ? payload.file.data : payload.file || null;
    return {
      id: payload.id,
      date: payload.date || payload.datetime || payload.createdAt || null,
      note: payload.note || "",
      file,
      stagiaire,
    };
  });

  return items;
}
