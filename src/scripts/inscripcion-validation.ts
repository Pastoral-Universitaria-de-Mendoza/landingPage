/** Pure validation helpers for the MO 2026 registration wizard. */

export const MAX_CERT_FILE_BYTES = 8 * 1024 * 1024;

export function normalizeDni(raw: string): string {
  return String(raw).replace(/\D/g, "");
}

export function isValidDni(raw: string): boolean {
  const digits = normalizeDni(raw);
  return digits.length >= 7 && digits.length <= 9;
}

export function isValidEmail(raw: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw.trim());
}

export function isValidPhone(raw: string): boolean {
  return raw.replace(/\D/g, "").length >= 7;
}

export function getAgeFromDob(dob: string, refDate = new Date()): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dob)) return null;
  const birth = new Date(`${dob}T00:00:00Z`);
  if (Number.isNaN(birth.getTime())) return null;
  let age = refDate.getUTCFullYear() - birth.getUTCFullYear();
  const m = refDate.getUTCMonth() - birth.getUTCMonth();
  if (m < 0 || (m === 0 && refDate.getUTCDate() < birth.getUTCDate())) age--;
  return age;
}
