import { createPokemonPaginationManager, Pokemon } from './index';

describe('HackerRank Pokemon 1-151 Dynamic Pagination & Fetcher', () => {
  const mockPokedex: Record<number, Pokemon> = {
    1: {
      id: 1,
      name: 'bulbasaur',
      height: 7,
      weight: 69,
      sprites: { front_default: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png' },
      types: [{ slot: 1, type: { name: 'grass', url: '' } }],
    },
    2: {
      id: 2,
      name: 'ivysaur',
      height: 10,
      weight: 130,
      sprites: { front_default: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/2.png' },
      types: [{ slot: 1, type: { name: 'grass', url: '' } }],
    },
    151: {
      id: 151,
      name: 'mew',
      height: 4,
      weight: 40,
      sprites: { front_default: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/151.png' },
      types: [{ slot: 1, type: { name: 'psychic', url: '' } }],
    },
  };

  const mockFetcher = async (id: number, options?: { signal?: AbortSignal }): Promise<Pokemon> => {
    if (options?.signal?.aborted) {
      const abortErr = new Error('The user aborted a request.');
      abortErr.name = 'AbortError';
      throw abortErr;
    }
    const data = mockPokedex[id];
    if (!data) {
      throw new Error(`Pokemon #${id} tidak ditemukan`);
    }
    return data;
  };

  it('1. should initialize at ID 1 with canGoPrev disabled', async () => {
    const manager = createPokemonPaginationManager({ minId: 1, maxId: 151, fetcher: mockFetcher });
    await manager.loadInitial();

    const state = manager.getState();
    expect(state.currentId).toBe(1);
    expect(state.pokemon?.name).toBe('bulbasaur');
    expect(state.loading).toBe(false);
    expect(state.canGoPrev).toBe(false); // Boundary check!
    expect(state.canGoNext).toBe(true);
  });

  it('2. should navigate to next ID (2) and enable canGoPrev', async () => {
    const manager = createPokemonPaginationManager({ minId: 1, maxId: 151, fetcher: mockFetcher });
    await manager.loadInitial();

    await manager.next();
    const state = manager.getState();
    expect(state.currentId).toBe(2);
    expect(state.pokemon?.name).toBe('ivysaur');
    expect(state.canGoPrev).toBe(true);
    expect(state.canGoNext).toBe(true);
  });

  it('3. should navigate back with prev() to ID 1 and re-disable canGoPrev', async () => {
    const manager = createPokemonPaginationManager({ minId: 1, maxId: 151, fetcher: mockFetcher });
    await manager.loadInitial();
    await manager.next(); // id = 2

    await manager.prev(); // back to id = 1
    const state = manager.getState();
    expect(state.currentId).toBe(1);
    expect(state.pokemon?.name).toBe('bulbasaur');
    expect(state.canGoPrev).toBe(false);
  });

  it('4. should respect upper boundary at ID 151 and disable canGoNext', async () => {
    const manager = createPokemonPaginationManager({ minId: 1, maxId: 151, fetcher: mockFetcher });
    await manager.goTo(151);

    const state = manager.getState();
    expect(state.currentId).toBe(151);
    expect(state.pokemon?.name).toBe('mew');
    expect(state.canGoNext).toBe(false); // Upper boundary check!

    // Attempting next() should do nothing
    await manager.next();
    expect(manager.getState().currentId).toBe(151);
  });

  it('5. should handle API errors gracefully without crashing', async () => {
    const failingFetcher = async (): Promise<Pokemon> => {
      throw new Error('HTTP 500: Internal Server Error');
    };

    const manager = createPokemonPaginationManager({ minId: 1, maxId: 151, fetcher: failingFetcher });
    await manager.loadInitial();

    const state = manager.getState();
    expect(state.loading).toBe(false);
    expect(state.error).toBe('HTTP 500: Internal Server Error');
    expect(state.pokemon).toBeNull();
  });
});
