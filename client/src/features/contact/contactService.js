import { apiConfigured, apiRequest } from '../../lib/api.js'

export const contactAvailable = apiConfigured

export async function submitContact(values) {
  return apiRequest('/contact', { method: 'POST', body: values, timeoutMs: 15000 })
}
