import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Check, Database, Menu, MessageCircle, Moon, Sun, X } from 'lucide-react';
import { PipeAnatomy3D } from './components/PipeAnatomy3D';
import { LiveSchematic } from './components/LiveSchematic';
import { DeviceCatalog } from './components/DeviceCatalog';
import { InteractiveHook } from './components/InteractiveHook';
import { LandingSegment, ProductTour } from './components/ProductTour';
import { ContactSection } from './components/ContactSection';
import { SolutionPage } from './components/SolutionPage';
import {
  CASE_SCENARIOS,
  FAQS,
  LICENSING_PILLARS,
  NORMS,
  ProductId,
  SATELLITE_SOLUTIONS,
  SECURITY_CHECKS,
  STEPS,
  VALUE_PILLARS,
} from './data/arteriaData';

type HeroSegment = LandingSegment;

const SCREENS = {
  ductos: {
    src: '/assets/aistudio/mapa-ductos.webp',
    w: 1902,
    h: 830,
    tag: 'Mapa 3D · Ductos',
    title: '63 equipos y 66 estaciones de ductos en una sola vista satelital',
    desc: 'Cada estación con su ícono y su estado. Arriba, uptime, equipos en nominal, advertencias, críticos y offline. La alerta crítica entra sola en la esquina.',
    alt: 'Mapa 3D satelital de Colombia en Arteria con oleoductos y gasoductos, 66 estaciones, indicadores de uptime y alerta crítica de caudal',
  },
  electrica: {
    src: '/assets/aistudio/mapa-electrico.webp',
    w: 1906,
    h: 890,
    tag: 'Mapa 3D · Redes eléctricas',
    title: 'Subestaciones, parques y torres con la frecuencia leída sobre el mapa',
    desc: 'Cuando la frecuencia de Cuestecitas sube a 60,3 Hz, la etiqueta aparece sobre la subestación y el contador de críticos marca 2.',
    alt: 'Mapa 3D satelital en Arteria con subestaciones y parques de generación, etiquetas de frecuencia en Hz y 2 alertas críticas',
  },
  flujo: {
    src: '/assets/aistudio/flujo-datos.webp',
    w: 1917,
    h: 916,
    tag: 'Flujo de datos',
    title: 'Qué equipo reporta, cuál se retrasó y cuál nunca envió dato',
    desc: 'Lecturas por minuto, estado de recepción por equipo y la ficha con tendencia de 24 h, lista para crear la OT.',
    alt: 'Pantalla de flujo de datos en Arteria con lecturas por minuto, tabla de equipos recibiendo datos y ficha de una cámara perimetral',
  },
  mantenimiento: {
    src: '/assets/aistudio/mantenimiento.webp',
    w: 1901,
    h: 906,
    tag: 'Mantenimiento',
    title: 'Órdenes abiertas, en curso y vencidas en un tablero',
    desc: 'Cada OT con su equipo, prioridad, técnico y fecha. Desde la orden se salta al equipo en el mapa 3D.',
    alt: 'Tablero de mantenimiento en Arteria con órdenes de trabajo abiertas, en curso y vencidas y el detalle de una calibración crítica',
  },
};

const HERO_COPY: Record<
  HeroSegment,
  {
    kicker: string;
    headlinePrefix: string;
    headlineAccent: string;
    headlineSuffix: string;
    lede: string;
    pipeProduct: ProductId;
  }
> = {
  todos: {
    kicker: 'Software IoT · Ductos, agua y redes eléctricas',
    headlinePrefix: 'Vea en ',
    headlineAccent: '3D',
    headlineSuffix: ' qué tramo falla antes de que llegue el reporte de campo',
    lede: 'Arteria pone sus ductos, acueductos y líneas eléctricas en un mapa 3D con la lectura en vivo de cada sensor. Cuando un valor sale de rango, abre la orden de trabajo y avisa al operario en campo.',
    pipeProduct: 'crudo',
  },
  hidrocarburos: {
    kicker: 'Oleoductos, gasoductos y poliductos',
    headlinePrefix: 'Integridad, MAOP y detección API 1130 en ',
    headlineAccent: '3D',
    headlineSuffix: ' sobre su derecho de vía',
    lede: 'Supervise presión, caudal, espesor UT (API 570), protección catódica y estaciones de bombeo en tiempo real sin intervenir la lógica de sus PLC SCADA.',
    pipeProduct: 'crudo',
  },
  acueducto: {
    kicker: 'Acueductos, distribución y PTAR',
    headlinePrefix: 'Reduzca agua no contabilizada y vigile calidad en ',
    headlineAccent: '3D',
    headlineSuffix: ' en tiempo real',
    lede: 'Cruce macromedición y consumo sectorial de forma continua, detecte fugas nocturnas desde 0,07 L/min y cumpla las Resoluciones 2115/2007 y 0631/2015.',
    pipeProduct: 'agua',
  },
  electrica: {
    kicker: 'Transmisión 230/115 kV, distribución y generación',
    headlinePrefix: 'Líneas eléctricas, subestaciones y parques en ',
    headlineAccent: '3D',
    headlineSuffix: ' con unifilar vivo',
    lede: 'Monitoree tensión, potencia, frecuencia (59,8–60,2 Hz), gases disueltos DGA en transformadores, gas SF₆ y descargas parciales desde un solo gemelo 3D.',
    pipeProduct: 'electrica',
  },
};

