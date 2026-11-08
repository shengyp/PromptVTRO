// Never restore an identity from a previous document, including browser session restore.
// Revoke the HttpOnly cookie on the server before making the login form available.
export async function startFreshSession(request = fetch) {
 const response = await request('/api/auth/logout', {
  method: 'POST', credentials: 'same-origin', cache: 'no-store',
  headers: { 'Content-Type': 'application/json' }, body: '{}',
 })
 if (!response.ok) throw new Error('无法清除旧登录状态，请稍后重试。')
}
