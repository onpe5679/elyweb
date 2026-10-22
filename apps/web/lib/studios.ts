// Studio Habom titles are identified from the existing `developer` column (no schema change).
const HOBOM_PATTERN = /하봄|habom|hobom/i;

export function isHobomGame(game: {developer?: string | null}): boolean {
  return HOBOM_PATTERN.test(game.developer ?? '');
}
