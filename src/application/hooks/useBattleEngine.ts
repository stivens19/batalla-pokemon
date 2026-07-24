import { useState, useRef, useCallback, useEffect } from 'react';
import type { Character, BattleLog, BattleStatus } from '../../core/models/types'; 
import { calculateAttack } from '../../core/engine/battleEngine'; 
import { BATTLE_TICK_MS } from '../../core/constants/battleConstants'; 

export const useBattleEngine = () => {

  const [status, setStatus] = useState<BattleStatus>('IDLE');
  const [logs, setLogs] = useState<BattleLog[]>([]);
  const [player, setPlayer] = useState<Character | null>(null);
  const [cpu, setCpu] = useState<Character | null>(null);

  // Refs: La "fuente de la verdad" para el motor asíncrono.
  // Usamos useRef para evitar "stale closures" dentro del setInterval sin causar re-renders innecesarios.
  const playerHpRef = useRef<number>(0);
  const cpuHpRef = useRef<number>(0);
  const intervalRef = useRef<number | null>(null);
  const turnRef = useRef<'PLAYER' | 'CPU'>('PLAYER');

  // Inicializa la batalla cargando los personajes
  const initBattle = useCallback((playerChar: Character, cpuChar: Character) => { 
    setPlayer(playerChar);
    setCpu(cpuChar);
    
    // Seteamos la vida inicial en las referencias
    playerHpRef.current = playerChar.stats.hp;
    cpuHpRef.current = cpuChar.stats.hp;
    
    setLogs([]);
    setStatus('READY'); 
  }, []);

  // Función interna que se ejecuta cada tick (1500ms)
  const battleTick = useCallback(() => {
    if (!player || !cpu) return;

    const isPlayerTurn = turnRef.current === 'PLAYER';
    const attacker = isPlayerTurn ? player : cpu;
    const defender = isPlayerTurn ? cpu : player;

    // 1. Ejecutamos nuestra regla de negocio pura
    const result = calculateAttack(attacker, defender); 

    // 2. Actualizamos la vida en la referencia de memoria
    if (isPlayerTurn) {
      cpuHpRef.current = Math.max(0, cpuHpRef.current - result.damage); 
    } else {
      playerHpRef.current = Math.max(0, playerHpRef.current - result.damage); 
    }

    // 3. Sincronizamos el estado de React para que la interfaz se repinte
    setPlayer(prev => prev ? { ...prev, stats: { ...prev.stats, hp: playerHpRef.current } } : null);
    setCpu(prev => prev ? { ...prev, stats: { ...prev.stats, hp: cpuHpRef.current } } : null);
    setLogs(prevLogs => [...prevLogs, result.log]);

    // 4. Comprobamos condiciones de victoria
    if (playerHpRef.current <= 0 || cpuHpRef.current <= 0) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setStatus('FINISHED'); 
      return;
    }

    // 5. Alternamos el turno para el siguiente tick
    turnRef.current = isPlayerTurn ? 'CPU' : 'PLAYER';
  }, [player, cpu]);

  // Arranca el motor automático
  const startBattle = useCallback(() => {
    if (status !== 'READY') return; 
    setStatus('BATTLING'); 
    turnRef.current = 'PLAYER'; // El jugador siempre ataca primero por simplicidad

    intervalRef.current = window.setInterval(() => {
      battleTick();
    }, BATTLE_TICK_MS); 
  }, [status, battleTick]);

  // Cleanup function para destruir el intervalo si el componente se desmonta inesperadamente
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return {
    status,
    logs,
    player,
    cpu,
    initBattle,
    startBattle
  };
};