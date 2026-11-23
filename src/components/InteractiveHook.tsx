import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Check, SlidersHorizontal } from 'lucide-react';
import type { LandingSegment } from './ProductTour';

interface InteractiveHookProps {
  activeSector?: LandingSegment;
  onSendDiagnosticToContact: (sector: string, summary: string) => void;
}

type SectorOption = 'Oleoductos' | 'Gasoductos' | 'Acueducto' | 'Redes eléctricas';

const SECTOR_SPECS: Record<
  SectorOption,
  {
    subtitle: string;
    variables: string[];
    norms: { code: string; focus: string }[];
    protocols: string;
    deliverable48h: string;
  }
> = {
  Oleoductos: {
    subtitle: 'Integridad mecánica, balance de línea y estaciones de rebombeo',
    variables: [
      'Presión de descarga y succión frente a MAOP (psi)',
      'Caudal volumétrico y balance entre estaciones (API 1130)',
      'Espesor de pared por ultrasonido UT (API 570)',
      'Potencial de protección catódica en postes (−850 mV)',
      'Temperatura y viscosidad de crudo pesado (cSt)',
      'Vibración y frecuencia de variadores VFD en bombas',
    ],
    norms: [
      { code: 'API 1130', focus: 'Detección de fugas por balance de masa y gradiente de presión.' },
      { code: 'API 570', focus: 'Seguimiento de corrosión interna y vida remanente por tramo.' },
      { code: 'NACE SP0169', focus: 'Control continuo de potencial de protección catódica.' },
    ],
    protocols: 'OPC UA · Modbus TCP/RTU · DNP3 · HART · LoRaWAN',
    deliverable48h: 'Corredor 3D sobre relieve real, estaciones e hitos KP a partir de su archivo KML/KMZ.',
  },
  Gasoductos: {
    subtitle: 'Transporte troncal, city gates, regulación y medición de custodia',
    variables: [
      'Caudal en tiempo real en MMSCFD y totalizadores diarios',
      'Presión aguas arriba y abajo en trenes de regulación',
      'Nivel de odorización y temperatura en calentadores de gas',
      'Detección de gases peligrosos (CH₄, H₂S) en recintos',
      'Estado de válvulas de seccionamiento y trampas de raspador',
      'Disponibilidad e historial de calibración por instrumento',
    ],
    norms: [
      { code: 'API 1130 / ASME B31.8', focus: 'Integridad operativa y vigilancia de presión máxima MAOP.' },
      { code: 'Medición de custodia', focus: 'Trazabilidad horaria de entrega en city gates y transferencia.' },
      { code: 'Ley 1581/2012', focus: 'Aislamiento por rol, auditoría inmutable y datos por empresa.' },
    ],
    protocols: 'Modbus · DNP3 · OPC UA · MQTT · Enlace satelital / celular',
    deliverable48h: 'Trazado 3D del gasoducto con perfil de elevación y modelado típico de city gate.',
  },
  Acueducto: {
    subtitle: 'Red potable sectorizada, calidad en línea y colectores hacia PTAR',
    variables: [
      'Índice de agua no contabilizada (macromedidor vs. consumo)',
      'Detección de fugas domiciliarias nocturnas desde 0,07 L/min',
      'Calidad de agua potable: pH, turbiedad, cloro residual y conductividad',
      'Eficiencia energética de bombeo (kWh/m³ bombeado)',
      'Niveles de tanques, presión en sectores y cavitación en bombas',
      'Vertimientos en PTAR: oxígeno disuelto, DQO y dosis UV/ozono',
    ],
    norms: [
      { code: 'Res. 2115/2007', focus: 'Vigilancia continua de parámetros de calidad para consumo humano.' },
      { code: 'Res. 0631/2015', focus: 'Control de límites de vertimiento y carga orgánica (DQO) en PTAR.' },
      { code: 'Metas IANC (CRA)', focus: 'Reducción de pérdidas técnicas y comerciales en distribución.' },
    ],
    protocols: 'LoRaWAN · NB-IoT · MQTT · Modbus · Wi-Fi',
    deliverable48h: 'Sector hidráulico o conducción modelada en 3D desde captación hasta distribución o PTAR.',
  },
  'Redes eléctricas': {
    subtitle: 'Transmisión 230/115 kV, distribución 13,2 kV, subestaciones y generación renovable',
    variables: [
      'Tensión de barra y línea (13,2 kV, 110/115 kV y 230 kV)',
      'Potencia activa de inversores solares, eólicos e hidro (MW)',
      'Frecuencia de generación y desviaciones (59,8–60,2 Hz)',
      'Temperatura de aceite y H₂ disuelto (DGA) en transformadores',
      'Presión de gas SF₆ y descargas parciales en interruptores',
      'Irradiancia en sitio y flujo de datos de equipos en línea',
    ],
    norms: [
      { code: 'IEC 61850 / IEC 104', focus: 'Integración de IEDs, relés, RTUs y subestaciones sin tocar protecciones.' },
      { code: 'IEEE C57.104 (DGA)', focus: 'Diagnóstico temprano de gases disueltos y sobrecarga en transformadores.' },
      { code: 'RETIE · CREG 025', focus: 'Código de redes, estabilidad de frecuencia/tensión y trazabilidad operativa.' },
    ],
    protocols: 'IEC 61850 · DNP3 · IEC 60870-5-104 · Modbus TCP · MQTT',
    deliverable48h: 'Corredor de torres 3D, subestaciones y diagrama unifilar inicial a partir de su KML/KMZ.',
  },
};

