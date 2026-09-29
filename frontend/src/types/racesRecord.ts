import type { SnailName } from '../data/Snails';

export type Bet = {
  snail: SnailName;
  amount: number;
};

export type Race = {
  id: number;
  date: string;
  winner: SnailName;
  bet: Bet | null;
};