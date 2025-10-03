// src/lib/api.js
const API_BASE = process.env.NEXT_PUBLIC_STRAPI_API_URL || "http://localhost:1337";

function authHeaders(extra = {}) {
  if (typeof window === "undefined") return extra;
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}`, ...extra } : extra;
}

/**
 * Upload a file to Strapi (v5): returns the uploaded file object (data[0])
 * Note: Strapi v5 requires upload first then reference the file id/documentId in the entry creation.
 */
export async function uploadFile(file) {
  const fd = new FormData();
  fd.append("files", file);

  const res = await fetch(`${API_BASE}/api/upload`, {
    method: "POST",
    headers: authHeaders(), // do NOT set Content-Type, browser will set the boundary
    body: fd,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error("Upload failed: " + text);
  }

  const json = await res.json();
  // return first uploaded file info
  if (Array.isArray(json.data) && json.data.length > 0) return json.data[0];
  // fallback
  return json.data || json;
}

/**
 * Get consultations list (populate stagiaire and file)
 * Uses populate=* for simplicity (1 level deep) but you can customize params.
 */
export async function fetchConsultations() {
  const res = await fetch(`${API_BASE}/api/consultations?populate=stagiaire,file`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Failed fetching consultations");
  const json = await res.json();
  return json.data || [];
}

/**
 * Fetch stagiaires minimal list for selects
 */
export async function fetchStagiaires() {
  const res = await fetch(`${API_BASE}/api/stagiaires?fields=first_name,last_name,mle`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Failed fetching stagiaires");
  const json = await res.json();
  return json.data || [];
}

/**
 * Create consultation: payload = { date, note, stagiaireDocumentId OR stagiaire (id), fileDocumentId (optional) }
 */
export async function createConsultation(payload) {
  // Strapi v5 expects body: { data: { /* fields */ } }
  const body = { data: {} };
  if (payload.date) body.data.date = payload.date;
  if (payload.note !== undefined) body.data.note = payload.note;
  // relation to stagiaire: may be documentId string or numeric id
  if (payload.stagiaire) {
    body.data.stagiaire = payload.stagiaire;
  }
  // attach uploaded file (pass its documentId or id depending on your backend)
  if (payload.fileDocumentId) {
    // for single media field, assign the documentId (Strapi may accept id or documentId)
    body.data.file = payload.fileDocumentId;
  }
  const res = await fetch(`${API_BASE}/api/consultations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error("Create consultation failed: " + text);
  }
  return res.json();
}

/**
 * Update consultation by documentId (Strapi v5): idOrDocumentId should be documentId string if your backend needs that.
 * payload same shape as createConsultation
 */
export async function updateConsultation(documentId, payload) {
  const body = { data: {} };
  if (payload.date) body.data.date = payload.date;
  if (payload.note !== undefined) body.data.note = payload.note;
  if (payload.stagiaire) body.data.stagiaire = payload.stagiaire;
  if (payload.fileDocumentId !== undefined) body.data.file = payload.fileDocumentId;

  const res = await fetch(`${API_BASE}/api/consultations/${documentId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error("Update failed: " + text);
  }
  return res.json();
}

/**
 * Delete consultation by documentId
 */
export async function deleteConsultation(documentId) {
  const res = await fetch(`${API_BASE}/api/consultations/${documentId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error("Delete failed: " + text);
  }
  return res.json();
}

/**
 * fetch current user profile (for ProfileView)
 */
export async function fetchCurrentUser() {
  const res = await fetch(`${API_BASE}/api/users/me`, {
    headers: authHeaders(),
  });
  if (!res.ok) return null;
  return res.json();
}