export default function App() {
  const [dark, setDark] = useState<boolean>(() => {
    try {
      const saved = window.localStorage.getItem('arteria-theme');
      if (saved === 'dark') return true;
      if (saved === 'light') return false;
    } catch {
      // ignore storage errors
    }
    return false;
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [heroSegment, setHeroSegment] = useState<HeroSegment>('todos');
  const [currentPath, setCurrentPath] = useState<string>(() => window.location.pathname);
  const [contactPrefill, setContactPrefill] = useState<{
    sector: string;
    msg: string;
    nonce: number;
  } | null>(null);

  const activeSolution = useMemo(
    () => SATELLITE_SOLUTIONS.find((s) => s.path === currentPath) ?? null,
    [currentPath]
  );

  const navigateTo = (path: string, hash?: string) => {
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path + (hash || ''));
      setCurrentPath(path);
    } else if (hash) {
      window.history.replaceState({}, '', path + hash);
    }
    if (hash) {
      window.setTimeout(() => {
        document.getElementById(hash.replace('#', ''))?.scrollIntoView({ behavior: 'smooth' });
      }, 60);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const onPopState = () => setCurrentPath(window.location.pathname);
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const handleSendDiagnostic = (sector: string, summary: string) => {
    setContactPrefill({ sector, msg: summary, nonce: Date.now() });
    if (activeSolution) {
      navigateTo('/', '#contacto');
    } else {
      document.getElementById('contacto')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Resolve dynamic SEO metadata (Title, Description, Canonical, OG) per route
  useEffect(() => {
    const defaultTitle = 'Arteria – Monitoreo IoT 3D de Ductos, Agua y Redes Eléctricas';
    const defaultDesc =
      'Monitoreo IoT en 3D para oleoductos, gasoductos, acueductos y redes eléctricas: sensores en vivo, diagrama unifilar, detección de fugas y órdenes de trabajo.';

    const title = activeSolution ? activeSolution.seoTitle : defaultTitle;
    const desc = activeSolution ? activeSolution.seoDescription : defaultDesc;
    const currentUrl = window.location.origin + window.location.pathname;

    document.title = title;
    document.querySelector('meta[name="description"]')?.setAttribute('content', desc);
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', title);
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', desc);
    document.querySelector('meta[name="twitter:title"]')?.setAttribute('content', title);
    document.querySelector('meta[name="twitter:description"]')?.setAttribute('content', desc);
    document.querySelector('link[rel="canonical"]')?.setAttribute('href', currentUrl);
    document.querySelector('meta[property="og:url"]')?.setAttribute('content', currentUrl);
    document
      .querySelector('meta[property="og:image"]')
      ?.setAttribute('content', `${window.location.origin}/assets/aistudio/og_c39f3180.jpg`);
    document
      .querySelector('meta[name="twitter:image"]')
      ?.setAttribute('content', `${window.location.origin}/assets/aistudio/og_c39f3180.jpg`);
  }, [activeSolution]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    try {
      window.localStorage.setItem('arteria-theme', dark ? 'dark' : 'light');
    } catch {
      // ignore storage errors
    }
  }, [dark]);

  const hero = HERO_COPY[heroSegment];

  return (
    <div className="min-h-screen flex flex-col bg-[var(--paper)] text-[var(--ink)]">
      <a
        href="#inicio"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:rounded-md focus:bg-[var(--ink)] focus:text-[var(--paper)] focus:text-sm focus:font-semibold"
      >
        Saltar al contenido
      </a>
      {/* Top Bar: strict 3-zone contract + Mobile drawer & persistent theme switch */}
      <header className="sticky top-0 z-30 border-b border-[var(--line)] bg-[var(--paper)]/92 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4 sm:gap-8">
          {/* Zone 1: Single-line brand wordmark */}
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              setMobileMenuOpen(false);
              navigateTo('/', '#inicio');
            }}
            aria-label="Arteria, ir al inicio"
            className="inline-flex items-center gap-2.5 font-display font-bold text-2xl tracking-wide uppercase text-[var(--ink)] no-underline whitespace-nowrap shrink-0"
          >
            <svg width="26" height="26" viewBox="0 0 28 28" aria-hidden="true" className="shrink-0">
              <circle cx="14" cy="14" r="12" fill="none" stroke="var(--coat)" strokeWidth="2.5" />
              <circle cx="14" cy="14" r="8.5" fill="none" stroke="var(--steel)" strokeWidth="3" />
              <circle cx="14" cy="14" r="4.5" fill="var(--crude)" />
            </svg>
            <span>Arteria</span>
          </a>

          {/* Zone 2: 5 concise single-line nav links */}
          <nav aria-label="Navegación principal" className="hidden md:flex items-center gap-6 text-sm font-medium">
            {[
              ['/#plataforma', '#plataforma', 'Plataforma'],
              ['/#dispositivos', '#dispositivos', 'Dispositivos'],
              ['/#diagnostico', '#diagnostico', 'Diagnóstico'],
              ['/#sectores', '#sectores', 'Sectores'],
              ['/#seguridad', '#seguridad', 'Seguridad'],
            ].map(([href, hash, label]) => (
              <a
                key={hash}
                href={href}
                onClick={(e) => {
                  if (activeSolution) {
                    e.preventDefault();
                    navigateTo('/', hash);
                  }
                }}
                className="text-[var(--muted)] hover:text-[var(--ink)] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
              >
                {label}
              </a>
            ))}
          </nav>

          {/* Zone 3: Theme Toggle + Primary CTA + Mobile Hamburger */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setDark((d) => !d)}
              title={dark ? 'Cambiar a lámina clara' : 'Cambiar a lámina oscura'}
              aria-label={dark ? 'Cambiar a lámina clara' : 'Cambiar a lámina oscura'}
              className="inline-flex items-center gap-1.5 px-2.5 py-2 rounded-md border border-[var(--line)] bg-[var(--sheet)] text-xs font-mono-tech text-[var(--muted)] hover:text-[var(--ink)] transition-colors cursor-pointer whitespace-nowrap"
            >
              {dark ? <Sun className="w-3.5 h-3.5" aria-hidden="true" /> : <Moon className="w-3.5 h-3.5" aria-hidden="true" />}
              <span className="hidden lg:inline">{dark ? 'Clara' : 'Oscura'}</span>
            </button>

            <a
              href="#contacto"
              onClick={(e) => {
                setMobileMenuOpen(false);
                if (activeSolution) {
                  e.preventDefault();
                  document.getElementById('contacto')?.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="px-3.5 sm:px-4 py-2 rounded-md bg-[var(--crude)] hover:bg-[var(--crude-hover)] text-[var(--crude-ink)] text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap shrink-0"
            >
              Ver mi KML en 3D
            </a>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((o) => !o)}
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? 'Cerrar menú de navegación' : 'Abrir menú de navegación'}
              className="md:hidden p-2 rounded-md border border-[var(--line)] bg-[var(--sheet)] text-[var(--ink)] cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <nav
            aria-label="Menú móvil"
            className="md:hidden border-t border-[var(--line)] bg-[var(--sheet)] px-4 py-3 grid gap-1"
          >
            {[
              ['/#plataforma', '#plataforma', 'Pantallas reales de la plataforma'],
              ['/#seguridad', '#seguridad', 'Seguridad y propiedad de los datos'],
              ['/#dispositivos', '#dispositivos', 'Dispositivos y sensores en vivo'],
              ['/#diagnostico', '#diagnostico', 'Calculadora de piloto (30 días)'],
              ['/#producto', '#producto', 'Recorrido de pantallas por sector'],
              ['/#sectores', '#sectores', 'Ductos, Acueductos y Redes eléctricas'],
              ['/#preguntas', '#preguntas', 'Preguntas frecuentes'],
            ].map(([href, hash, label]) => (
              <a
                key={hash}
                href={href}
                onClick={(e) => {
                  setMobileMenuOpen(false);
                  if (activeSolution) {
                    e.preventDefault();
                    navigateTo('/', hash);
                  }
                }}
                className="py-2 px-2 rounded-md text-sm font-medium text-[var(--ink)] hover:bg-[var(--paper)] transition-colors"
              >
                {label}
              </a>
            ))}
          </nav>
        )}
      </header>

      <main id="inicio" className="flex-1">
        {activeSolution ? (
          <>
            <SolutionPage
              solution={activeSolution}
              onNavigateHome={(hash) => navigateTo('/', hash)}
              onRequestKmlDemo={handleSendDiagnostic}
            />
            <ContactSection prefill={contactPrefill} />
          </>
        ) : (
          <>
        {/* Hero Section: Proposition + Audience Segmenter + Interactive 3D Cutaway Pipe */}
        <section className="blueprint-grid border-b border-[var(--line)] py-12 sm:py-16 lg:py-20" aria-label="Presentación">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            <div className="lg:col-span-5 grid gap-5 min-w-0">
              <p className="font-mono-tech text-xs uppercase tracking-[0.12em] text-[var(--crude)]">{hero.kicker}</p>

              {/* Immediate B2B Industry Segmenter — filters the entire landing page */}
              <div className="grid gap-1.5">
                <div
                  className="inline-flex flex-wrap rounded-md border border-[var(--line)] bg-[var(--sheet)] p-0.5 gap-0.5 self-start"
                  role="group"
                  aria-label="Seleccionar enfoque operativo para toda la página"
                >
                  {(
                    [
                      ['todos', 'Vista general'],
                      ['hidrocarburos', 'Ductos'],
                      ['acueducto', 'Acueductos'],
                      ['electrica', 'Redes eléctricas'],
                    ] as [HeroSegment, string][]
                  ).map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setHeroSegment(key)}
                      aria-pressed={heroSegment === key}
                      className={`px-3 py-2 text-xs font-medium rounded transition-colors cursor-pointer whitespace-nowrap ${
                        heroSegment === key
                          ? 'bg-[var(--ink)] text-[var(--paper)]'
                          : 'text-[var(--muted)] hover:text-[var(--ink)]'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <p className="font-mono-tech text-xs text-[var(--muted)]" aria-live="polite">
                  {heroSegment === 'todos'
                    ? 'Elige un sector para ver solo sus sensores, pantallas y diagnóstico.'
                    : 'Mostrando vista 3D, sensores, pantallas y diagnóstico filtrados para tu sector.'}
                </p>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-bold leading-[1.01] tracking-tight text-[var(--ink)]">
                {hero.headlinePrefix}
                <span className="text-[var(--crude)]">{hero.headlineAccent}</span>
                {hero.headlineSuffix}
              </h1>

              <p className="text-base sm:text-lg text-[var(--muted)] leading-relaxed max-w-xl">{hero.lede}</p>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <a
                  href="#contacto"
                  className="group inline-flex items-center gap-2 px-5 py-3 rounded-md bg-[var(--crude)] hover:bg-[var(--crude-hover)] text-[var(--crude-ink)] text-sm font-semibold shadow-sm transition-colors whitespace-nowrap shrink-0"
                >
                  Ver mi red en 3D en 48 h
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                </a>
                <a
                  href="#diagnostico"
                  className="px-5 py-3 rounded-md border border-[var(--line)] bg-[var(--sheet)] hover:border-[var(--ink)]/40 text-[var(--ink)] text-sm font-semibold transition-colors whitespace-nowrap shrink-0"
                >
                  Calcular mi piloto
                </a>
              </div>

              <ul className="grid gap-1.5 pt-1 list-none p-0 m-0 text-sm text-[var(--muted)]">
                {[
                  'Maqueta 3D gratuita con su trazado KML, KMZ o GeoJSON',
                  'Lee sus sensores y su SCADA actuales sin tocar la lógica de los PLC',
                  'Piloto de 30 días sobre un tramo real de su red',
                ].map((t) => (
                  <li key={t} className="flex items-start gap-2">
                    <Check className="w-4 h-4 mt-0.5 shrink-0 text-[var(--ok)]" aria-hidden="true" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:col-span-7 min-w-0">
              <PipeAnatomy3D preferredProduct={hero.pipeProduct} />
            </div>
          </div>
        </section>

        {/* Product screenshots: the real platform, map on the right like the hero */}
        <section
          id="plataforma"
          className="py-16 sm:py-20 border-b border-[var(--line)] bg-[var(--sheet-subtle)]"
          aria-labelledby="plataforma-h"
        >
          {(() => {
            const isElec = heroSegment === 'electrica';
            const main = isElec ? SCREENS.electrica : SCREENS.ductos;
            const rest = [isElec ? SCREENS.ductos : SCREENS.electrica, SCREENS.flujo, SCREENS.mantenimiento];
            return (
              <div className="max-w-6xl mx-auto px-4 sm:px-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
                  <div className="lg:col-span-4 grid gap-3">
                    <p className="font-mono-tech text-xs uppercase tracking-[0.14em] text-[var(--crude)]">
                      La plataforma · {main.tag}
                    </p>
                    <h2
                      id="plataforma-h"
                      className="text-3xl sm:text-4xl font-semibold tracking-tight text-[var(--ink)]"
                    >
                      Toda su red en un mapa satelital, con el estado de cada estación
                    </h2>
                    <p className="text-base text-[var(--muted)] leading-relaxed">{main.desc}</p>
                    <p className="text-sm text-[var(--muted)] leading-relaxed">
                      Su equipo abre el mapa, ve qué estación está en rojo, revisa la lectura y asigna la OT sin cambiar
                      de sistema. Pantallas reales con datos de demostración.
                    </p>
                    <a
                      href="#contacto"
                      className="group inline-flex items-center gap-2 self-start mt-1 px-5 py-3 rounded-md bg-[var(--crude)] hover:bg-[var(--crude-hover)] text-[var(--crude-ink)] text-sm font-semibold shadow-sm transition-colors"
                    >
                      Ver mi red así en 48 h
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                    </a>
                  </div>

                  <figure className="lg:col-span-8 m-0 min-w-0">
                    <a
                      href={main.src}
                      target="_blank"
                      rel="noopener"
                      className="block rounded-xl border border-[var(--line)] overflow-hidden shadow-xl"
                      aria-label={`Ampliar imagen: ${main.title}`}
                    >
                      <img
                        src={main.src}
                        width={main.w}
                        height={main.h}
                        alt={main.alt}
                        fetchPriority="high"
                        className="w-full h-auto block"
                      />
                    </a>
                    <figcaption className="mt-2.5 font-mono-tech text-xs text-[var(--muted)]">{main.title}</figcaption>
                  </figure>
                </div>

                <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
                  {rest.map((sc) => (
                    <figure
                      key={sc.src}
                      className="m-0 rounded-xl border border-[var(--line)] bg-[var(--sheet)] overflow-hidden flex flex-col transition-[border-color,box-shadow] hover:border-[var(--ink)]/30 hover:shadow-md"
                    >
                      <a href={sc.src} target="_blank" rel="noopener" className="block" aria-label={`Ampliar imagen: ${sc.title}`}>
                        <img
                          src={sc.src}
                          width={sc.w}
                          height={sc.h}
                          alt={sc.alt}
                          loading="lazy"
                          className="w-full aspect-video object-cover object-left-top block border-b border-[var(--line)]"
                        />
                      </a>
                      <figcaption className="p-5 grid gap-1.5">
                        <span className="font-mono-tech text-xs uppercase tracking-wider text-[var(--crude)]">{sc.tag}</span>
                        <strong className="font-display text-xl font-semibold leading-snug text-[var(--ink)]">{sc.title}</strong>
                        <span className="text-sm text-[var(--muted)] leading-relaxed">{sc.desc}</span>
                      </figcaption>
                    </figure>
                  ))}
                </div>
              </div>
            );
          })()}
        </section>

        {/* Problem Statement */}
        <section id="dolores" className="py-16 sm:py-20 border-b border-[var(--line)]" aria-labelledby="dolores-h">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="max-w-2xl mb-10">
              <p className="font-mono-tech text-xs uppercase tracking-[0.14em] text-[var(--crude)]">¿Le suena?</p>
              <h2 id="dolores-h" className="mt-2 text-4xl sm:text-5xl font-semibold tracking-tight text-[var(--ink)]">
                La información existe. Está en cinco lugares distintos.
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <blockquote
                className={`m-0 rounded-xl border bg-[var(--sheet)] p-5 flex flex-col justify-between gap-4 transition-colors ${
                  heroSegment === 'todos' ? 'border-[var(--line)]' : 'border-[var(--line)] opacity-85'
                }`}
              >
                <p className="font-display text-xl sm:text-2xl font-medium leading-snug text-[var(--ink)]">
                  “La alarma llegó al SCADA a las 2 a. m. La orden de trabajo se abrió en Excel dos días después.”
                </p>
                <footer className="font-mono-tech text-xs uppercase tracking-wider text-[var(--crude)]">
                  Operación · SCADA
                </footer>
              </blockquote>

              <blockquote
                className={`m-0 rounded-xl border bg-[var(--sheet)] p-5 flex flex-col justify-between gap-4 transition-colors ${
                  heroSegment === 'hidrocarburos'
                    ? 'border-[var(--crude)] ring-1 ring-[var(--crude)]/30'
                    : 'border-[var(--line)]'
                }`}
              >
                <p className="font-display text-xl sm:text-2xl font-medium leading-snug text-[var(--ink)]">
                  “Para saber el espesor de pared de ese tramo hay que buscar el último informe de ultrasonido en una
                  carpeta compartida.”
                </p>
                <footer className="font-mono-tech text-xs uppercase tracking-wider text-[var(--crude)]">
                  Ductos · Integridad UT
                </footer>
              </blockquote>

              <blockquote
                className={`m-0 rounded-xl border bg-[var(--sheet)] p-5 flex flex-col justify-between gap-4 transition-colors ${
                  heroSegment === 'acueducto'
                    ? 'border-[var(--water)] ring-1 ring-[var(--water)]/30'
                    : 'border-[var(--line)]'
                }`}
              >
                <p className="font-display text-xl sm:text-2xl font-medium leading-snug text-[var(--ink)]">
                  “El agua no contabilizada la calculamos una vez al año, cuando el regulador la pide.”
                </p>
                <footer className="font-mono-tech text-xs uppercase tracking-wider text-[var(--water)]">
                  Acueducto · IANC
                </footer>
              </blockquote>

              <blockquote
                className={`m-0 rounded-xl border bg-[var(--sheet)] p-5 flex flex-col justify-between gap-4 transition-colors ${
                  heroSegment === 'electrica'
                    ? 'border-[var(--electric)] ring-1 ring-[var(--electric)]/30'
                    : 'border-[var(--line)]'
                }`}
              >
                <p className="font-display text-xl sm:text-2xl font-medium leading-snug text-[var(--ink)]">
                  “El DGA del transformador, la presión SF₆ y la potencia del parque solar viven en tres consolas que no
                  se hablan.”
                </p>
                <footer className="font-mono-tech text-xs uppercase tracking-wider text-[var(--electric)]">
                  Redes eléctricas · Unifilar
                </footer>
              </blockquote>
            </div>

            <p className="mt-8 text-base sm:text-lg text-[var(--ink)] max-w-3xl leading-relaxed">
              Arteria junta el mapa 3D, la lectura de cada sensor, la alerta y la orden de trabajo en una sola pantalla.
              Cuando algo falla, su equipo ve el tramo exacto, la gravedad y qué operario tiene la orden abierta.
            </p>
          </div>
        </section>

        {/* Real Live Schematic — multi-sector interactive schematic */}
        <section id="red-real" className="py-16 sm:py-20 border-b border-[var(--line)]" aria-labelledby="red-real-h">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-4 grid gap-3">
              <p className="font-mono-tech text-xs uppercase tracking-[0.14em] text-[var(--crude)]">
                {heroSegment === 'acueducto'
                  ? 'Ejemplo en vivo · Acueducto y PTAR'
                  : heroSegment === 'electrica'
                    ? 'Ejemplo en vivo · Redes eléctricas'
                    : 'Ejemplo en vivo · Esquema operativo'}
              </p>
              <h2 id="red-real-h" className="text-3xl sm:text-4xl font-semibold tracking-tight text-[var(--ink)]">
                {heroSegment === 'acueducto'
                  ? 'Bocatoma – PTAP – Sector 04 – PTAR'
                  : heroSegment === 'electrica'
                    ? 'Parque Solar Cesar I – SE 115 kV – Circuito 13,2 kV'
                    : 'Sistema Chichimene – Castilla – San Fernando'}
              </h2>
              <p className="text-base text-[var(--muted)] leading-relaxed">
                {heroSegment === 'acueducto'
                  ? 'Así se supervisa el ciclo completo del agua en Arteria: cloro residual en planta, macromedición, presión sectorial y vertimiento a PTAR.'
                  : heroSegment === 'electrica'
                    ? 'Así se integra la generación renovable, la subestación elevadora 34,5/115 kV y la distribución de 13,2 kV en un esquema unifilar vivo.'
                    : 'Así se ve una red real en Arteria: cada tramo, nodo o subestación con su ficha técnica y las lecturas de sus instrumentos actualizándose en vivo.'}
              </p>
            </div>
            <div className="lg:col-span-8 min-w-0">
              <LiveSchematic activeSector={heroSegment} />
            </div>
          </div>
        </section>

        {/* Live Device Catalog */}
        <section id="dispositivos" className="py-20 sm:py-24" aria-labelledby="dispositivos-h">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="max-w-2xl mb-10">
              <p className="font-mono-tech text-xs uppercase tracking-[0.14em] text-[var(--crude)]">Dispositivos</p>
              <h2 id="dispositivos-h" className="mt-2 text-4xl sm:text-5xl font-semibold tracking-tight text-[var(--ink)]">
                Cada sensor, con su lectura y su rango de operación
              </h2>
              <p className="mt-3 text-base sm:text-lg text-[var(--muted)]">
                Equipos industriales que Arteria lee y vigila en vivo. La barra muestra la posición de la lectura dentro
                de su rango operativo. Valores de demostración actualizados en tiempo real.
              </p>
            </div>

            <DeviceCatalog activeSector={heroSegment} />
          </div>
        </section>

        {/* Interactive Engagement Hub: Network Sizing Calculator & Technical Checklist */}
        <InteractiveHook activeSector={heroSegment} onSendDiagnosticToContact={handleSendDiagnostic} />

        {/* Product Tour & Gallery — strictly segmented by sector */}
        <ProductTour activeSector={heroSegment} />

        {/* Sectors */}
        <section id="sectores" className="py-20 sm:py-24 border-t border-[var(--line)]" aria-labelledby="sectores-h">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="max-w-2xl mb-12">
              <p className="font-mono-tech text-xs uppercase tracking-[0.14em] text-[var(--crude)]">Sectores</p>
              <h2 id="sectores-h" className="mt-2 text-4xl sm:text-5xl font-semibold tracking-tight text-[var(--ink)]">
                Un producto para hidrocarburos, agua y redes eléctricas
              </h2>
              <p className="mt-3 text-base sm:text-lg text-[var(--muted)]">
                Cada empresa configura sus propias redes, subestaciones, plantas y tipos de equipo. Arteria adapta
                filtros, unidades, diagramas unifilares y reglas a su sector.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <article className="rounded-xl border border-[var(--line)] bg-[var(--sheet)] overflow-hidden flex flex-col justify-between transition-[border-color,box-shadow] hover:border-[var(--ink)]/30 hover:shadow-md">
                <div>
                  <img
                    src="/assets/aistudio/ducto_42a94bfc.jpg"
                    width={1600}
                    height={1000}
                    alt="Vista 3D de oleoducto San Fernando – Apiay en Arteria"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    className="w-full aspect-video object-cover border-b border-[var(--line)] block"
                  />
                  <div className="p-6 flex flex-col gap-5">
                    <div>
                      <h3 className="text-2xl font-semibold text-[var(--ink)] flex items-center gap-3">
                        <span className="inline-block w-5 h-1.5 rounded bg-[var(--crude)] shrink-0" aria-hidden="true" />
                        Oleoductos y gasoductos
                      </h3>
                      <p className="mt-2 text-sm text-[var(--muted)]">
                        Para operadores de midstream, poliductos y transporte de gas natural.
                      </p>
                    </div>

                    <table className="w-full border-collapse text-sm">
                      <tbody>
                        {[
                          ['Presión frente a MAOP', 'psi'],
                          ['Bombeo y custodia', 'bpd · mmscfd'],
                          ['Inventario de tanques', 'kBbl'],
                          ['Espesor de pared (UT)', 'mm'],
                          ['Protección catódica', 'mV'],
                          ['Viscosidad del crudo', 'cSt'],
                        ].map(([label, unit]) => (
                          <tr key={label} className="border-t border-[var(--line)]">
                            <td className="py-2.5 text-[var(--ink)]">{label}</td>
                            <td className="py-2.5 text-right font-mono-tech text-xs text-[var(--muted)] whitespace-nowrap pl-3">
                              {unit}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="px-6 py-4 border-t border-[var(--line)] flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setHeroSegment('hidrocarburos');
                      document.getElementById('producto')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--crude)] hover:underline underline-offset-4 cursor-pointer whitespace-nowrap"
                  >
                    Ver pantallas de ductos
                    <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                  <a
                    href="/soluciones/oleoductos-api-1130"
                    onClick={(e) => {
                      e.preventDefault();
                      navigateTo('/soluciones/oleoductos-api-1130');
                    }}
                    className="font-mono-tech text-xs text-[var(--muted)] hover:text-[var(--ink)] hover:underline underline-offset-4 whitespace-nowrap"
                  >
                    Página dedicada
                  </a>
                </div>
              </article>

              <article className="rounded-xl border border-[var(--line)] bg-[var(--sheet)] overflow-hidden flex flex-col justify-between transition-[border-color,box-shadow] hover:border-[var(--ink)]/30 hover:shadow-md">
                <div>
                  <img
                    src="/assets/aistudio/agua_e86174d9.jpg"
                    width={1600}
                    height={1000}
                    alt="Colector de aguas residuales hacia la PTAR en la vista 3D de Arteria"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    className="w-full aspect-video object-cover border-b border-[var(--line)] block"
                  />
                  <div className="p-6 flex flex-col gap-5">
                    <div>
                      <h3 className="text-2xl font-semibold text-[var(--ink)] flex items-center gap-3">
                        <span className="inline-block w-5 h-1.5 rounded bg-[var(--water)] shrink-0" aria-hidden="true" />
                        Acueductos y PTAR
                      </h3>
                      <p className="mt-2 text-sm text-[var(--muted)]">
                        Para empresas de servicios públicos, desde la bocatoma hasta la PTAR.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5" aria-label="Zonas del ciclo del agua">
                      {[
                        ['Captación', 'pH · turbiedad · cloro'],
                        ['Distribución', 'presión · caudal · fugas'],
                        ['Saneamiento', 'H₂S · metano · robots'],
                        ['Tratamiento', 'UV · ozono · DQO'],
                      ].map(([title, sub]) => (
                        <div key={title} className="rounded-md bg-[var(--water)]/10 p-2.5 text-xs leading-snug">
                          <strong className="block font-display text-sm font-semibold text-[var(--water)] mb-0.5">
                            {title}
                          </strong>
                          <span className="text-[var(--muted)]">{sub}</span>
                        </div>
                      ))}
                    </div>

                    <table className="w-full border-collapse text-sm">
                      <tbody>
                        {[
                          ['Agua no contabilizada', '%'],
                          ['Energía de bombeo', 'kWh/m³'],
                          ['Fuga nocturna', '≥ 0,07 L/min'],
                        ].map(([label, unit]) => (
                          <tr key={label} className="border-t border-[var(--line)]">
                            <td className="py-2.5 text-[var(--ink)]">{label}</td>
                            <td className="py-2.5 text-right font-mono-tech text-xs text-[var(--muted)] whitespace-nowrap pl-3">
                              {unit}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="px-6 py-4 border-t border-[var(--line)] flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setHeroSegment('acueducto');
                      document.getElementById('producto')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--water)] hover:underline underline-offset-4 cursor-pointer whitespace-nowrap"
                  >
                    Ver pantallas de acueducto
                    <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                  <a
                    href="/soluciones/agua-no-contabilizada-acueductos"
                    onClick={(e) => {
                      e.preventDefault();
                      navigateTo('/soluciones/agua-no-contabilizada-acueductos');
                    }}
                    className="font-mono-tech text-xs text-[var(--muted)] hover:text-[var(--ink)] hover:underline underline-offset-4 whitespace-nowrap"
                  >
                    Página dedicada
                  </a>
                </div>
              </article>

              <article className="rounded-xl border border-[var(--line)] bg-[var(--sheet)] overflow-hidden flex flex-col justify-between transition-[border-color,box-shadow] hover:border-[var(--ink)]/30 hover:shadow-md">
                <div>
                  <img
                    src="/assets/aistudio/image_cc72a94d.png"
                    width={1600}
                    height={900}
                    alt="Vista 3D de torres de transmisión eléctrica de 115 kV y Parque solar Cesar I en Arteria"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    className="w-full aspect-video object-cover border-b border-[var(--line)] block"
                  />
                  <div className="p-6 flex flex-col gap-5">
                    <div>
                      <h3 className="text-2xl font-semibold text-[var(--ink)] flex items-center gap-3">
                        <span className="inline-block w-5 h-1.5 rounded bg-[var(--electric)] shrink-0" aria-hidden="true" />
                        Redes eléctricas
                      </h3>
                      <p className="mt-2 text-sm text-[var(--muted)]">
                        Para transmisión 230/115 kV, distribución 13,2 kV, subestaciones y generación renovable.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5" aria-label="Etapas de la red eléctrica">
                      {[
                        ['Generación', 'solar · eólica · hidro'],
                        ['Transmisión', 'torres 230 / 115 kV'],
                        ['Subestaciones', 'DGA H₂ · aceite · SF₆'],
                        ['Distribución', '13,2 kV · reconectadores'],
                      ].map(([title, sub]) => (
                        <div key={title} className="rounded-md bg-[var(--electric)]/12 p-2.5 text-xs leading-snug">
                          <strong className="block font-display text-sm font-semibold text-[var(--electric)] mb-0.5">
                            {title}
                          </strong>
                          <span className="text-[var(--muted)]">{sub}</span>
                        </div>
                      ))}
                    </div>

                    <table className="w-full border-collapse text-sm">
                      <tbody>
                        {[
                          ['Tensión de barra / línea', 'kV'],
                          ['Potencia e irradiancia', 'MW · W/m²'],
                          ['Frecuencia y DGA H₂', 'Hz · ppm'],
                          ['Gas SF₆ y descargas', 'bar · pC'],
                        ].map(([label, unit]) => (
                          <tr key={label} className="border-t border-[var(--line)]">
                            <td className="py-2.5 text-[var(--ink)]">{label}</td>
                            <td className="py-2.5 text-right font-mono-tech text-xs text-[var(--muted)] whitespace-nowrap pl-3">
                              {unit}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="px-6 py-4 border-t border-[var(--line)] flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setHeroSegment('electrica');
                      document.getElementById('producto')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--electric)] hover:underline underline-offset-4 cursor-pointer whitespace-nowrap"
                  >
                    Ver pantallas eléctricas
                    <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                  <a
                    href="/soluciones/redes-electricas-subestaciones-3d"
                    onClick={(e) => {
                      e.preventDefault();
                      navigateTo('/soluciones/redes-electricas-subestaciones-3d');
                    }}
                    className="font-mono-tech text-xs text-[var(--muted)] hover:text-[var(--ink)] hover:underline underline-offset-4 whitespace-nowrap"
                  >
                    Página dedicada
                  </a>
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* Connectivity Protocols */}
        <section id="conexion" className="py-20 sm:py-24 border-t border-[var(--line)]" aria-labelledby="conexion-h">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="max-w-2xl mb-12">
              <p className="font-mono-tech text-xs uppercase tracking-[0.14em] text-[var(--crude)]">Conexión</p>
              <h2 id="conexion-h" className="mt-2 text-4xl sm:text-5xl font-semibold tracking-tight text-[var(--ink)]">
                Se conecta a los equipos que ya tiene
              </h2>
              <p className="mt-3 text-base sm:text-lg text-[var(--muted)]">
                Sus sensores actuales se quedan donde están. Los equipos nuevos publican directo a Arteria; los PLC y el
                SCADA existentes entran por un gateway que traduce sus protocolos.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  meta: 'Largo alcance · poco dato',
                  title: 'LPWAN',
                  desc: 'LoRaWAN, NB-IoT, Sigfox. Sensores a batería en tramos remotos de tubería.',
                },
                {
                  meta: 'Largo alcance · mucho dato',
                  title: 'Banda ancha',
                  desc: '5G privado, Wi-Fi 6. Video-inspección y operación crítica remota.',
                },
                {
                  meta: 'Planta y subestación · poco dato',
                  title: 'SCADA e IEDs eléctricos',
                  desc: 'Modbus, Profibus, DNP3, IEC 61850 e IEC 104. PLC de estaciones y relés de subestación vía gateway.',
                },
                {
                  meta: 'Hacia la nube',
                  title: 'IoT de alta eficiencia',
                  desc: 'MQTT, OPC UA, HTTP. Cada equipo con su propia clave de conexión.',
                },
              ].map((cell) => (
                <div
                  key={cell.title}
                  className="rounded-xl border border-[var(--line)] bg-[var(--sheet)] p-6 grid gap-1.5"
                >
                  <span className="font-mono-tech text-xs text-[var(--crude)]">{cell.meta}</span>
                  <h3 className="text-2xl font-semibold text-[var(--ink)]">{cell.title}</h3>
                  <p className="text-sm sm:text-base text-[var(--muted)]">{cell.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Measurable Value */}
        <section id="valor" className="py-20 sm:py-24 border-t border-[var(--line)]" aria-labelledby="valor-h">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="max-w-2xl mb-12">
              <p className="font-mono-tech text-xs uppercase tracking-[0.14em] text-[var(--crude)]">Valor medible</p>
              <h2 id="valor-h" className="mt-2 text-4xl sm:text-5xl font-semibold tracking-tight text-[var(--ink)]">
                Cuatro indicadores que Arteria calcula sola
              </h2>
              <p className="mt-3 text-base sm:text-lg text-[var(--muted)]">
                Se calculan con las lecturas de sus propios sensores. Las cifras de abajo corresponden a las redes de
                demostración.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {VALUE_PILLARS.map((p) => (
                <div key={p.kicker} className="border-t-2 border-[var(--crude)] pt-4 grid gap-1.5 content-start">
                  <span className="font-mono-tech text-xs uppercase tracking-wider text-[var(--muted)]">
                    {p.kicker}
                  </span>
                  <span className="font-display text-5xl font-bold leading-none tabular-nums text-[var(--ink)]">
                    {p.value}
                  </span>
                  <span className="text-sm font-semibold text-[var(--ink)]">{p.unit}</span>
                  <p className="text-sm text-[var(--muted)] leading-relaxed">{p.desc}</p>
                </div>
              ))}
            </div>

            <figure className="mt-10 m-0">
              <img
                src="/assets/aistudio/pilares_c3991efc.jpg"
                width={1600}
                height={1000}
                alt="Pantalla de analítica en Arteria con los cuatro pilares de valor y el estado de los equipos por conducción"
                loading="lazy"
                referrerPolicy="no-referrer"
                className="w-full h-auto rounded-xl border border-[var(--line)] shadow-sm"
              />
              <figcaption className="mt-2.5 font-mono-tech text-xs text-[var(--muted)]">
                Analítica · pilares de valor
              </figcaption>
            </figure>

            {/* Proof & Case Scenarios Adjacent to Value Claims */}
            <div className="mt-14 pt-12 border-t border-[var(--line)]">
              <div className="flex flex-wrap items-baseline justify-between gap-4 mb-8">
                <div>
                  <p className="font-mono-tech text-xs uppercase tracking-[0.14em] text-[var(--crude)]">
                    Arquitecturas de despliegue
                  </p>
                  <h3 className="mt-1 text-2xl sm:text-3xl font-semibold text-[var(--ink)]">
                    Cómo se traduce en operación real en Colombia
                  </h3>
                </div>
                <span className="font-mono-tech text-xs text-[var(--muted)]">
                  PostGIS · IEC 61850 · OPC UA · Modbus · DNP3 · LoRaWAN · MQTT
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {CASE_SCENARIOS.map((c) => (
                  <article
                    key={c.title}
                    className="rounded-xl border border-[var(--line)] bg-[var(--sheet)] p-6 grid gap-4 content-between"
                  >
                    <div className="grid gap-3">
                      <span className="font-mono-tech text-xs text-[var(--crude)]">{c.sector}</span>
                      <h4 className="font-display text-2xl font-semibold text-[var(--ink)] m-0">{c.title}</h4>
                      <dl className="grid gap-2.5 text-sm m-0 pt-2 border-t border-[var(--line)]">
                        <div>
                          <dt className="inline font-semibold text-[var(--ink)]">Antes: </dt>
                          <dd className="inline m-0 text-[var(--muted)]">{c.before}</dd>
                        </div>
                        <div>
                          <dt className="inline font-semibold text-[var(--ink)]">Con Arteria: </dt>
                          <dd className="inline m-0 text-[var(--muted)]">{c.change}</dd>
                        </div>
                        <div>
                          <dt className="inline font-semibold text-[var(--ok)]">Resultado esperado: </dt>
                          <dd className="inline m-0 text-[var(--ink)]">{c.outcome}</dd>
                        </div>
                      </dl>
                    </div>
                    <p className="pt-3 border-t border-[var(--line)] font-mono-tech text-xs text-[var(--muted)]">
                      {c.stack.join(' · ')}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Security & Norms */}
        <section id="seguridad" className="py-20 sm:py-24 border-t border-[var(--line)]" aria-labelledby="seguridad-h">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            <div>
              <p className="font-mono-tech text-xs uppercase tracking-[0.14em] text-[var(--crude)]">
                Seguridad de los datos
              </p>
              <h2 id="seguridad-h" className="mt-2 text-3xl sm:text-4xl font-semibold tracking-tight text-[var(--ink)]">
                Sus datos son suyos y cada empresa ve solo lo suyo
              </h2>

              <div className="mt-8 rounded-xl border-2 border-[var(--crude)]/40 bg-[var(--sheet)] p-5 sm:p-6 grid gap-3">
                <div className="flex items-center gap-3">
                  <span
                    aria-hidden="true"
                    className="w-10 h-10 rounded-lg bg-[var(--crude)]/12 text-[var(--crude)] grid place-items-center shrink-0"
                  >
                    <Database className="w-5 h-5" />
                  </span>
                  <strong className="font-display text-2xl font-semibold text-[var(--ink)]">
                    Acceso directo a su base de datos
                  </strong>
                </div>
                <p className="m-0 text-sm sm:text-base text-[var(--muted)] leading-relaxed">
                  Su empresa recibe acceso a su propia base de datos y al modelo de datos de Arteria: redes, estaciones,
                  equipos, lecturas, alertas y órdenes de trabajo. Su equipo de TI puede consultarla, conectar Power BI o
                  su SIG y auditar cada registro sin pedirnos un archivo.
                </p>
                <ul className="m-0 p-0 list-none grid sm:grid-cols-2 gap-2 text-sm text-[var(--ink)]">
                  {[
                    'Base de datos propia de su empresa',
                    'Modelo de datos entregado a su TI',
                    'Histórico de lecturas consultable',
                    'Si termina el contrato, se lleva todo',
                  ].map((t) => (
                    <li key={t} className="flex items-start gap-2">
                      <Check className="w-4 h-4 mt-0.5 shrink-0 text-[var(--ok)]" aria-hidden="true" />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <ul className="mt-8 grid gap-5 list-none p-0 m-0">
                {SECURITY_CHECKS.map((item) => (
                  <li key={item.title} className="flex items-start gap-3">
                    <span
                      aria-hidden="true"
                      className="mt-1 w-5 h-5 rounded border border-[var(--ok)]/50 bg-[var(--ok)]/10 text-[var(--ok)] grid place-items-center shrink-0"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </span>
                    <div>
                      <strong className="block font-semibold text-[var(--ink)]">{item.title}</strong>
                      <span className="block text-sm text-[var(--muted)] mt-0.5 leading-relaxed">{item.desc}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="font-mono-tech text-xs uppercase tracking-[0.14em] text-[var(--crude)]">
                Normas de referencia
              </p>
              <h2 className="mt-2 text-3xl sm:text-4xl font-semibold tracking-tight text-[var(--ink)]">
                Reglas con base técnica
              </h2>
              <dl className="mt-8 m-0">
                {NORMS.map((n) => (
                  <div
                    key={n.code}
                    className="grid grid-cols-1 sm:grid-cols-[10rem_minmax(0,1fr)] gap-1 sm:gap-4 py-3.5 border-t border-[var(--line)]"
                  >
                    <dt className="font-mono-tech text-sm font-medium text-[var(--ink)]">{n.code}</dt>
                    <dd className="m-0 text-sm text-[var(--muted)] leading-relaxed">{n.desc}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>

        {/* Implementation Steps */}
        <section
          id="implementacion"
          className="py-20 sm:py-24 border-t border-[var(--line)]"
          aria-labelledby="implementacion-h"
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="max-w-2xl mb-12">
              <p className="font-mono-tech text-xs uppercase tracking-[0.14em] text-[var(--crude)]">Cómo empezamos</p>
              <h2
                id="implementacion-h"
                className="mt-2 text-4xl sm:text-5xl font-semibold tracking-tight text-[var(--ink)]"
              >
                De su trazado a la operación
              </h2>
            </div>

            <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 list-none p-0 m-0">
              {STEPS.map((st, i) => (
                <li key={st.num} className="grid gap-2 content-start">
                  <div className="flex items-center gap-3">
                    <span className="font-display text-3xl font-bold text-[var(--crude)] tabular-nums">{st.num}.</span>
                    {i < STEPS.length - 1 && (
                      <span className="hidden lg:block flex-1 h-px border-t border-dashed border-[var(--line)]" />
                    )}
                  </div>
                  <h3 className="text-2xl font-semibold text-[var(--ink)]">{st.title}</h3>
                  <p className="text-sm text-[var(--muted)] leading-relaxed">{st.desc}</p>
                </li>
              ))}
            </ol>

            {/* Transparent Pilot & Licensing Model */}
            <div className="mt-12 rounded-xl border border-[var(--line)] bg-[var(--sheet)] p-6 sm:p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              {LICENSING_PILLARS.map((item) => (
                <div key={item.title} className="grid gap-1.5 content-start">
                  <h3 className="text-xl font-semibold text-[var(--ink)]">{item.title}</h3>
                  <p className="text-sm text-[var(--muted)] leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="preguntas" className="py-20 sm:py-24 border-t border-[var(--line)]" aria-labelledby="preguntas-h">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="max-w-2xl mb-10">
              <p className="font-mono-tech text-xs uppercase tracking-[0.14em] text-[var(--crude)]">
                Preguntas frecuentes
              </p>
              <h2 id="preguntas-h" className="mt-2 text-4xl sm:text-5xl font-semibold tracking-tight text-[var(--ink)]">
                Lo que suelen preguntar
              </h2>
            </div>

            <div className="max-w-3xl border-b border-[var(--line)]">
              {FAQS.map((item) => (
                <details key={item.q} className="group border-t border-[var(--line)] py-4">
                  <summary className="cursor-pointer list-none flex items-center justify-between gap-4 font-semibold text-base text-[var(--ink)]">
                    <span>{item.q}</span>
                    <span className="font-mono-tech text-lg text-[var(--crude)] group-open:hidden">+</span>
                    <span className="font-mono-tech text-lg text-[var(--crude)] hidden group-open:inline">–</span>
                  </summary>
                  <p className="mt-3 text-sm sm:text-base text-[var(--muted)] leading-relaxed max-w-2xl">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Lead Capture / Contact */}
        <ContactSection activeSector={heroSegment} prefill={contactPrefill} />
          </>
        )}
      </main>

      {/* Quiet Footer with Satellite SEO Solution Directory */}
      <footer className="border-t border-[var(--line)] py-12 text-sm text-[var(--muted)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 grid gap-8">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pb-6 border-b border-[var(--line)]">
            <span className="font-mono-tech text-xs uppercase tracking-wider text-[var(--ink)]">
              Soluciones por especialidad:
            </span>
            {SATELLITE_SOLUTIONS.map((sol) => (
              <a
                key={sol.slug}
                href={sol.path}
                onClick={(e) => {
                  e.preventDefault();
                  navigateTo(sol.path);
                }}
                className="text-xs hover:text-[var(--ink)] hover:underline underline-offset-4 transition-colors"
              >
                {sol.badge} · {sol.sectorType}
              </a>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-display font-bold uppercase tracking-wide text-base text-[var(--ink)]">
                Arteria
              </span>
              <span aria-hidden="true">·</span>
              <span>Monitoreo IoT para ductos, acueductos y redes eléctricas · Ingeniería en Colombia</span>
            </div>
            <div className="flex flex-wrap items-center gap-4 font-mono-tech text-xs">
              <a
                href="/#dispositivos"
                onClick={(e) => {
                  if (activeSolution) {
                    e.preventDefault();
                    navigateTo('/', '#dispositivos');
                  }
                }}
                className="hover:text-[var(--ink)] transition-colors"
              >
                Dispositivos
              </a>
              <a
                href="/#diagnostico"
                onClick={(e) => {
                  if (activeSolution) {
                    e.preventDefault();
                    navigateTo('/', '#diagnostico');
                  }
                }}
                className="hover:text-[var(--ink)] transition-colors"
              >
                Diagnóstico
              </a>
              <a
                href="/#contacto"
                onClick={(e) => {
                  if (activeSolution) {
                    e.preventDefault();
                    navigateTo('/', '#contacto');
                  }
                }}
                className="hover:text-[var(--ink)] transition-colors"
              >
                Contacto
              </a>
              <span aria-hidden="true">·</span>
              <span>Capturas y lecturas con datos de demostración</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Quick WhatsApp & KML Demo Action Pill */}
      <div className="fixed bottom-4 right-4 z-20 flex items-center gap-2">
        <a
          href="https://wa.me/573106933958?text=Hola%2C%20quiero%20ver%20mi%20red%20en%203D%20con%20Arteria."
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Hablar con ingeniería por WhatsApp"
          className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-full border border-white/15 bg-[#1f8f4e] hover:bg-[#1a7a42] text-white text-xs font-semibold shadow-lg transition-transform hover:scale-[1.02]"
        >
          <MessageCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span className="hidden sm:inline">WhatsApp Ingeniería</span>
        </a>
      </div>
    </div>
  );
}
