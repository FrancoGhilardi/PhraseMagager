/**
 * Formatea una fecha simple para el subtítulo de la Card.
 * Evita dependencias y lógica pesada: solo muestra fecha y hora local.
 */
export function formatCreatedAt(value: number | string): string {
  const date = typeof value === "number" ? new Date(value) : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString();
}
