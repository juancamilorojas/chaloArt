export const WHATSAPP_NUMBER = '573005050014'

export function whatsappUrl(message = '') {
  const baseUrl = `https://wa.me/${WHATSAPP_NUMBER}`
  return message ? `${baseUrl}?text=${encodeURIComponent(message)}` : baseUrl
}
