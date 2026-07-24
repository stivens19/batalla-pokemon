import React, { useState } from 'react';
import { useBattleEngine } from '../../application/hooks/useBattleEngine';
import { fetchRandomCharacter } from '../../infrastructure/api/pokeApi';
import { CharacterCard } from '../organisms/CharacterCard';
import { BattleTerminal } from '../organisms/BattleTerminal';
import { Button } from '../atoms/Button';

export const AutoBattlerPage: React.FC = () => {
  const { 
    status, logs, 
    playerTeam, cpuTeam, 
    playerActiveIdx, cpuActiveIdx, 
    initBattle, startBattle 
  } = useBattleEngine();
  
  const [isFetching, setIsFetching] = useState(false);

  const handleFetchDraft = async () => {
    setIsFetching(true);
    try {
      // Lanzamos 6 peticiones en paralelo para armar los equipos rápidamente
      const [p1, p2, p3, c1, c2, c3] = await Promise.all([
        fetchRandomCharacter(), fetchRandomCharacter(), fetchRandomCharacter(),
        fetchRandomCharacter(), fetchRandomCharacter(), fetchRandomCharacter()
      ]);
      
      initBattle([p1, p2, p3], [c1, c2, c3]);
    } catch (error) {
      alert("Error en la API. Revisa la conexión.");
    } finally {
      setIsFetching(false);
    }
  };

  const finalLog = logs.length > 0 ? logs[logs.length - 1] : null;

  // Personajes activos en la arena
  const activePlayer = playerTeam[playerActiveIdx] || null;
  const activeCpu = cpuTeam[cpuActiveIdx] || null;

  return (
    <div className="min-h-screen bg-gray-900 text-slate-200 p-4 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500 mb-6 drop-shadow-sm">
            Torneo 3v3 Automático
          </h1>
          
          <div className="flex justify-center gap-4">
            <Button 
              onClick={handleFetchDraft} 
              disabled={isFetching || status === 'BATTLING'}
              variant="outline"
            >
              {isFetching ? 'Reclutando Equipos...' : 'Reclutar Equipos'}
            </Button>
            
            <Button 
              onClick={startBattle} 
              disabled={status !== 'READY'}
              variant={status === 'READY' ? 'primary' : 'outline'}
              className={status !== 'READY' ? 'opacity-50' : 'animate-pulse'}
            >
              Iniciar Torneo
            </Button>
          </div>
        </header>

        {/* Zona de Combate */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 place-items-center">
          
          {/* Lado del Jugador */}
          <div className="w-full flex flex-col items-center">
            <CharacterCard character={activePlayer} label="Equipo Jugador" />
            
            {/* Banca de Reserva Jugador */}
            {playerTeam.length > 0 && (
              <div className="flex gap-3 mt-4 bg-gray-800 p-2 rounded-xl border border-gray-700">
                {playerTeam.map((p, idx) => (
                  <div key={`${p.id}-${idx}`} 
                    className={`w-14 h-14 rounded-full border-2 overflow-hidden bg-gray-900 transition-all duration-300
                    ${p.stats.hp <= 0 ? 'border-red-900 grayscale opacity-40' : 
                      idx === playerActiveIdx ? 'border-green-400 scale-110 shadow-[0_0_10px_rgba(74,222,128,0.5)]' : 'border-gray-600 opacity-80'}`}
                  >
                    <img src={p.imageUrl} alt={p.name} className="w-full h-full object-contain p-1" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Lado de la CPU */}
          <div className="w-full flex flex-col items-center">
            <CharacterCard character={activeCpu} label="Equipo Rival" />
            
            {/* Banca de Reserva CPU */}
            {cpuTeam.length > 0 && (
              <div className="flex gap-3 mt-4 bg-gray-800 p-2 rounded-xl border border-gray-700">
                {cpuTeam.map((p, idx) => (
                  <div key={`${p.id}-${idx}`} 
                    className={`w-14 h-14 rounded-full border-2 overflow-hidden bg-gray-900 transition-all duration-300
                    ${p.stats.hp <= 0 ? 'border-red-900 grayscale opacity-40' : 
                      idx === cpuActiveIdx ? 'border-rose-500 scale-110 shadow-[0_0_10px_rgba(244,63,94,0.5)]' : 'border-gray-600 opacity-80'}`}
                  >
                    <img src={p.imageUrl} alt={p.name} className="w-full h-full object-contain p-1" />
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        <div className="w-full max-w-4xl mx-auto">
          <BattleTerminal logs={logs} />
        </div>

        {/* Overlay Final */}
        {status === 'FINISHED' && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm p-4">
            <div className="bg-gray-800 p-8 rounded-2xl text-center border-2 border-indigo-500 shadow-[0_0_50px_rgba(79,70,229,0.3)] max-w-lg w-full">
              <h2 className="text-4xl font-bold text-white mb-6">
                {/* Evaluamos quién tiene vida en su equipo para declarar al ganador */}
                {playerTeam.some(p => p.stats.hp > 0) ? '¡Has Ganado el Torneo!' : '¡Has sido Derrotado!'}
              </h2>
              
              {finalLog && (
                <div className="mb-8 p-4 bg-gray-900 border border-gray-700 rounded-xl shadow-inner">
                  <p className="text-gray-400 text-xs uppercase tracking-widest mb-2">Golpe Final</p>
                  <p className={`font-mono text-lg md:text-xl ${finalLog.isCritical ? 'text-red-400 font-bold' : 'text-yellow-400'}`}>
                    {finalLog.isCritical && "💥 "}
                    {finalLog.message}
                  </p>
                </div>
              )}

              <Button onClick={handleFetchDraft} variant="primary" className="w-full md:w-auto">
                Reclutar Nuevos Equipos
              </Button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};