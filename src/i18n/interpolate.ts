/**
 * Fills `{name}` placeholders in a message.
 *
 * An unknown placeholder is left visible rather than rendering `undefined`,
 * so a missing value fails loudly in review instead of shipping a broken line.
 */
export function interpolate(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    Object.prototype.hasOwnProperty.call(values, name) ? String(values[name]) : match,
  );
}
