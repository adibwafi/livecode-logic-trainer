'use client';

import React, { useState, useEffect } from 'react';
import { Pokemon, PaginationState } from './types';

const MIN_POKEMON_ID = 1;
const MAX_POKEMON_ID = 151;

// Color mapping for Pokemon types
const TYPE_COLORS: Record<string, string> = {
  grass: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  poison: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  fire: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  water: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  bug: 'bg-lime-500/20 text-lime-400 border-lime-500/30',
  normal: 'bg-zinc-500/20 text-zinc-300 border-zinc-500/30',
  electric: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  ground: 'bg-amber-700/20 text-amber-300 border-amber-700/30',
  fairy: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  fighting: 'bg-red-700/20 text-red-300 border-red-700/30',
  psychic: 'bg-fuchsia-500/20 text-fuchsia-400 border-fuchsia-500/30',
  rock: 'bg-stone-500/20 text-stone-300 border-stone-500/30',
  ghost: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
  ice: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  dragon: 'bg-violet-700/20 text-violet-300 border-violet-700/30',
};

interface PokemonViewerProps {
  initialId?: number;
  customFetcher?: (id: number, options?: { signal?: AbortSignal }) => Promise<Pokemon>;
}

export const PokemonViewer: React.FC<PokemonViewerProps> = ({
  initialId = MIN_POKEMON_ID,
  customFetcher,
}) => {
  const [state, setState] = useState<PaginationState>({
    currentId: Math.max(MIN_POKEMON_ID, Math.min(MAX_POKEMON_ID, initialId)),
    pokemon: null,
    loading: true,
    error: null,
    canGoPrev: false,
    canGoNext: true,
  });

  const { currentId, pokemon, loading, error, canGoPrev, canGoNext } = state;

  // ── Dynamic Fetch via useEffect with AbortController ──────────────────────
  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    setState((prev) => ({
      ...prev,
      loading: true,
      error: null,
      canGoPrev: prev.currentId > MIN_POKEMON_ID,
      canGoNext: prev.currentId < MAX_POKEMON_ID,
    }));

    const executeFetch = async () => {
      try {
        let data: Pokemon;

        if (customFetcher) {
          data = await customFetcher(currentId, { signal });
        } else {
          const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${currentId}`, { signal });
          if (!res.ok) {
            throw new Error(`Gagal memuat Pokemon #${currentId} (Status ${res.status})`);
          }
          data = await res.json();
        }

        if (!signal.aborted) {
          setState((prev) => ({
            ...prev,
            pokemon: data,
            loading: false,
            error: null,
            canGoPrev: prev.currentId > MIN_POKEMON_ID,
            canGoNext: prev.currentId < MAX_POKEMON_ID,
          }));
        }
      } catch (err: unknown) {
        if ((err as Error).name === 'AbortError') return;
        if (!signal.aborted) {
          setState((prev) => ({
            ...prev,
            loading: false,
            error: (err as Error).message || 'Terjadi kesalahan pada jaringan',
            pokemon: null,
          }));
        }
      }
    };

    executeFetch();

    // Cleanup: batalkan request in-flight jika currentId berubah sebelum fetch selesai
    return () => {
      controller.abort();
    };
  }, [currentId, customFetcher]);

  // ── Navigation Handlers ──────────────────────────────────────────────────
  const handlePrev = () => {
    if (canGoPrev && !loading) {
      setState((prev) => ({
        ...prev,
        currentId: Math.max(MIN_POKEMON_ID, prev.currentId - 1),
      }));
    }
  };

  const handleNext = () => {
    if (canGoNext && !loading) {
      setState((prev) => ({
        ...prev,
        currentId: Math.min(MAX_POKEMON_ID, prev.currentId + 1),
      }));
    }
  };

  const handleDirectJump = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const targetId = Number(e.target.value);
    if (!isNaN(targetId) && targetId >= MIN_POKEMON_ID && targetId <= MAX_POKEMON_ID && !loading) {
      setState((prev) => ({
        ...prev,
        currentId: targetId,
      }));
    }
  };

  const artworkUrl =
    pokemon?.sprites.other?.['official-artwork']?.front_default ||
    pokemon?.sprites.front_default ||
    '';

  return (
    <main className="w-full max-w-md mx-auto p-6 bg-zinc-950/90 border border-zinc-800/80 rounded-2xl shadow-2xl backdrop-blur-xl text-zinc-100 font-sans">
      {/* Header Info */}
      <header className="flex items-center justify-between pb-4 border-b border-zinc-800/60">
        <div>
          <span className="text-xs font-semibold tracking-wider text-emerald-400 uppercase">
            HackerRank LiveCode Challenge
          </span>
          <h1 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
            Pokedex Gen 1 <span className="text-xs font-mono text-zinc-400">(1-151)</span>
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="jump-select" className="sr-only">
            Pilih Nomor Pokemon
          </label>
          <select
            id="jump-select"
            value={currentId}
            onChange={handleDirectJump}
            disabled={loading}
            className="bg-zinc-900 border border-zinc-700/80 text-xs text-zinc-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 disabled:opacity-50"
          >
            {Array.from({ length: MAX_POKEMON_ID }, (_, i) => i + 1).map((id) => (
              <option key={id} value={id}>
                #{String(id).padStart(3, '0')}
              </option>
            ))}
          </select>
        </div>
      </header>

      {/* Card Content Area */}
      <section
        aria-busy={loading}
        className="my-6 min-h-[320px] flex flex-col items-center justify-center p-6 rounded-xl bg-zinc-900/50 border border-zinc-800/50 relative overflow-hidden"
      >
        {loading && (
          <div
            data-testid="loading-indicator"
            className="flex flex-col items-center justify-center space-y-3 py-12"
          >
            <div className="w-10 h-10 border-3 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
            <p className="text-xs font-medium text-zinc-400 animate-pulse">
              Memuat data Pokemon #{currentId}...
            </p>
          </div>
        )}

        {!loading && error && (
          <div
            data-testid="error-message"
            className="flex flex-col items-center text-center p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl"
          >
            <span className="text-2xl mb-1">⚠️</span>
            <p className="text-xs font-semibold text-rose-400 mb-2">{error}</p>
            <button
              onClick={() => setState((prev) => ({ ...prev, currentId }))}
              className="text-xs px-3 py-1 bg-rose-500/20 text-rose-300 rounded hover:bg-rose-500/30 transition-colors"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {!loading && !error && pokemon && (
          <article data-testid="pokemon-card" className="w-full flex flex-col items-center">
            {/* Number Pill */}
            <span
              data-testid="pokemon-id"
              className="text-xs font-mono font-bold tracking-widest text-zinc-400 bg-zinc-800/80 px-3 py-0.5 rounded-full border border-zinc-700/50 mb-3"
            >
              #{String(pokemon.id).padStart(3, '0')}
            </span>

            {/* Sprite Artwork */}
            <div className="relative w-36 h-36 flex items-center justify-center my-2 bg-gradient-to-b from-zinc-800/20 to-transparent rounded-full">
              {artworkUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  data-testid="pokemon-image"
                  src={artworkUrl}
                  alt={pokemon.name}
                  className="w-32 h-32 object-contain drop-shadow-md transition-transform hover:scale-105 duration-200"
                />
              ) : (
                <span className="text-zinc-500 text-xs">No Image Available</span>
              )}
            </div>

            {/* Name */}
            <h2
              data-testid="pokemon-name"
              className="text-xl font-bold capitalize text-zinc-100 tracking-wide mt-1"
            >
              {pokemon.name}
            </h2>

            {/* Type Badges */}
            <div data-testid="pokemon-types" className="flex items-center gap-2 mt-3">
              {pokemon.types.map((item) => {
                const typeName = item.type.name.toLowerCase();
                const colorClass =
                  TYPE_COLORS[typeName] || 'bg-zinc-800 text-zinc-300 border-zinc-700';
                return (
                  <span
                    key={typeName}
                    className={`text-xs uppercase font-bold tracking-wider px-3 py-1 rounded-full border ${colorClass}`}
                  >
                    {item.type.name}
                  </span>
                );
              })}
            </div>

            {/* Stats Overview */}
            <div className="w-full grid grid-cols-2 gap-2 mt-6 pt-4 border-t border-zinc-800/50 text-xs text-zinc-400">
              <div className="bg-zinc-800/40 rounded-lg p-2 text-center">
                <span className="block text-zinc-500 text-[10px]">TINGGI</span>
                <span className="font-semibold text-zinc-200">{(pokemon.height / 10).toFixed(1)} m</span>
              </div>
              <div className="bg-zinc-800/40 rounded-lg p-2 text-center">
                <span className="block text-zinc-500 text-[10px]">BERAT</span>
                <span className="font-semibold text-zinc-200">{(pokemon.weight / 10).toFixed(1)} kg</span>
              </div>
            </div>
          </article>
        )}
      </section>

      {/* Navigation Buttons (Core HackerRank Requirement) */}
      <footer className="grid grid-cols-2 gap-3 pt-2">
        <button
          type="button"
          data-testid="btn-prev"
          onClick={handlePrev}
          disabled={!canGoPrev || loading}
          className={`flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl text-xs font-semibold transition-all duration-200 ${
            !canGoPrev || loading
              ? 'bg-zinc-900/60 text-zinc-600 border border-zinc-800/40 cursor-not-allowed opacity-50'
              : 'bg-zinc-800/90 text-zinc-100 hover:bg-zinc-700 border border-zinc-700/60 active:scale-[0.98]'
          }`}
        >
          <span>&larr;</span>
          <span>Sebelumnya</span>
        </button>

        <button
          type="button"
          data-testid="btn-next"
          onClick={handleNext}
          disabled={!canGoNext || loading}
          className={`flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl text-xs font-semibold transition-all duration-200 ${
            !canGoNext || loading
              ? 'bg-zinc-900/60 text-zinc-600 border border-zinc-800/40 cursor-not-allowed opacity-50'
              : 'bg-emerald-600/90 text-white hover:bg-emerald-500 border border-emerald-500/60 shadow-lg shadow-emerald-950/40 active:scale-[0.98]'
          }`}
        >
          <span>Berikutnya</span>
          <span>&rarr;</span>
        </button>
      </footer>
    </main>
  );
};

export default PokemonViewer;
