import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { SatelliteSolution } from '../data/arteriaData';

interface SolutionPageProps {
  solution: SatelliteSolution;
  onNavigateHome: (hash?: string) => void;
  onRequestKmlDemo: (sector: string, prefillMsg: string) => void;
}

export function SolutionPage({ solution, onNavigateHome, onRequestKmlDemo }: SolutionPageProps) {
  return (
    <article className="py-14 sm:py-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 grid gap-12">
        <div>
          <button
            type="button"
            onClick={() => onNavigateHome()}
            className="inline-flex items-center gap-2 font-mono-tech text-xs text-[var(--muted)] hover:text-[var(--ink)] transition-colors cursor-pointer mb-6"
          >
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
            Volver a Arteria · Vista general
          </button>

          <p className="font-mono-tech text-xs uppercase tracking-[0.14em] text-[var(--crude)]">{solution.badge}</p>
          <h1 className="mt-2 text-4xl sm:text-5xl font-bold tracking-tight text-[var(--ink)] leading-[1.03]">
            {solution.h1}
          </h1>
          <p className="mt-4 text-lg text-[var(--muted)] max-w-3xl leading-relaxed">{solution.lede}</p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() =>
                onRequestKmlDemo(
                  solution.sectorType,
                  `Solicito maqueta 3D gratuita (48 h) con nuestro trazado KML/KMZ para ${solution.h1.toLowerCase()}.`
                )
              }
              className="inline-flex items-center gap-2 px-5 py-3 rounded-md bg-[var(--crude)] hover:bg-[var(--crude-hover)] text-[var(--crude-ink)] text-sm font-semibold transition-colors cursor-pointer"
            >
              Solicitar mi trazado KML/KMZ en 3D gratis (48 h)
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => onNavigateHome('#diagnostico')}
              className="px-5 py-3 rounded-md border border-[var(--line)] bg-[var(--sheet)] hover:border-[var(--ink)]/40 text-[var(--ink)] text-sm font-semibold transition-colors cursor-pointer"
            >
              Abrir calculadora de piloto
            </button>
          </div>
        </div>

        <figure className="m-0">
          <img
            src={solution.screenshot}
            alt={solution.screenshotAlt}
            referrerPolicy="no-referrer"
            className="w-full h-auto rounded-xl border border-[var(--line)] shadow-sm"
          />
          <figcaption className="mt-2.5 font-mono-tech text-xs text-[var(--muted)]">
            {solution.screenshotAlt}
          </figcaption>
        </figure>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {solution.highlights.map((item) => (
            <div
              key={item.title}
              className="rounded-xl border border-[var(--line)] bg-[var(--sheet)] p-6 grid gap-2 content-start"
            >
              <h2 className="text-2xl font-semibold text-[var(--ink)]">{item.title}</h2>
              <p className="text-sm text-[var(--muted)] leading-relaxed">{item.detail}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 rounded-xl border border-[var(--line)] bg-[var(--sheet)] p-6 sm:p-8">
          <div>
            <h2 className="text-2xl font-semibold text-[var(--ink)] mb-4">Normativa cubierta</h2>
            <ul className="grid gap-2.5 list-none p-0 m-0">
              {solution.norms.map((norm) => (
                <li key={norm} className="flex items-center gap-2.5 text-sm text-[var(--ink)]">
                  <Check className="w-4 h-4 text-[var(--ok)] shrink-0" aria-hidden="true" />
                  <span>{norm}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-[var(--ink)] mb-4">Protocolos compatibles</h2>
            <p className="font-mono-tech text-xs text-[var(--muted)] leading-relaxed">
              {solution.protocols.join(' · ')}
            </p>
            <p className="mt-3 text-sm text-[var(--muted)] leading-relaxed">
              Compatible con instrumentación instalada y gateways industriales con respaldo local ante caídas de señal en
              campo.
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}
