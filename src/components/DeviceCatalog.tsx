import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  SlidersHorizontal,
} from 'lucide-react';
import { DEVICES, DeviceSpec, DeviceZone } from '../data/arteriaData';
import type { LandingSegment } from './ProductTour';

type PrimaryFilterKey = 'all' | 'hc' | 'agua' | 'energia';
type WaterSubFilter = 'all' | 'captacion' | 'distribucion' | 'saneamiento' | 'tratamiento';

const PRIMARY_FILTERS: { key: PrimaryFilterKey; label: string }[] = [
  { key: 'all', label: 'Todos' },
  { key: 'hc', label: 'Ductos' },
  { key: 'agua', label: 'Acueductos' },
  { key: 'energia', label: 'Redes eléctricas' },
];

const WATER_SUBFILTERS: { key: WaterSubFilter; label: string }[] = [
  { key: 'all', label: 'Todas las etapas' },
  { key: 'captacion', label: 'Captación' },
  { key: 'distribucion', label: 'Distribución' },
  { key: 'saneamiento', label: 'Saneamiento' },
  { key: 'tratamiento', label: 'Tratamiento' },
];

const fmt = (v: number, d: number) =>
  v.toLocaleString('es-CO', { minimumFractionDigits: d, maximumFractionDigits: d });

interface DeviceCatalogProps {
  activeSector?: LandingSegment;
}

