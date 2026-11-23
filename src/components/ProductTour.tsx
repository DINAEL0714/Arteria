import { useEffect, useState } from 'react';
import { Maximize2, X } from 'lucide-react';
import { GALLERY_VIEWS, GalleryViewItem, SectorKey, TOUR_ROWS } from '../data/arteriaData';

export type LandingSegment = 'todos' | 'hidrocarburos' | 'acueducto' | 'electrica';

interface ProductTourProps {
  activeSector: LandingSegment;
}

interface LightboxMedia {
  src: string;
  alt: string;
  caption: string;
}

const SECTOR_META: Record<
  SectorKey,
  {
    label: string;
    heading: string;
    subtitle: string;
    barColor: string;
  }
> = {
  hc: {
    label: 'Ductos',
    heading: 'Oleoductos, gasoductos y poliductos',
    subtitle: 'Corredores en 3D, estaciones de bombeo, transmisores en vivo y órdenes de trabajo a operarios.',
    barColor: 'bg-[var(--crude)]',
  },
  agua: {
    label: 'Acueductos',
    heading: 'Acueductos, distribución y PTAR',
    subtitle: 'Trazados por etapa del ciclo del agua, medidores en 3D, fugas nocturnas y despacho a cuadrillas.',
    barColor: 'bg-[var(--water)]',
  },
  energia: {
    label: 'Redes eléctricas',
    heading: 'Transmisión 230/115 kV, distribución y generación',
    subtitle: 'Torres sobre relieve satelital, diagramas unifilares por módulos, DGA/SF₆ y alarmas críticas.',
    barColor: 'bg-[var(--electric)]',
  },
};

const segmentToSectorKey = (seg: LandingSegment): SectorKey | null => {
  if (seg === 'hidrocarburos') return 'hc';
  if (seg === 'acueducto') return 'agua';
  if (seg === 'electrica') return 'energia';
  return null;
};

