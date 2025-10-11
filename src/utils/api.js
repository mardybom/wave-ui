export async function apiPost(endpoint, data) {
  const username = import.meta.env.VITE_ADMIN_USERNAME
  const password = import.meta.env.VITE_ADMIN_PASSWORD
  const authHeader = 'Basic ' + btoa(`${username}:${password}`)

  const res = await fetch(`${import.meta.env.VITE_API_BASE}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': authHeader
    },
    body: JSON.stringify(data)
  })

  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}
