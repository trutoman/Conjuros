import type { Theme } from '@conjuros/contracts';

const maxNameLength = 60;
const maxLabelLength = 120;
const copySuffix = '-copy';

export function deriveThemeCopyIdentity(
  base: Theme,
  existingNames: string[],
): { name: string; label: string } {
  const taken = new Set(existingNames.map((name) => name.toLowerCase()));
  const stem = base.name.slice(0, maxNameLength - copySuffix.length);
  let candidate = `${stem}${copySuffix}`;
  let counter = 2;
  while (taken.has(candidate.toLowerCase())) {
    const suffix = `${copySuffix}-${counter}`;
    candidate = `${base.name.slice(0, maxNameLength - suffix.length)}${suffix}`;
    counter += 1;
  }
  return {
    name: candidate,
    label: `${base.label} copy`.slice(0, maxLabelLength),
  };
}
