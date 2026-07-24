import type { BattleLog, Character } from '../models/types';
import { CRITICAL_HIT_CHANCE, CRITICAL_MULTIPLIER } from '../constants/battleConstants';
import { v4 as uuidv4 } from 'uuid';

interface AttackResult {
  damage: number;
  isCritical: boolean;
  log: BattleLog;
}

export const calculateAttack = (attacker: Character, defender: Character): AttackResult => {
  const isCritical = Math.random() < CRITICAL_HIT_CHANCE;
  
  // Fórmula de daño base: (Ataque / Defensa) * 10
  // Math.max(1, ...) asegura que el daño mínimo siempre sea 1, incluso si el defensor tiene mucha defensa
  const baseDamage = Math.max(1, Math.floor((attacker.stats.attack / defender.stats.defense) * 10));
  
  // Aplicamos el multiplicador si es un golpe crítico
  const finalDamage = isCritical ? Math.floor(baseDamage * CRITICAL_MULTIPLIER) : baseDamage;

  // Formateamos la hora del golpe
  const timestamp = new Date().toLocaleTimeString([], { 
    hour12: false, 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit' 
  });

  const log: BattleLog = {
    id: uuidv4(),
    timestamp,
    message: `${attacker.name} ataca a ${defender.name} causando ${finalDamage} de daño.`,
    isCritical
  };

  return { damage: finalDamage, isCritical, log };
};