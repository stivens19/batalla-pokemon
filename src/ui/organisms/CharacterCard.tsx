import React, { useState, useEffect, useRef } from 'react';
import { Avatar } from '../atoms/Avatar';
import { ProgressBar } from '../atoms/ProgressBar';
import { StatRow } from '../molecules/StatRow';
import type { Character } from '../../core/models/types';

interface CharacterCardProps {
  character: Character | null;
  label: string;
}

export const CharacterCard: React.FC<CharacterCardProps> = ({ character, label }) => {
  // Estado local para disparar la animación
  const [isHit, setIsHit] = useState(false);
  const prevHpRef = useRef<number | null>(null);

  useEffect(() => {
    if (character) {
      // Si la vida actual es menor a la vida anterior registrada, significa que recibió daño
      if (prevHpRef.current !== null && character.stats.hp < prevHpRef.current) {
        setIsHit(true);
        // Apagamos la animación después de 400ms (lo que dura la animación en Tailwind)
        const timer = setTimeout(() => setIsHit(false), 400);
        return () => clearTimeout(timer);
      }
      // Actualizamos la referencia histórica
      prevHpRef.current = character.stats.hp;
    }
  }, [character?.stats.hp]); // Solo volvemos a ejecutar esto si el HP cambia

  if (!character) {
    return (
      <div className="w-full max-w-sm aspect-[3/4] bg-gray-800/50 border-2 border-dashed border-gray-600 rounded-xl flex items-center justify-center text-gray-500">
        Esperando retador...
      </div>
    );
  }

  const isDead = character.stats.hp <= 0;

  return (
    <div 
      className={`w-full max-w-sm bg-gray-800 rounded-xl border-2 transition-colors duration-300 shadow-xl overflow-hidden
      ${isDead ? 'border-red-900 opacity-80' : 'border-gray-600'}
      ${isHit ? 'animate-shake border-red-500' : ''}`} // <-- Aplicamos el Shake a toda la tarjeta
    >
      <div className="bg-gray-900 p-3 text-center border-b border-gray-700">
        <h3 className="text-xs text-gray-400 uppercase tracking-widest mb-1">{label}</h3>
        <h2 className="text-xl font-bold text-white truncate">{character.name}</h2>
      </div>

      <div className="p-6 flex justify-center bg-gradient-to-b from-gray-800 to-gray-900">
        {/* Envolvemos el Avatar para darle el destello rojo independiente */}
        <div className={isHit ? 'animate-flash-red' : ''}>
          <Avatar imageUrl={character.imageUrl} altText={character.name} isDead={isDead} />
        </div>
      </div>

      <div className="p-5 bg-gray-900">
        <div className="mb-4">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-400">HP</span>
            <span className="text-white font-mono">{character.stats.hp} / {character.stats.maxHp}</span>
          </div>
          <ProgressBar current={character.stats.hp} max={character.stats.maxHp} />
        </div>

        <div className="grid grid-cols-1 gap-1 bg-gray-800 p-3 rounded-lg">
          <StatRow label="Ataque" value={character.stats.attack} />
          <StatRow label="Defensa" value={character.stats.defense} />
          <StatRow label="Velocidad" value={character.stats.speed} />
        </div>
      </div>
    </div>
  );
};