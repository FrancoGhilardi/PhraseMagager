/**
 * Concatenate Tailwind classes safely.
 *
 * Filters falsy values (false | null | undefined | "") and joins the rest with a space.
 * @param classes - List of class tokens (strings or falsy values to ignore).
 * @returns Space-joined class string.
 */
export function cx(
  ...classes: Array<string | false | null | undefined>
): string {
  return classes.filter(Boolean).join(" ");
}

export default cx;