export function ProductTour({ activeSector }: ProductTourProps) {
  const [lightbox, setLightbox] = useState<LightboxMedia | null>(null);
  const [tourSector, setTourSector] = useState<SectorKey>(() => segmentToSectorKey(activeSector) ?? 'hc');
  const [galleryMode, setGalleryMode] = useState<SectorKey | 'grouped'>(
    () => segmentToSectorKey(activeSector) ?? 'hc'
  );

  // Sync product tour and gallery whenever the visitor switches sector in the Hero
  useEffect(() => {
    const mapped = segmentToSectorKey(activeSector);
    if (mapped) {
      setTourSector(mapped);
      setGalleryMode(mapped);
    }
  }, [activeSector]);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightbox(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightbox]);

  const handleSelectSectorTab = (sector: SectorKey) => {
    setTourSector(sector);
    setGalleryMode(sector);
  };

  const visibleTourRows = TOUR_ROWS.filter((row) => row.sector === tourSector);

  const countsBySector: Record<SectorKey, number> = {
    hc: GALLERY_VIEWS.filter((v) => v.category === 'hc').length,
    agua: GALLERY_VIEWS.filter((v) => v.category === 'agua').length,
    energia: GALLERY_VIEWS.filter((v) => v.category === 'energia').length,
  };

  const renderGalleryCard = (item: GalleryViewItem) => {
    if (item.span === 'wide') {
      return (
        <figure key={item.id} className="md:col-span-2 m-0 grid gap-3 min-w-0 group">
          <button
            type="button"
            onClick={() => setLightbox({ src: item.image, alt: item.alt, caption: item.title })}
            aria-label={`Ampliar captura: ${item.title}`}
            className="block w-full rounded-xl border border-[var(--line)] bg-[var(--sheet)] overflow-hidden shadow-sm cursor-zoom-in"
          >
            <img
              src={item.image}
              width={item.width}
              height={item.height}
              alt={item.alt}
              loading="lazy"
              referrerPolicy="no-referrer"
              className="w-full h-auto block transition-transform duration-300 group-hover:scale-[1.008]"
            />
          </button>
          <figcaption className="text-sm text-[var(--muted)]">
            <strong className="text-[var(--ink)] font-semibold">{item.title}</strong> {item.body}
          </figcaption>
        </figure>
      );
    }

    if (item.span === 'tall') {
      return (
        <figure
          key={item.id}
          className="md:col-span-2 m-0 rounded-xl border border-[var(--line)] bg-[var(--sheet)] p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-[220px_minmax(0,1fr)] gap-6 items-center"
        >
          <button
            type="button"
            onClick={() => setLightbox({ src: item.image, alt: item.alt, caption: item.title })}
            aria-label={`Ampliar captura: ${item.title}`}
            className="block rounded-lg border border-[var(--line)] overflow-hidden shadow-sm cursor-zoom-in max-w-[220px]"
          >
            <img
              src={item.image}
              width={item.width}
              height={item.height}
              alt={item.alt}
              loading="lazy"
              referrerPolicy="no-referrer"
              className="w-full h-auto block"
            />
          </button>
          <figcaption className="grid gap-2">
            <h3 className="text-2xl font-semibold text-[var(--ink)]">{item.title}</h3>
            <p className="text-base text-[var(--muted)] max-w-xl leading-relaxed">{item.body}</p>
          </figcaption>
        </figure>
      );
    }

    return (
      <figure key={item.id} className="m-0 grid gap-3 min-w-0 group">
        <button
          type="button"
          onClick={() => setLightbox({ src: item.image, alt: item.alt, caption: item.title })}
          aria-label={`Ampliar captura: ${item.title}`}
          className="block w-full rounded-xl border border-[var(--line)] bg-[var(--sheet)] overflow-hidden shadow-sm cursor-zoom-in"
        >
          <img
            src={item.image}
            width={item.width}
            height={item.height}
            alt={item.alt}
            loading="lazy"
            referrerPolicy="no-referrer"
            className="w-full h-auto block transition-transform duration-300 group-hover:scale-[1.01]"
          />
        </button>
        <figcaption className="text-sm text-[var(--muted)]">
          <strong className="text-[var(--ink)] font-semibold">{item.title}</strong> {item.body}
        </figcaption>
      </figure>
    );
  };

  return (
    <>
      {/* Main Alternating Feature Tour — strictly segmented by sector */}
      <section id="producto" className="py-20 sm:py-24 border-t border-[var(--line)]" aria-labelledby="producto-h">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
            <div className="max-w-2xl">
              <p className="font-mono-tech text-xs uppercase tracking-[0.14em] text-[var(--crude)]">El producto</p>
              <h2 id="producto-h" className="mt-2 text-4xl sm:text-5xl font-semibold tracking-tight text-[var(--ink)]">
                Del mapa al mantenimiento, sin cambiar de herramienta
              </h2>
              <p className="mt-3 text-base sm:text-lg text-[var(--muted)]">
                Elige tu sector para recorrer solo las pantallas de tu operación, sin mezclar capturas entre industrias.
                Haz clic en cualquier vista para ampliarla.
              </p>
            </div>

            <div
              className="inline-flex flex-wrap rounded-lg border border-[var(--line)] bg-[var(--sheet)] p-1 gap-0.5 self-start lg:self-auto shrink-0"
              role="tablist"
              aria-label="Seleccionar sector en el recorrido de producto"
            >
              {(['hc', 'agua', 'energia'] as SectorKey[]).map((key) => {
                const active = tourSector === key;
                return (
                  <button
                    key={key}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => handleSelectSectorTab(key)}
                    className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                      active
                        ? 'bg-[var(--ink)] text-[var(--paper)]'
                        : 'text-[var(--muted)] hover:text-[var(--ink)]'
                    }`}
                  >
                    <span className={`w-2.5 h-1.5 rounded-xs ${SECTOR_META[key].barColor}`} aria-hidden="true" />
                    {SECTOR_META[key].label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active sector context header */}
          <div className="mb-10 pb-4 border-b border-[var(--line)] flex flex-wrap items-baseline justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className={`inline-block w-5 h-1.5 rounded ${SECTOR_META[tourSector].barColor}`} aria-hidden="true" />
              <h3 className="text-xl sm:text-2xl font-semibold text-[var(--ink)]">
                {SECTOR_META[tourSector].heading}
              </h3>
            </div>
            <p className="text-sm text-[var(--muted)]">{SECTOR_META[tourSector].subtitle}</p>
          </div>

          <div className="grid gap-16 lg:gap-20">
            {visibleTourRows.map((row, idx) => {
              const reversed = idx % 2 === 1;
              return (
                <div key={row.id} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                  <figure className={`lg:col-span-7 m-0 min-w-0 group ${reversed ? 'lg:order-2' : ''}`}>
                    <button
                      type="button"
                      onClick={() => setLightbox({ src: row.image, alt: row.alt, caption: row.caption })}
                      aria-label={`Ampliar captura: ${row.caption}`}
                      className="relative block w-full text-left rounded-xl border border-[var(--line)] bg-[var(--sheet)] overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-zoom-in"
                    >
                      <img
                        src={row.image}
                        width={row.width}
                        height={row.height}
                        alt={row.alt}
                        loading={idx === 0 ? 'eager' : 'lazy'}
                        referrerPolicy="no-referrer"
                        className="w-full h-auto block transition-transform duration-300 group-hover:scale-[1.01]"
                      />
                      <span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-[var(--ink)]/85 text-[var(--paper)] font-mono-tech text-[11px] opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity">
                        <Maximize2 className="w-3 h-3" aria-hidden="true" />
                        Ampliar vista
                      </span>
                    </button>
                    <figcaption className="mt-2.5 font-mono-tech text-xs text-[var(--muted)]">{row.caption}</figcaption>
                  </figure>

                  <div className={`lg:col-span-5 grid gap-4 min-w-0 ${reversed ? 'lg:order-1' : ''}`}>
                    <h4 className="text-2xl sm:text-3xl font-semibold text-[var(--ink)]">{row.title}</h4>
                    <p className="text-[var(--muted)] text-base leading-relaxed">{row.description}</p>
                    <div className="pt-2 border-t border-[var(--line)] flex flex-wrap gap-x-3 gap-y-1 font-mono-tech text-xs text-[var(--ink)]">
                      {row.specs.map((spec, sIdx) => (
                        <span key={spec} className="inline-flex items-center gap-3">
                          {sIdx > 0 && (
                            <span className="text-[var(--muted)]" aria-hidden="true">
                              ·
                            </span>
                          )}
                          <span>{spec}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Segmented Gallery: Más vistas — never mixes sectors */}
      <section id="vistas" className="py-20 sm:py-24 border-t border-[var(--line)]" aria-labelledby="vistas-h">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
            <div className="max-w-2xl">
              <p className="font-mono-tech text-xs uppercase tracking-[0.14em] text-[var(--crude)]">
                Galería por sector
              </p>
              <h2 id="vistas-h" className="mt-2 text-4xl sm:text-5xl font-semibold tracking-tight text-[var(--ink)]">
                Más vistas operativas de {galleryMode === 'grouped' ? 'cada industria' : SECTOR_META[galleryMode].label.toLowerCase()}
              </h2>
              <p className="mt-3 text-base sm:text-lg text-[var(--muted)]">
                Capturas organizadas estrictamente por vertical para que revises equipos 3D, plantas y unifilares de tu
                interés.
              </p>
            </div>

            <div
              className="inline-flex flex-wrap rounded-lg border border-[var(--line)] bg-[var(--sheet)] p-1 gap-0.5 self-start lg:self-auto shrink-0"
              role="group"
              aria-label="Filtrar galería de pantallas por sector"
            >
              {(
                [
                  ['hc', `Ductos (${countsBySector.hc})`],
                  ['agua', `Acueductos (${countsBySector.agua})`],
                  ['energia', `Redes eléctricas (${countsBySector.energia})`],
                  ['grouped', `Ver por sector (${GALLERY_VIEWS.length})`],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    setGalleryMode(key);
                    if (key !== 'grouped') setTourSector(key);
                  }}
                  aria-pressed={galleryMode === key}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    galleryMode === key
                      ? 'bg-[var(--ink)] text-[var(--paper)]'
                      : 'text-[var(--muted)] hover:text-[var(--ink)]'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {galleryMode === 'grouped' ? (
            <div className="grid gap-14">
              {(['hc', 'agua', 'energia'] as SectorKey[]).map((secKey, idx) => {
                const items = GALLERY_VIEWS.filter((v) => v.category === secKey);
                return (
                  <div
                    key={secKey}
                    className={idx > 0 ? 'pt-12 border-t border-[var(--line)]' : ''}
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-2 mb-6">
                      <h3 className="text-2xl font-semibold text-[var(--ink)] flex items-center gap-3">
                        <span className={`inline-block w-5 h-1.5 rounded ${SECTOR_META[secKey].barColor}`} aria-hidden="true" />
                        <span>
                          0{idx + 1}. {SECTOR_META[secKey].heading}
                        </span>
                      </h3>
                      <span className="font-mono-tech text-xs text-[var(--muted)]">{items.length} pantallas</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                      {items.map(renderGalleryCard)}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              {GALLERY_VIEWS.filter((item) => item.category === galleryMode).map(renderGalleryCard)}
            </div>
          )}
        </div>
      </section>

      {/* Accessible Fullscreen Lightbox */}
      {lightbox && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={lightbox.caption}
          onClick={() => setLightbox(null)}
          className="fixed inset-0 z-50 bg-[#0b161d]/90 flex items-center justify-center p-4 sm:p-8"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-6xl w-full rounded-xl border border-[var(--line)] bg-[var(--sheet)] overflow-hidden shadow-2xl"
          >
            <div className="flex items-center justify-between gap-4 px-4 py-3 border-b border-[var(--line)]">
              <p className="font-mono-tech text-xs text-[var(--ink)] truncate">{lightbox.caption}</p>
              <button
                type="button"
                onClick={() => setLightbox(null)}
                aria-label="Cerrar imagen ampliada"
                className="p-1.5 rounded-md border border-[var(--line)] text-[var(--ink)] hover:bg-[var(--paper)] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="max-h-[82vh] overflow-auto bg-[var(--paper)] flex items-center justify-center p-2">
              <img
                src={lightbox.src}
                alt={lightbox.alt}
                referrerPolicy="no-referrer"
                className="max-w-full max-h-[78vh] w-auto h-auto rounded-md"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
