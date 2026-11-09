export function formatOrderNumber(id: number | string, orderNumber?: string | null): string {
  const providedNumber = orderNumber?.trim();
  if (providedNumber) {
    return providedNumber.replace(/^TS(?=[-\s\d]|$)/i, 'KSA');
  }

  const digits = String(id).replace(/\D/g, '').slice(-8).padStart(8, '0');
  return `KSA${digits}`;
}
