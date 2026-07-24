import { useState, useRef, useCallback, useEffect } from 'react';
import type { Character, BattleLog, BattleStatus } from '../../core/models/types';
import { calculateAttack } from '../../core/engine/battleEngine';
import { BATTLE_TICK_MS } from '../../core/constants/battleConstants';
import { v4 as uuidv4 } from 'uuid';

export const useBattleEngine = () => {
  const [status, setStatus] = useState<BattleStatus>('IDLE');
  const [logs, setLogs] = useState<BattleLog[]>([]);
  
  // Ahora manejamos equipos (Arreglos)
  const [playerTeam, setPlayerTeam] = useState<Character[]>([]);
  const [cpuTeam, setCpuTeam] = useState<Character[]>([]);
  
  // Índices para saber quién está activo en la arena
  const [playerActiveIdx, setPlayerActiveIdx] = useState(0);
  const [cpuActiveIdx, setCpuActiveIdx] = useState(0);

  const playerHpRef = useRef<number>(0);
  const cpuHpRef = useRef<number>(0);
  const intervalRef = useRef<number | null>(null);
  const turnRef = useRef<'PLAYER' | 'CPU'>('PLAYER');

  const initBattle = useCallback((pTeam: Character[], cTeam: Character[]) => {
    setPlayerTeam(pTeam);
    setCpuTeam(cTeam);
    setPlayerActiveIdx(0);
    setCpuActiveIdx(0);
    
    playerHpRef.current = pTeam[0].stats.hp;
    cpuHpRef.current = cTeam[0].stats.hp;
    
    setLogs([{
      id: uuidv4(),
      timestamp: new Date().toLocaleTimeString(),
      message: `¡Comienza la batalla 3v3! ${pTeam[0].name} vs ${cTeam[0].name}`,
      isCritical: false
    }]);
    setStatus('READY');
  }, []);

  const battleTick = useCallback(() => {
    // Si algún equipo ya no tiene integrantes, salimos de seguridad
    if (playerActiveIdx >= 3 || cpuActiveIdx >= 3) return;

    const isPlayerTurn = turnRef.current === 'PLAYER';
    
    // Obtenemos los peleadores actuales basados en el índice
    const activePlayer = playerTeam[playerActiveIdx];
    const activeCpu = cpuTeam[cpuActiveIdx];

    const attacker = isPlayerTurn ? activePlayer : activeCpu;
    const defender = isPlayerTurn ? activeCpu : activePlayer;

    const result = calculateAttack(attacker, defender);

    if (isPlayerTurn) {
      cpuHpRef.current = Math.max(0, cpuHpRef.current - result.damage);
    } else {
      playerHpRef.current = Math.max(0, playerHpRef.current - result.damage);
    }

    // Actualizamos la UI mutando solo el Pokémon activo dentro del arreglo
    setPlayerTeam(team => team.map((p, i) => i === playerActiveIdx ? { ...p, stats: { ...p.stats, hp: playerHpRef.current } } : p));
    setCpuTeam(team => team.map((p, i) => i === cpuActiveIdx ? { ...p, stats: { ...p.stats, hp: cpuHpRef.current } } : p));
    setLogs(prev => [...prev, result.log]);

    // SISTEMA DE RELEVOS
    if (playerHpRef.current <= 0) {
      const nextIdx = playerActiveIdx + 1;
      if (nextIdx >= playerTeam.length) { // Se quedó sin equipo
        if (intervalRef.current) clearInterval(intervalRef.current);
        setStatus('FINISHED');
        return;
      } else {
        // Entra el siguiente Pokémon
        setPlayerActiveIdx(nextIdx);
        playerHpRef.current = playerTeam[nextIdx].stats.hp;
        setLogs(prev => [...prev, { id: uuidv4(), timestamp: new Date().toLocaleTimeString(), message: `¡${activePlayer.name} se debilitó! Entra ${playerTeam[nextIdx].name}.`, isCritical: false }]);
      }
    } 
    else if (cpuHpRef.current <= 0) {
      const nextIdx = cpuActiveIdx + 1;
      if (nextIdx >= cpuTeam.length) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setStatus('FINISHED');
        return;
      } else {
        setCpuActiveIdx(nextIdx);
        cpuHpRef.current = cpuTeam[nextIdx].stats.hp;
        setLogs(prev => [...prev, { id: uuidv4(), timestamp: new Date().toLocaleTimeString(), message: `¡${activeCpu.name} se debilitó! La CPU envía a ${cpuTeam[nextIdx].name}.`, isCritical: false }]);
      }
    }

    turnRef.current = isPlayerTurn ? 'CPU' : 'PLAYER';
  }, [playerTeam, cpuTeam, playerActiveIdx, cpuActiveIdx]);

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

  return { status, logs, playerTeam, cpuTeam, playerActiveIdx, cpuActiveIdx, initBattle, startBattle };
};