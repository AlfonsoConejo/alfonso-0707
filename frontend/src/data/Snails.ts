export const snailNames = [
  'Gary',
  'Pedro',
  'José Luis',
  'San Pedro',
  'Anastacio',
  'Inocencio',
] as const;

export type SnailName = typeof snailNames[number];