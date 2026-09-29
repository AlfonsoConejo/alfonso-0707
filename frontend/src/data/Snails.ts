export const snailNames = [
  'Gary',
  'Marco Polo',
  'José Luis',
  'San Pedro',
  'Anastacio',
  'Inocencio',
] as const;

export type SnailName = typeof snailNames[number];