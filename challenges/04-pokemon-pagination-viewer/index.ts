import { Pokemon, PaginationState, PaginationOptions } from './types';
export * from './types';
export { PokemonViewer } from './PokemonViewer';

/**
 * Controller Logika Pagination & Dynamic Fetcher untuk HackerRank LiveCode
 * Mengelola state pagination (1 - 151), asynchronous fetch, boundary guards, dan abort signal.
 */
export function createPokemonPaginationManager({
  minId = 1,
  maxId = 151,
  fetcher,
}: PaginationOptions = {}) {
  let currentId = minId;
  let pokemon: Pokemon | null = null;
  let loading = false;
  let error: string | null = null;
  let activeAbortController: AbortController | null = null;

  const defaultFetcher = async (id: number, options?: { signal?: AbortSignal }): Promise<Pokemon> => {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`, { signal: options?.signal });
    if (!res.ok) {
      throw new Error(`Gagal memuat Pokemon #${id} (Status ${res.status})`);
    }
    return res.json();
  };

  const currentFetcher = fetcher || defaultFetcher;

  async function loadPokemon(id: number): Promise<void> {
    if (id < minId || id > maxId) {
      error = `ID Pokemon harus berada di antara ${minId} dan ${maxId}`;
      return;
    }

    // Abort in-flight request to prevent race conditions
    if (activeAbortController) {
      activeAbortController.abort();
    }
    activeAbortController = new AbortController();
    const signal = activeAbortController.signal;

    loading = true;
    error = null;
    currentId = id;

    try {
      const data = await currentFetcher(id, { signal });
      if (!signal.aborted) {
        pokemon = data;
        loading = false;
      }
    } catch (err: unknown) {
      if ((err as Error).name === 'AbortError') {
        return; // Request dibatalkan dengan aman
      }
      if (!signal.aborted) {
        error = (err as Error).message || 'Gagal memuat data Pokemon';
        loading = false;
        pokemon = null;
      }
    }
  }

  return {
    getState: (): PaginationState => ({
      currentId,
      pokemon,
      loading,
      error,
      canGoPrev: currentId > minId && !loading,
      canGoNext: currentId < maxId && !loading,
    }),

    loadInitial: async (): Promise<void> => {
      await loadPokemon(minId);
    },

    next: async (): Promise<void> => {
      if (currentId < maxId && !loading) {
        await loadPokemon(currentId + 1);
      }
    },

    prev: async (): Promise<void> => {
      if (currentId > minId && !loading) {
        await loadPokemon(currentId - 1);
      }
    },

    goTo: async (targetId: number): Promise<void> => {
      if (targetId >= minId && targetId <= maxId && !loading) {
        await loadPokemon(targetId);
      }
    },

    destroy: (): void => {
      if (activeAbortController) {
        activeAbortController.abort();
      }
    },
  };
}
