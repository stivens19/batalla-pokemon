import type { RawPokemon } from '../mappers/pokemonMapper';
import { mapPokemonToCharacter } from '../mappers/pokemonMapper';
import type { Character } from '../../core/models/types';

const BASE_URL = import.meta.env.VITE_API_URL;

export const fetchRandomCharacter = async (): Promise<Character> => {
  // Generamos un ID aleatorio del 1 al 151 (La primera generación por factor nostalgia)
  const randomId = Math.floor(Math.random() * 151) + 1;
  
  try {
    const response = await fetch(`${BASE_URL}/pokemon/${randomId}`);
    
    if (!response.ok) {
      throw new Error(`Error en la petición: ${response.status}`);
    }

    const rawData: RawPokemon = await response.json();
    
    // Pasamos los datos crudos por nuestro adaptador
    return mapPokemonToCharacter(rawData);
    
  } catch (error) {
    console.error("Error fetching data from PokeAPI", error);
    throw error;
  }
};