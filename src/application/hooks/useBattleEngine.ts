import { useState, useRef, useCallback, useEffect } from 'react';
import type { Character, BattleLog, BattleStatus } from '../../core/models/types';
import { calculateAttack } from '../../core/engine/battleEngine';
import { BATTLE_TICK_MS } from '../../core/constants/battleConstants';
import { v4 as uuidv4 } from 'uuid';

export const useBattleEngine = () => {
  const [status, setStatus] = useState<BattleStatus>('IDLE');
  const [logs, setLogs] = useState<BattleLog[]>([]);
  
  const [playerTeam, setPlayerTeam] = useState<Character[]>([]);
  const [cpuTeam, setCpuTeam] = useState<Character[]>([]);
  const [playerActiveIdx, setPlayerActiveIdx] = useState(0);
  const [cpuActiveIdx, setCpuActiveIdx] = useState(0);

  // NUEVO: Referencias en memoria para los índices activos (Evita el Stale Closure)
  const playerActiveIdxRef = useRef<number>(0);
  const cpuActiveIdxRef = useRef<number>(0);

  const playerHpRef = useRef<number>(0);
  const cpuHpRef = useRef<number>(0);
  const intervalRef = useRef<number | null>(null);
  const turnRef = useRef<'PLAYER' | 'CPU'>('PLAYER');

  const initBattle = useCallback((pTeam: Character[], cTeam: Character[]) => {
    setPlayerTeam(pTeam);
    setCpuTeam(cTeam);
    
    // Sincronizamos estados y referencias a 0
    setPlayerActiveIdx(0);
    playerActiveIdxRef.current = 0;
    setCpuActiveIdx(0);
    cpuActiveIdxRef.current = 0;
    
    playerHpRef.current = pTeam[0].stats.hp;
    cpuHpRef.current = cTeam[0].stats.hp;
    
    setLogs([{ id: uuidv4(), timestamp: new Date().toLocaleTimeString(), message: `¡Equipos listos! Selecciona tu Pokémon inicial o presiona Iniciar.`, isCritical: false }]);
    setStatus('READY');
  }, []);

  const battleTick = useCallback(() => {
    // Leemos la verdad absoluta desde los Refs, no desde el estado de React
    const pIdx = playerActiveIdxRef.current;
    const cIdx = cpuActiveIdxRef.current;

    if (pIdx >= 3 || cIdx >= 3) return;

    const isPlayerTurn = turnRef.current === 'PLAYER';
    
    // Usamos los índices exactos para obtener a los peleadores
    const activePlayer = playerTeam[pIdx];
    const activeCpu = cpuTeam[cIdx];
    
    const attacker = isPlayerTurn ? activePlayer : activeCpu;
    const defender = isPlayerTurn ? activeCpu : activePlayer;

    const result = calculateAttack(attacker, defender);

    if (isPlayerTurn) {
      cpuHpRef.current = Math.max(0, cpuHpRef.current - result.damage);
    } else {
      playerHpRef.current = Math.max(0, playerHpRef.current - result.damage);
    }

    // Actualizamos la UI apuntando al índice real (pIdx / cIdx)
    setPlayerTeam(team => team.map((p, i) => i === pIdx ? { ...p, stats: { ...p.stats, hp: playerHpRef.current } } : p));
    setCpuTeam(team => team.map((p, i) => i === cIdx ? { ...p, stats: { ...p.stats, hp: cpuHpRef.current } } : p));
    setLogs(prev => [...prev, result.log]);

    if (playerHpRef.current <= 0) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      
      const hasAlive = playerTeam.some(p => p.stats.hp > 0);
      if (!hasAlive) {
        setStatus('FINISHED');
      } else {
        setStatus('WAITING_FOR_SWITCH');
        setLogs(prev => [...prev, { id: uuidv4(), timestamp: new Date().toLocaleTimeString(), message: `¡${activePlayer.name} se debilitó! Haz clic en tu reserva para continuar.`, isCritical: false }]);
      }
      return; 
    } 
    else if (cpuHpRef.current <= 0) {
      const nextIdx = cIdx + 1;
      if (nextIdx >= cpuTeam.length) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setStatus('FINISHED');
        return;
      } else {
        setCpuActiveIdx(nextIdx);
        cpuActiveIdxRef.current = nextIdx; // ACTUALIZAMOS EL REF DE LA CPU
        cpuHpRef.current = cpuTeam[nextIdx].stats.hp;
        setLogs(prev => [...prev, { id: uuidv4(), timestamp: new Date().toLocaleTimeString(), message: `¡${activeCpu.name} se debilitó! La CPU envía a ${cpuTeam[nextIdx].name}.`, isCritical: false }]);
      }
    }

    turnRef.current = isPlayerTurn ? 'CPU' : 'PLAYER';
  }, [playerTeam, cpuTeam]);

  const switchPlayerCharacter = useCallback((index: number) => {
    if (playerTeam[index].stats.hp <= 0) return; 
    if (index === playerActiveIdxRef.current) return; // Chequeamos contra el Ref

    setPlayerActiveIdx(index);
    playerActiveIdxRef.current = index; // ACTUALIZAMOS EL REF INMEDIATAMENTE
    playerHpRef.current = playerTeam[index].stats.hp;
    
    setLogs(prev => [...prev, { id: uuidv4(), timestamp: new Date().toLocaleTimeString(), message: `¡Has enviado a ${playerTeam[index].name}!`, isCritical: false }]);

    if (status === 'WAITING_FOR_SWITCH') {
      setStatus('BATTLING');
      turnRef.current = 'CPU'; 
      intervalRef.current = window.setInterval(battleTick, BATTLE_TICK_MS);
    }
  }, [playerTeam, status, battleTick]);

  const startBattle = useCallback(() => {
    if (status !== 'READY') return;
    setStatus('BATTLING');
    turnRef.current = 'PLAYER';
    intervalRef.current = window.setInterval(battleTick, BATTLE_TICK_MS);
  }, [status, battleTick]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return { 
    status, 
    logs, 
    playerTeam, 
    cpuTeam, 
    playerActiveIdx, 
    cpuActiveIdx, 
    initBattle, 
    startBattle, 
    switchPlayerCharacter 
  };
};