export function DeviceCatalog({ activeSector = 'todos' }: DeviceCatalogProps) {
  const [primaryFilter, setPrimaryFilter] = useState<PrimaryFilterKey>('all');
  const [waterSubFilter, setWaterSubFilter] = useState<WaterSubFilter>('all');
  const [viewMode, setViewMode] = useState<'carousel' | 'grid'>('carousel');
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);

  // Sync catalog filter when user picks a sector in the Hero
  useEffect(() => {
    if (activeSector === 'hidrocarburos') {
      setPrimaryFilter('hc');
    } else if (activeSector === 'acueducto') {
      setPrimaryFilter('agua');
      setWaterSubFilter('all');
    } else if (activeSector === 'electrica') {
      setPrimaryFilter('energia');
    } else {
      setPrimaryFilter('all');
    }
  }, [activeSector]);

  const [readings, setReadings] = useState<{ v: number; drift: number }[]>(() =>
    DEVICES.map((d) => ({ v: d.initial, drift: 0 }))
  );

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;

    const id = window.setInterval(() => {
      setReadings((prev) =>
        prev.map((state, idx) => {
          const d = DEVICES[idx];
          const span = d.max - d.min;
          let nextDrift = state.drift * 0.9;
          if (Math.random() < 0.004) {
            nextDrift += (Math.random() < 0.5 ? -1 : 1) * span * 0.12;
          }
          let nextV = state.v + (d.initial - state.v) * 0.04 + nextDrift + (Math.random() - 0.5) * span * 0.02;
          if (d.min >= 0) nextV = Math.max(0, nextV);
          return { v: nextV, drift: nextDrift };
        })
      );
    }, 1400);

    return () => window.clearInterval(id);
  }, []);

  const primaryCounts = useMemo(() => {
    const map: Record<PrimaryFilterKey, number> = {
      all: DEVICES.length,
      hc: 0,
      agua: 0,
      energia: 0,
    };
    DEVICES.forEach((d) => {
      map[d.sector] += 1;
    });
    return map;
  }, []);

  const waterSubCounts = useMemo(() => {
    const map: Record<WaterSubFilter, number> = {
      all: 0,
      captacion: 0,
      distribucion: 0,
      saneamiento: 0,
      tratamiento: 0,
    };
    DEVICES.forEach((d) => {
      if (d.sector === 'agua') {
        map.all += 1;
        const zone = d.filter as Exclude<DeviceZone, 'hc' | 'energia'>;
        map[zone] += 1;
      }
    });
    return map;
  }, []);

  const visibleDevices = useMemo(() => {
    if (primaryFilter === 'all') return DEVICES;
    if (primaryFilter === 'agua') {
      return DEVICES.filter(
        (d) => d.sector === 'agua' && (waterSubFilter === 'all' || d.filter === waterSubFilter)
      );
    }
    return DEVICES.filter((d) => d.sector === primaryFilter);
  }, [primaryFilter, waterSubFilter]);

  const updateScrollState = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(maxScroll - el.scrollLeft > 4);
    setScrollProgress(maxScroll > 0 ? Math.min(1, Math.max(0, el.scrollLeft / maxScroll)) : 1);
  }, []);

  useEffect(() => {
    if (viewMode !== 'carousel') return;
    const el = trackRef.current;
    if (!el) return;
    el.scrollTo({ left: 0, behavior: 'auto' });
    const raf = window.requestAnimationFrame(updateScrollState);
    const ro = new ResizeObserver(updateScrollState);
    ro.observe(el);
    return () => {
      window.cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [primaryFilter, waterSubFilter, viewMode, updateScrollState]);

  const scrollByStep = (direction: -1 | 1) => {
    const el = trackRef.current;
    if (!el) return;
    const step = Math.max(300, Math.round(el.clientWidth * 0.82));
    el.scrollBy({ left: direction * step, behavior: 'smooth' });
  };

  const renderCard = (d: DeviceSpec, isCarousel: boolean) => {
    const idx = DEVICES.indexOf(d);
    const current = readings[idx]?.v ?? d.initial;
    const span = d.max - d.min;
    const pad = span * 0.25;
    const okLeftPct = (pad / (span + 2 * pad)) * 100;
    const markerPct = Math.min(100, Math.max(0, ((current - d.min + pad) / (span + 2 * pad)) * 100));

    const isOut = current < d.min || current > d.max;
    const isCrit = current < d.min - span * 0.1 || current > d.max + span * 0.1;

    const statusLabel = isCrit ? 'Crítico' : isOut ? 'Fuera de rango' : 'Normal';
    const statusColor = isCrit
      ? 'text-[var(--crit)]'
      : isOut
        ? 'text-[var(--warn)]'
        : 'text-[var(--ok)]';

    return (
      <article
        key={d.id}
        className={`rounded-xl border border-[var(--line)] bg-[var(--sheet)] p-4.5 flex flex-col justify-between gap-3.5 min-w-0 ${
          isCarousel ? 'w-[285px] sm:w-[304px] shrink-0 snap-start' : ''
        }`}
      >
        <div>
          <div className="flex items-start gap-3">
            <span
              aria-hidden="true"
              className={`w-9 h-9 rounded-lg grid place-items-center font-mono-tech text-xs font-semibold text-[var(--paper)] shrink-0 ${
                d.sector === 'agua'
                  ? 'bg-[var(--water)]'
                  : d.sector === 'energia'
                    ? 'bg-[var(--electric)]'
                    : 'bg-[var(--crude)]'
              }`}
            >
              {d.glyph}
            </span>
            <div className="min-w-0 flex-1">
              <h3 className="font-sans text-sm font-semibold text-[var(--ink)] leading-snug">{d.name}</h3>
              <span className="block font-mono-tech text-[11px] text-[var(--muted)] mt-0.5">{d.zoneLabel}</span>
            </div>
          </div>

          <div className="mt-4 flex items-baseline justify-between gap-2">
            <div className="font-display text-3xl font-semibold leading-none tabular-nums text-[var(--ink)]">
              {fmt(current, d.decimals)}
              <span className="ml-1.5 font-mono-tech text-xs font-normal text-[var(--muted)]">{d.unit}</span>
            </div>
            <span
              className={`inline-flex items-center gap-1 font-mono-tech text-[11px] font-semibold whitespace-nowrap shrink-0 ${statusColor}`}
            >
              {isCrit ? (
                <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              ) : isOut ? (
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              )}
              {statusLabel}
            </span>
          </div>

          <div
            className="mt-2.5 relative h-2 rounded bg-[var(--crit)]/18"
            role="img"
            aria-label={`Rango operativo de ${fmt(d.min, d.decimals)} a ${fmt(d.max, d.decimals)} ${d.unit}`}
          >
            <span
              className="absolute inset-y-0 rounded-xs bg-[var(--ok)]/45"
              style={{ left: `${okLeftPct}%`, right: `${okLeftPct}%` }}
            />
            <span
              className="absolute -top-1 w-0.5 h-4 -ml-px rounded bg-[var(--ink)] transition-[left] duration-500 ease-out"
              style={{ left: `${markerPct}%` }}
            />
          </div>
          <div className="mt-1 flex justify-between font-mono-tech text-[11px] text-[var(--muted)] tabular-nums">
            <span>{fmt(d.min, d.decimals)}</span>
            <span>rango operativo</span>
            <span>{fmt(d.max, d.decimals)}</span>
          </div>

          <p className="mt-3 text-xs text-[var(--muted)] leading-relaxed">{d.description}</p>
        </div>

        <p className="pt-2.5 border-t border-[var(--line)] font-mono-tech text-[11px] text-[var(--muted)]">
          {d.protocols}
        </p>
      </article>
    );
  };

  return (
    <div>
      {/* Primary Sector Filter Bar + Carousel / Grid Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-4">
        <div
          className="flex flex-wrap gap-1.5"
          role="group"
          aria-label="Filtrar dispositivos por sector"
        >
          {PRIMARY_FILTERS.map((f) => {
            const active = primaryFilter === f.key;
            return (
              <button
                key={f.key}
                type="button"
                onClick={() => {
                  setPrimaryFilter(f.key);
                  if (f.key !== 'agua') setWaterSubFilter('all');
                }}
                aria-pressed={active}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  active
                    ? 'bg-[var(--ink)] border-[var(--ink)] text-[var(--paper)]'
                    : 'bg-[var(--sheet)] border-[var(--line)] text-[var(--muted)] hover:text-[var(--ink)] hover:border-[var(--ink)]/40'
                }`}
              >
                <span>{f.label}</span>
                <span className="font-mono-tech text-xs opacity-75">{primaryCounts[f.key]}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 self-start lg:self-auto shrink-0">
          {viewMode === 'carousel' && (
            <div className="inline-flex items-center gap-1" role="group" aria-label="Navegar carrusel de sensores">
              <button
                type="button"
                onClick={() => scrollByStep(-1)}
                disabled={!canScrollLeft}
                aria-label="Sensores anteriores"
                className="p-2 rounded-md border border-[var(--line)] bg-[var(--sheet)] text-[var(--ink)] hover:border-[var(--ink)]/50 disabled:opacity-35 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => scrollByStep(1)}
                disabled={!canScrollRight}
                aria-label="Siguientes sensores"
                className="p-2 rounded-md border border-[var(--line)] bg-[var(--sheet)] text-[var(--ink)] hover:border-[var(--ink)]/50 disabled:opacity-35 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={() => setViewMode((m) => (m === 'carousel' ? 'grid' : 'carousel'))}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-md border border-[var(--line)] bg-[var(--sheet)] text-[var(--ink)] hover:border-[var(--ink)]/50 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            {viewMode === 'carousel' ? (
              <>
                <LayoutGrid className="w-3.5 h-3.5" aria-hidden="true" />
                Ver todos ({visibleDevices.length})
              </>
            ) : (
              <>
                <SlidersHorizontal className="w-3.5 h-3.5" aria-hidden="true" />
                Vista carrusel
              </>
            )}
          </button>
        </div>
      </div>

      {/* Water Cycle Sub-filter Strip (shown only when Acueductos is active) */}
      {primaryFilter === 'agua' && (
        <div
          className="flex flex-wrap items-center gap-1.5 mb-5 pb-3 border-b border-[var(--line)]"
          role="group"
          aria-label="Filtrar etapas del ciclo del agua"
        >
          <span className="font-mono-tech text-[11px] text-[var(--muted)] mr-1">Etapa del ciclo del agua:</span>
          {WATER_SUBFILTERS.map((sf) => {
            const active = waterSubFilter === sf.key;
            return (
              <button
                key={sf.key}
                type="button"
                onClick={() => setWaterSubFilter(sf.key)}
                aria-pressed={active}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  active
                    ? 'bg-[var(--water)] border-[var(--water)] text-[var(--paper)]'
                    : 'bg-[var(--sheet)] border-[var(--line)] text-[var(--muted)] hover:text-[var(--ink)]'
                }`}
              >
                <span>{sf.label}</span>
                <span className="font-mono-tech text-[11px] opacity-80">{waterSubCounts[sf.key]}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Live Telemetry Carousel or Expanded Grid */}
      {viewMode === 'carousel' ? (
        <div className="relative">
          <div
            ref={trackRef}
            onScroll={updateScrollState}
            aria-live="off"
            aria-label="Carrusel horizontal de sensores monitoreados"
            className="flex gap-3.5 overflow-x-auto snap-x snap-mandatory no-scrollbar pb-2 -mx-1 px-1"
          >
            {visibleDevices.map((d) => renderCard(d, true))}
          </div>

          <div className="mt-3 flex items-center justify-between gap-4">
            <div className="flex-1 max-w-xs h-1 rounded-full bg-[var(--line)]/70 overflow-hidden" aria-hidden="true">
              <div
                className="h-full bg-[var(--crude)] transition-[width] duration-200 ease-out"
                style={{ width: `${Math.max(14, Math.round(scrollProgress * 100))}%` }}
              />
            </div>
            <span className="font-mono-tech text-[11px] text-[var(--muted)] whitespace-nowrap">
              {visibleDevices.length} sensores · desliza o usa las flechas
            </span>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5" aria-live="off">
          {visibleDevices.map((d) => renderCard(d, false))}
        </div>
      )}

      <p className="mt-6 font-mono-tech text-xs text-[var(--muted)] max-w-3xl leading-relaxed">
        ¿Su equipo no está en la lista? Si mide una variable y entrega el dato por MQTT, OPC UA, IEC 61850, DNP3,
        Modbus o LoRaWAN, se agrega como un tipo nuevo desde Configuración.
      </p>
    </div>
  );
}
