export async function getThemes(offset, limit) {
  return fetch(`/api/themes?offset=${offset}&limit=${limit}`).then((r) => r.json());
}

export async function previewTheme(id) {
  return fetch(`/api/themes/${id}/preview`).then((r) => r.text());
}

export async function selectTheme(id, storeId) {
  return fetch(`/api/store/${storeId}/theme`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ themeId: id }),
  });
}
