import type { Character } from '../../core/models/types';

// Tipado estricto solo para los campos que necesitamos de la PokéAPI
export interface RawPokemon {
  id: number;
  name: string;
  sprites: {
    other: {
      'official-artwork': {
        front_default: string;
      }
    }
  };
  stats: Array<{
    base_stat: number;
    stat: { name: string };
  }>;
}

export const mapPokemonToCharacter = (raw: RawPokemon): Character => {
  // Función auxiliar para buscar el stat en el array, sin importar el orden en que venga
  const getStat = (statName: string) => 
    raw.stats.find(s => s.stat.name === statName)?.base_stat || 10;

  // Multiplicamos la vida base (hp) por 5 para que el combate dure más tiempo y se aprecie el motor
  const baseHp = getStat('hp') * 5;

  return {
    id: raw.id,
    name: raw.name.charAt(0).toUpperCase() + raw.name.slice(1), // Capitalizamos el nombre
    imageUrl: raw.sprites.other['official-artwork'].front_default,
    stats: {
      hp: baseHp,
      maxHp: baseHp,
      attack: getStat('attack'),
      defense: getStat('defense'),
      speed: getStat('speed'),
    }
  };
};