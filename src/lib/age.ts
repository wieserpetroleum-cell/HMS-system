export function ageFromDob(dob?: string): string {
  if (!dob) return "—";
  const d = new Date(dob);
  if (isNaN(d.getTime())) return "—";
  const now = new Date();
  let years = now.getFullYear() - d.getFullYear();
  let months = now.getMonth() - d.getMonth();
  if (now.getDate() < d.getDate()) months -= 1;
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  if (years < 0) return "—";
  return `${years}y ${months}m`;
}

export function generateUid(seedCount: number): string {
  const year = new Date().getFullYear();
  return `MR-${year}-${String(seedCount).padStart(5, "0")}`;
}
