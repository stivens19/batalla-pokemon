export type BattleStatus = 'IDLE' | 'FETCHING' | 'READY' | 'BATTLING' | 'FINISHED';

export interface Character {
  id: string | number;
  name: string;
  imageUrl: string;
  stats: {
    hp: number;
    maxHp: number;
    attack: number;
    defense: number;
    speed: number;
  };
}

export interface BattleLog {
  id: string;
  timestamp: string;
  message: string;
  isCritical: boolean;
}