import React, { useState } from 'react';
import { useBattleEngine } from '../../application/hooks/useBattleEngine';
import { fetchRandomCharacter } from '../../infrastructure/api/pokeApi';
import { CharacterCard } from '../organisms/CharacterCard';
import { BattleTerminal } from '../organisms/BattleTerminal';
import { Button } from '../atoms/Button';

export const AutoBattlerPage: React.FC = () => {
  const { status, logs, player, cpu, initBattle, startBattle } = useBattleEngine();
  const [isFetching, setIsFetching] = useState(false);

  const handleFetchFighters = async () => {
    setIsFetching(true);
    try {
      const [playerData, cpuData] = await Promise.all([
        fetchRandomCharacter(),
        fetchRandomCharacter()
      ]);
      
      initBattle(playerData, cpuData);
    } catch (error) {
      alert("Hubo un error al buscar los peleadores. Revisa la consola.");
    } finally {
      setIsFetching(false);
    }
  };

  // Extraemos el último log del historial para el golpe final
  const finalLog = logs.length > 0 ? logs[logs.length - 1] : null;

  return (
    <div className="min-h-screen bg-gray-900 text-slate-200 p-4 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        
        {/* Cabecera y Controles */}
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500 mb-6 drop-shadow-sm">
            Arena de Batalla Automática
          </h1>
          
          <div className="flex justify-center gap-4">
            <Button 
              onClick={handleFetchFighters} 
              disabled={isFetching || status === 'BATTLING'}
              variant="outline"
            >
              {isFetching ? 'Buscando...' : 'Buscar Peleadores'}
            </Button>
            
            <Button 
              onClick={startBattle} 
              disabled={status !== 'READY'}
              variant={status === 'READY' ? 'primary' : 'outline'}
              className={status !== 'READY' ? 'opacity-50' : 'animate-pulse'}
            >
              Iniciar Combate
            </Button>
          </div>
        </header>

        {/* Zona de Combate */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 place-items-center">
          <CharacterCard character={player} label="Jugador 1" />
          
          {status === 'BATTLING' && (
            <div className="md:hidden text-2xl font-bold text-red-500 animate-bounce">
              VS
            </div>
          )}

          <CharacterCard character={cpu} label="CPU" />
        </div>

        {/* Terminal de Registro */}
        <div className="w-full max-w-4xl mx-auto">
          <BattleTerminal logs={logs} />
        </div>

        {/* Overlay de fin de batalla ACTUALIZADO */}
        {status === 'FINISHED' && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm p-4">
            <div className="bg-gray-800 p-8 rounded-2xl text-center border-2 border-indigo-500 shadow-[0_0_50px_rgba(79,70,229,0.3)] max-w-lg w-full">
              <h2 className="text-4xl font-bold text-white mb-6">¡Combate Terminado!</h2>
              
              {/* Caja destacada para el golpe final */}
              {finalLog && (
                <div className="mb-8 p-4 bg-gray-900 border border-gray-700 rounded-xl shadow-inner">
                  <p className="text-gray-400 text-xs uppercase tracking-widest mb-2">Golpe Final</p>
                  <p className={`font-mono text-lg md:text-xl ${finalLog.isCritical ? 'text-red-400 font-bold' : 'text-yellow-400'}`}>
                    {finalLog.isCritical && "💥 "}
                    {finalLog.message}
                  </p>
                </div>
              )}

              <Button onClick={handleFetchFighters} variant="primary" className="w-full md:w-auto">
                Buscar Nueva Revancha
              </Button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};