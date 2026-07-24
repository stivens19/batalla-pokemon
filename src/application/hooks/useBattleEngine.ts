import { useState, useRef, useCallback, useEffect } from 'react';
import type { Character, BattleLog, BattleStatus } from '../../core/models/types';
import { calculateAttack } from '../../core/engine/battleEngine';
import { BATTLE_TICK_MS } from '../../core/constants/battleConstants';
import { v4 as uuidv4 } from 'uuid';

export const useBattleEngine = () => {
  const [status, setStatus] = useState<BattleStatus>('IDLE');
  const [logs, setLogs] = useState<BattleLog[]>([]);
  
  // Equipos y punteros
  const [playerTeam, setPlayerTeam] = useState<Character[]>([]);
  const [cpuTeam, setCpuTeam] = useState<Character[]>([]);
  const [playerActiveIdx, setPlayerActiveIdx] = useState(0);
  const [cpuActiveIdx, setCpuActiveIdx] = useState(0);

  // Referencias para el motor asíncrono
  const playerHpRef = useRef<number>(0);
  const cpuHpRef = useRef<number>(0);
  const intervalRef = useRef<number | null>(null);
  const turnRef = useRef<'PLAYER' | 'CPU'>('PLAYER');

  // 1. Inicializar la batalla
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
      message: `¡Equipos listos! Selecciona tu Pokémon inicial o presiona Iniciar.`, 
      isCritical: false 
    }]);
    setStatus('READY');
  }, []);

  // 2. Lógica principal de cada turno (Debe ir ANTES de switchPlayerCharacter)
  const battleTick = useCallback(() => {
    if (playerActiveIdx >= 3 || cpuActiveIdx >= 3) return;

    const isPlayerTurn = turnRef.current === 'PLAYER';
    const activePlayer = playerTeam[playerActiveIdx];
    const activeCpu = cpuTeam[cpuActiveIdx];
    
    const attacker = isPlayerTurn ? activePlayer : activeCpu;
    const defender = isPlayerTurn ? activeCpu : activePlayer;

    const result = calculateAttack(attacker, defender);

    // Actualizamos las referencias en memoria
    if (isPlayerTurn) {
      cpuHpRef.current = Math.max(0, cpuHpRef.current - result.damage);
    } else {
      playerHpRef.current = Math.max(0, playerHpRef.current - result.damage);
    }

    // Sincronizamos la UI
    setPlayerTeam(team => team.map((p, i) => i === playerActiveIdx ? { ...p, stats: { ...p.stats, hp: playerHpRef.current } } : p));
    setCpuTeam(team => team.map((p, i) => i === cpuActiveIdx ? { ...p, stats: { ...p.stats, hp: cpuHpRef.current } } : p));
    setLogs(prev => [...prev, result.log]);

    // Evaluación de muerte del Jugador
    if (playerHpRef.current <= 0) {
      if (intervalRef.current) clearInterval(intervalRef.current); // Detenemos el motor
      
      const hasAlive = playerTeam.some(p => p.stats.hp > 0);
      if (!hasAlive) {
        setStatus('FINISHED'); // Derrota total
      } else {
        setStatus('WAITING_FOR_SWITCH'); // Pausa interactiva
        setLogs(prev => [...prev, { id: uuidv4(), timestamp: new Date().toLocaleTimeString(), message: `¡${activePlayer.name} se debilitó! Haz clic en tu reserva para continuar.`, isCritical: false }]);
      }
      return; 
    } 
    // Evaluación de muerte de la CPU
    else if (cpuHpRef.current <= 0) {
      const nextIdx = cpuActiveIdx + 1;
      if (nextIdx >= cpuTeam.length) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setStatus('FINISHED'); // Victoria total
        return;
      } else {
        // La CPU hace el cambio automático y la batalla continúa
        setCpuActiveIdx(nextIdx);
        cpuHpRef.current = cpuTeam[nextIdx].stats.hp;
        setLogs(prev => [...prev, { id: uuidv4(), timestamp: new Date().toLocaleTimeString(), message: `¡${activeCpu.name} se debilitó! La CPU envía a ${cpuTeam[nextIdx].name}.`, isCritical: false }]);
      }
    }

    // Alternamos el turno
    turnRef.current = isPlayerTurn ? 'CPU' : 'PLAYER';
  }, [playerTeam, cpuTeam, playerActiveIdx, cpuActiveIdx]);

  // 3. Selección manual de personaje
  const switchPlayerCharacter = useCallback((index: number) => {
    if (playerTeam[index].stats.hp <= 0) return; // Ignora si está muerto
    if (index === playerActiveIdx) return; // Ignora si ya está en la arena

    setPlayerActiveIdx(index);
    playerHpRef.current = playerTeam[index].stats.hp;
    
    setLogs(prev => [...prev, { 
      id: uuidv4(), 
      timestamp: new Date().toLocaleTimeString(), 
      message: `¡Has enviado a ${playerTeam[index].name}!`, 
      isCritical: false 
    }]);

    // Si el juego estaba pausado esperando este cambio, reanudamos el motor
    if (status === 'WAITING_FOR_SWITCH') {
      setStatus('BATTLING');
      turnRef.current = 'CPU'; // La CPU ataca como "castigo" por hacer el cambio
      intervalRef.current = window.setInterval(battleTick, BATTLE_TICK_MS);
    }
  }, [playerTeam, playerActiveIdx, status, battleTick]);

  // 4. Iniciar el combate
  const startBattle = useCallback(() => {
    if (status !== 'READY') return;
    setStatus('BATTLING');
    turnRef.current = 'PLAYER'; // El jugador siempre da el primer golpe
    intervalRef.current = window.setInterval(battleTick, BATTLE_TICK_MS);
  }, [status, battleTick]);

  // 5. Limpieza general si el componente se desmonta
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