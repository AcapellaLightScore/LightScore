import type { PartInfo, Score } from './score';
import { readTheme, type ThemeSnapshot } from './design-system/theme';
import { colorForPart } from './palette';

/**
 * Stored by part ID in piece defaults. Allocate before filtering/removing/reordering voices.
 * The number keeps a voice's colour the same when voices are renamed, reordered or removed
 * (pieces with 9-16 voices); it is not shown -- a voice is known by its name and its colour.
 */
export function assignVoiceNumbers(parts: PartInfo[], stored: Readonly<Record<string, number>> = {}) {
  const numbers = { ...stored };
  let next = Math.max(0, ...Object.values(numbers)) + 1;
  for (const part of parts) {
    numbers[part.id] ??= next++;
    part.voiceNumber = numbers[part.id];
  }
  return numbers;
}
export function voiceColor(part: PartInfo, score: Score, theme: ThemeSnapshot = readTheme()) {
  const index = score.parts.indexOf(part);
  return colorForPart(score.parts.length > 8 && score.parts.length <= 16 ? (part.voiceNumber ?? index + 1) - 1 : index, score.parts.length <= 8 ? score.parts.length : Math.max(score.parts.length, part.voiceNumber ?? 0), theme);
}