export function InteractiveHook({ activeSector = 'todos', onSendDiagnosticToContact }: InteractiveHookProps) {
  const [sector, setSector] = useState<SectorOption>('Oleoductos');
  const [km, setKm] = useState<number>(65);
  const [stations, setStations] = useState<number>(4);

  useEffect(() => {
    if (activeSector === 'hidrocarburos') setSector('Oleoductos');
    else if (activeSector === 'acueducto') setSector('Acueducto');
    else if (activeSector === 'electrica') setSector('Redes eléctricas');
  }, [activeSector]);

  const calc = useMemo(() => {
    const recommendedSensors = Math.max(6, Math.round(km * 0.35 + stations * 4));
    const gatewayCount = Math.max(1, stations);
    const pilotScope =
      stations >= 3 ? `1 estación crítica + ${Math.min(25, km)} km iniciales` : `${stations} estación(es) + ${km} km`;
    const summary = `Red de ${sector.toLowerCase()} de ~${km} km con ${stations} estaciones/nodos.\nPiloto sugerido (30 días): ${pilotScope} (~${recommendedSensors} puntos de medición y ${gatewayCount} gateway(s) SCADA/IoT).\nMe interesa recibir la maqueta 3D gratis en 48 h con nuestro trazado KML/KMZ.`;
    return { recommendedSensors, gatewayCount, pilotScope, summary };
  }, [sector, km, stations]);

  const spec = SECTOR_SPECS[sector];

  return (
    <section
      id="diagnostico"
      className="py-20 sm:py-24 border-t border-[var(--line)] bg-[var(--sheet-subtle)]/50"
      aria-labelledby="diagnostico-h"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="max-w-2xl mb-10">
          <p className="font-mono-tech text-xs uppercase tracking-[0.14em] text-[var(--crude)]">
            Dimensionamiento rápido de piloto
          </p>
          <h2 id="diagnostico-h" className="mt-2 text-4xl sm:text-5xl font-semibold tracking-tight text-[var(--ink)]">
            Estime el alcance de su red antes de pedir la demo
          </h2>
          <p className="mt-3 text-base sm:text-lg text-[var(--muted)]">
            Seleccione su sector y el tamaño de su trazado para ver los puntos de telemetría sugeridos, las normas que
            cubre y el alcance de un piloto de 30 días.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left: Quick Network Sizing Calculator */}
          <div className="lg:col-span-5 rounded-xl border border-[var(--line)] bg-[var(--sheet)] p-6 flex flex-col justify-between gap-6">
            <div className="grid gap-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-2xl font-semibold text-[var(--ink)]">1. Configure su red</h3>
                  <p className="text-sm text-[var(--muted)] mt-1">
                    Cálculo orientativo de sensores, gateways y tramo piloto inicial.
                  </p>
                </div>
                <SlidersHorizontal className="w-5 h-5 text-[var(--crude)] shrink-0 mt-1" aria-hidden="true" />
              </div>

              <div className="grid gap-2">
                <span className="font-mono-tech text-xs text-[var(--muted)] uppercase tracking-wider">Sector</span>
                <div className="grid grid-cols-2 gap-1.5" role="group" aria-label="Sector de la red">
                  {(['Oleoductos', 'Gasoductos', 'Acueducto', 'Redes eléctricas'] as SectorOption[]).map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setSector(opt)}
                      aria-pressed={sector === opt}
                      className={`px-3 py-2 text-xs font-semibold rounded-md border transition-colors cursor-pointer whitespace-nowrap ${
                        sector === opt
                          ? 'bg-[var(--crude)] border-[var(--crude)] text-[var(--crude-ink)]'
                          : 'bg-[var(--paper)] border-[var(--line)] text-[var(--ink)] hover:border-[var(--ink)]/40'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-2">
                <div className="flex justify-between items-baseline">
                  <label htmlFor="calc-km" className="text-sm font-medium text-[var(--ink)]">
                    {sector === 'Redes eléctricas' ? 'Longitud de línea / circuito' : 'Longitud de tubería'}
                  </label>
                  <span className="font-mono-tech text-sm font-semibold tabular-nums text-[var(--crude)]">
                    {km} km
                  </span>
                </div>
                <input
                  id="calc-km"
                  type="range"
                  min={5}
                  max={400}
                  step={5}
                  value={km}
                  onChange={(e) => setKm(Number(e.target.value))}
                  className="w-full accent-[var(--crude)] cursor-pointer"
                />
              </div>

              <div className="grid gap-2">
                <div className="flex justify-between items-baseline">
                  <label htmlFor="calc-stations" className="text-sm font-medium text-[var(--ink)]">
                    Estaciones / nodos hidráulicos
                  </label>
                  <span className="font-mono-tech text-sm font-semibold tabular-nums text-[var(--crude)]">
                    {stations} nodos
                  </span>
                </div>
                <input
                  id="calc-stations"
                  type="range"
                  min={1}
                  max={24}
                  step={1}
                  value={stations}
                  onChange={(e) => setStations(Number(e.target.value))}
                  className="w-full accent-[var(--crude)] cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-[var(--line)]">
                <div>
                  <span className="block font-mono-tech text-[11px] text-[var(--muted)]">Puntos sugeridos</span>
                  <span className="font-display text-3xl font-bold tabular-nums text-[var(--ink)]">
                    {calc.recommendedSensors}
                  </span>
                </div>
                <div>
                  <span className="block font-mono-tech text-[11px] text-[var(--muted)]">Gateways SCADA</span>
                  <span className="font-display text-3xl font-bold tabular-nums text-[var(--ink)]">
                    {calc.gatewayCount}
                  </span>
                </div>
              </div>

              <div className="rounded-lg border border-[var(--line)] bg-[var(--paper)]/60 p-3.5 grid gap-1">
                <span className="font-mono-tech text-[11px] text-[var(--crude)]">
                  Piloto de 30 días: {calc.pilotScope}
                </span>
                <p className="text-xs text-[var(--muted)] leading-relaxed">{spec.deliverable48h}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onSendDiagnosticToContact(sector, calc.summary)}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-md bg-[var(--crude)] hover:bg-[var(--crude-hover)] text-[var(--crude-ink)] text-sm font-semibold transition-colors cursor-pointer"
            >
              Solicitar maqueta 3D gratis con mi KML/KMZ
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>

          {/* Right: Technical & Normative Coverage Card */}
          <div className="lg:col-span-7 rounded-xl border border-[var(--line)] bg-[var(--sheet)] p-6 flex flex-col justify-between gap-6">
            <div className="grid gap-5">
              <div>
                <span className="font-mono-tech text-xs uppercase tracking-wider text-[var(--crude)]">{sector}</span>
                <h3 className="mt-1 text-2xl font-semibold text-[var(--ink)]">
                  2. Variables y normas que vigila Arteria en este sector
                </h3>
                <p className="text-sm text-[var(--muted)] mt-1">{spec.subtitle}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {spec.variables.map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-2.5 rounded-lg border border-[var(--line)] bg-[var(--paper)]/60 p-3 text-sm text-[var(--ink)]"
                  >
                    <span
                      aria-hidden="true"
                      className="mt-0.5 w-4 h-4 rounded border border-[var(--ok)]/50 bg-[var(--ok)]/10 text-[var(--ok)] grid place-items-center shrink-0"
                    >
                      <Check className="w-3 h-3" />
                    </span>
                    <span className="leading-snug">{item}</span>
                  </div>
                ))}
              </div>

              <div className="grid gap-2 pt-2 border-t border-[var(--line)]">
                <span className="font-mono-tech text-xs uppercase tracking-wider text-[var(--muted)]">
                  Criterios normativos de referencia
                </span>
                <dl className="grid gap-2 m-0">
                  {spec.norms.map((norm) => (
                    <div
                      key={norm.code}
                      className="grid grid-cols-1 sm:grid-cols-[11rem_minmax(0,1fr)] gap-1 sm:gap-3 text-sm"
                    >
                      <dt className="font-mono-tech font-medium text-[var(--ink)]">{norm.code}</dt>
                      <dd className="m-0 text-[var(--muted)]">{norm.focus}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>

            <div className="pt-4 border-t border-[var(--line)] flex flex-wrap items-center justify-between gap-3">
              <span className="font-mono-tech text-xs text-[var(--muted)]">Protocolos: {spec.protocols}</span>
              <span className="font-mono-tech text-xs text-[var(--ok)] font-medium">
                Entrega preliminar en 48 h con KML/KMZ
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
