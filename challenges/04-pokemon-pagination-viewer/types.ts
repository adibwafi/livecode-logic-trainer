export interface PokemonTypeItem {
  slot: number;
  type: {
    name: string;
    url: string;
  };
}

export interface PokemonStatItem {
  base_stat: number;
  effort: number;
  stat: {
    name: string;
    url: string;
  };
}

export interface PokemonSprites {
  front_default: string | null;
  back_default?: string | null;
  other?: {
    'official-artwork'?: {
      front_default: string | null;
    };
  };
}

export interface Pokemon {
  id: number;
  name: string;
  height: number;
  weight: number;
  sprites: PokemonSprites;
  types: PokemonTypeItem[];
  stats?: PokemonStatItem[];
}

export interface PaginationState {
  currentId: number;
  pokemon: Pokemon | null;
  loading: boolean;
  error: string | null;
  canGoPrev: boolean;
  canGoNext: boolean;
}

export interface PaginationOptions {
  minId?: number;
  maxId?: number;
  fetcher?: (id: number, options?: { signal?: AbortSignal }) => Promise<Pokemon>;
}
