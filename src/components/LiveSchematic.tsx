import { useEffect, useState } from 'react';
import type { LandingSegment } from './ProductTour';

type SchematicSector = 'hc' | 'agua' | 'energia';

interface StationInfo {
  id: string;
  name: string;
  kp: string;
  detail: string;
}

const HC_STATIONS: Record<string, StationInfo> = {
  EA1: {
    id: 'EA1',
    name: 'Estación Acacías 1 (EA1)',
    kp: 'Ramal 16″ · 4,62 km',
    detail: 'Recolección de campo Acacías hacia estación de rebombeo Castilla.',
  },
  EC1: {
    id: 'EC1',
    name: 'Estación Castilla 1 (EC1)',
    kp: 'Ramal 14″ · 2,74 km',
    detail: 'Aporte de crudo pesado 16,5–18,3 °API hacia nodo EBC.',
  },
  ECH: {
    id: 'ECH',
    name: 'Estación Chichimene (ECH)',
    kp: 'Ramal 16″ · 7,00 km',
    detail: 'Capacidad nominal de 109 KBPD conectada en KP 006+080.',
  },
  EBC: {
    id: 'EBC',
    name: 'Estación de Bombeo Castilla (EBC)',
    kp: 'KP 000+000',
    detail: 'Cabecera principal de línea troncal con transmisor PT-EBC-01 en servicio.',
  },
  ESF: {
    id: 'ESF',
    name: 'Estación San Fernando (ESF)',
    kp: 'KP 006+080',
    detail: 'Almacenamiento 600 kBbl · capacidad 390 KBPD · 5 bombas principales con VFD.',
  },
  EBA: {
    id: 'EBA',
    name: 'Estación de Bombeo Apiay (EBA)',
    kp: 'KP 049+900',
    detail: 'Entrega troncal 30″ de 49,9 km hacia sistema nacional de transporte.',
  },
};

const AGUA_STATIONS: Record<string, StationInfo> = {
  BOC: {
    id: 'BOC',
    name: 'Bocatoma Río Frío (BOC)',
    kp: 'Captación · 480 L/s',
    detail: 'Sondas en línea de turbiedad (0,62 NTU), pH y conductividad aguas arriba.',
  },
  PTAP: {
    id: 'PTAP',
    name: 'Planta Potabilizadora (PTAP)',
    kp: 'Res. 2115/2007',
    detail: 'Dosificación automática de cloro residual (1,12 mg/L) y macromedición de salida.',
  },
  TK1: {
    id: 'TK1',
    name: 'Tanque Cabecera Norte (TK1)',
    kp: '4.500 m³ · Nivel 4,2 m',
    detail: 'Control de nivel ultrasónico LoRaWAN y válvula reguladora de presión.',
  },
  SEC: {
    id: 'SEC',
    name: 'Sector Hidráulico 04 (SEC)',
    kp: 'IANC 20,4 % · 42 mca',
    detail: 'Balance continuo entre macromedidor de entrada (410 m³/h) y microcontadores.',
  },
  COL: {
    id: 'COL',
    name: 'Colector Sur (COL)',
    kp: 'Tramo 24″ · H₂S 1,8 ppm',
    detail: 'Monitoreo de gases peligrosos (H₂S/CH₄) y nivel en pozos de inspección.',
  },
  PTAR: {
    id: 'PTAR',
    name: 'Planta Tratamiento (PTAR)',
    kp: 'Res. 0631/2015 · DQO 94 mg/L',
    detail: 'Vigilancia de oxígeno disuelto, dosis UV y cumplimiento de vertimiento.',
  },
};

const ENERGIA_STATIONS: Record<string, StationInfo> = {
  SOL: {
    id: 'SOL',
    name: 'Parque Solar Cesar I (SOL)',
    kp: 'Generación · 43,9 MW',
    detail: 'Irradiancia 560 W/m² · 18 inversores centrales conectados por Modbus TCP.',
  },
  HID: {
    id: 'HID',
    name: 'Central Hidro Oriente (HID)',
    kp: '3× Francis · 59,98 Hz',
    detail: 'Supervisión de cota de embalse (1.545 msnm), vibración y potencia activa.',
  },
  SE1: {
    id: 'SE1',
    name: 'SE Elevadora 34,5/115 kV (SE1)',
    kp: 'DGA H₂ 52 ppm · 56,1 °C',
    detail: 'Monitoreo continuo de gases disueltos IEEE C57.104 e interruptor SF₆ 52-1.',
  },
  TOR: {
    id: 'TOR',
    name: 'Corredor Torres 115 kV (TOR)',
    kp: 'Vano 38,4 km · ACSR 477',
    detail: 'Tensión de línea 115,6 kV, corriente de fase y alertas de descargas parciales.',
  },
  SE2: {
    id: 'SE2',
    name: 'Subestación Valledupar (SE2)',
    kp: 'Barra 115/13,2 kV · IEC 61850',
    detail: 'Integración de relés IEDs, presión SF₆ (6,74 bar) y seccionadores de bahía.',
  },
  CIR: {
    id: 'CIR',
    name: 'Circuito Distribución 13,2 kV (CIR)',
    kp: 'Reconectador R-12 · DNP3',
    detail: 'Localización automática de fallas y despacho de cuadrilla de media tensión.',
  },
};

const fmt = (v: number, d = 0) =>
  v.toLocaleString('es-CO', { minimumFractionDigits: d, maximumFractionDigits: d });

interface LiveSchematicProps {
  activeSector?: LandingSegment;
}

export function LiveSchematic({ activeSector = 'todos' }: LiveSchematicProps) {
  const [mode, setMode] = useState<SchematicSector>(() => {
    if (activeSector === 'acueducto') return 'agua';
    if (activeSector === 'electrica') return 'energia';
    return 'hc';
  });

  const [selectedHc, setSelectedHc] = useState<string>('ESF');
  const [selectedAgua, setSelectedAgua] = useState<string>('SEC');
  const [selectedEnergia, setSelectedEnergia] = useState<string>('SE1');

  // Live drifting metrics
  const [psi, setPsi] = useState(903);
  const [bpd, setBpd] = useState(361191);
  const [hz, setHz] = useState(47.1);

  const [mca, setMca] = useState(42.3);
  const [caudalAgua, setCaudalAgua] = useState(410);
  const [cloro, setCloro] = useState(1.12);

  const [kv, setKv] = useState(115.6);
  const [mw, setMw] = useState(43.9);
  const [freqElec, setFreqElec] = useState(59.98);

  useEffect(() => {
    if (activeSector === 'hidrocarburos') setMode('hc');
    else if (activeSector === 'acueducto') setMode('agua');
    else if (activeSector === 'electrica') setMode('energia');
  }, [activeSector]);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;

    const drift = (v: number, lo: number, hi: number) => {
      const span = hi - lo;
      return Math.min(hi, Math.max(lo, v + (Math.random() - 0.5) * span * 0.08 + ((lo + hi) / 2 - v) * 0.05));
    };

    const id = window.setInterval(() => {
      setPsi((p) => drift(p, 860, 950));
      setBpd((b) => drift(b, 352000, 372000));
      setHz((h) => drift(h, 45.5, 48.5));

      setMca((m) => drift(m, 39.5, 45.0));
      setCaudalAgua((q) => drift(q, 395, 425));
      setCloro((c) => drift(c, 0.95, 1.28));

      setKv((v) => drift(v, 114.4, 116.8));
      setMw((p) => drift(p, 41.8, 46.2));
      setFreqElec((f) => drift(f, 59.92, 60.05));
    }, 1600);

    return () => window.clearInterval(id);
  }, []);

  const st =
    mode === 'hc'
      ? HC_STATIONS[selectedHc]
      : mode === 'agua'
        ? AGUA_STATIONS[selectedAgua]
        : ENERGIA_STATIONS[selectedEnergia];

  const accentVar = mode === 'agua' ? 'var(--water)' : mode === 'energia' ? 'var(--electric)' : 'var(--crude)';

  return (
    <figure
      className="rounded-xl border border-[var(--line)] bg-[var(--sheet)] p-4 sm:p-5 shadow-sm m-0 min-w-0"
      aria-label="Esquema operativo interactivo en tiempo real"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-[var(--line)] font-mono-tech text-xs text-[var(--muted)]">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium text-[var(--ink)]">
            {mode === 'hc'
              ? 'Meta · Crudo pesado 16,5–18,3 °API'
              : mode === 'agua'
                ? 'Ciclo del agua · Captación → Red → PTAR'
                : 'Unifilar vivo · Generación → 115 kV → 13,2 kV'}
          </span>
        </div>

        <div
          className="inline-flex rounded-md border border-[var(--line)] bg-[var(--paper)] p-0.5 gap-0.5"
          role="group"
          aria-label="Cambiar industria del esquema en vivo"
        >
          {(
            [
              ['hc', 'Ductos'],
              ['agua', 'Acueducto'],
              ['energia', 'Eléctrica'],
            ] as [SchematicSector, string][]
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setMode(key)}
              aria-pressed={mode === key}
              className={`px-2.5 py-1 text-[11px] font-sans font-semibold rounded transition-colors cursor-pointer ${
                mode === key ? 'bg-[var(--ink)] text-[var(--paper)]' : 'text-[var(--muted)] hover:text-[var(--ink)]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        {mode === 'hc' && (
          <svg viewBox="0 0 1000 250" className="w-full min-w-[640px] h-auto block" role="img" aria-labelledby="sch-hc">
            <title id="sch-hc">
              Líneas EA1–EBC, EBC–ESF y ESF–Apiay con lecturas de presión, caudal y variador en vivo
            </title>

            <path d="M60 70 H250 V150" fill="none" stroke="var(--crude)" strokeWidth="4" opacity="0.72" />
            <path d="M60 220 H250 V160" fill="none" stroke="var(--crude)" strokeWidth="4" opacity="0.72" />
            <path d="M470 60 V150" fill="none" stroke="var(--crude)" strokeWidth="4" opacity="0.72" />

            <path d="M250 155 H940" fill="none" stroke="var(--crude)" strokeWidth="7" strokeLinecap="round" />
            <path
              d="M250 155 H940"
              fill="none"
              stroke="var(--crude-ink)"
              strokeWidth="2"
              opacity="0.78"
              className="schematic-flow"
            />

            <g className="font-mono-tech text-[11px]" fill="var(--muted)">
              <text x="250" y="186" textAnchor="middle">
                KP 000+000
              </text>
              <text x="470" y="186" textAnchor="middle">
                KP 006+080
              </text>
              <text x="940" y="186" textAnchor="middle">
                KP 049+900
              </text>
            </g>

            <g onClick={() => setSelectedHc('EA1')} className="cursor-pointer">
              <circle
                cx="60"
                cy="70"
                r="10"
                fill={selectedHc === 'EA1' ? 'var(--crude)' : 'var(--sheet)'}
                stroke="var(--ink)"
                strokeWidth="2"
              />
              <text x="78" y="66" fill="var(--ink)" fontFamily="var(--f-display)" fontWeight="600" fontSize="15">
                EA1 · Acacías 1
              </text>
              <text x="78" y="84" fill="var(--muted)" fontFamily="var(--f-mono)" fontSize="11">
                16″ · 4,62 km
              </text>
            </g>

            <g onClick={() => setSelectedHc('EC1')} className="cursor-pointer">
              <circle
                cx="60"
                cy="220"
                r="10"
                fill={selectedHc === 'EC1' ? 'var(--crude)' : 'var(--sheet)'}
                stroke="var(--ink)"
                strokeWidth="2"
              />
              <text x="78" y="216" fill="var(--ink)" fontFamily="var(--f-display)" fontWeight="600" fontSize="15">
                EC1 · Castilla 1
              </text>
              <text x="78" y="234" fill="var(--muted)" fontFamily="var(--f-mono)" fontSize="11">
                14″ · 2,74 km
              </text>
            </g>

            <g onClick={() => setSelectedHc('ECH')} className="cursor-pointer">
              <circle
                cx="470"
                cy="60"
                r="10"
                fill={selectedHc === 'ECH' ? 'var(--crude)' : 'var(--sheet)'}
                stroke="var(--ink)"
                strokeWidth="2"
              />
              <text x="488" y="56" fill="var(--ink)" fontFamily="var(--f-display)" fontWeight="600" fontSize="15">
                ECH · Chichimene
              </text>
              <text x="488" y="74" fill="var(--muted)" fontFamily="var(--f-mono)" fontSize="11">
                16″ · 7,00 km · 109 KBPD
              </text>
            </g>

            <g onClick={() => setSelectedHc('EBC')} className="cursor-pointer">
              <rect
                x="236"
                y="141"
                width="28"
                height="28"
                rx="4"
                fill={selectedHc === 'EBC' ? 'var(--crude)' : 'var(--sheet)'}
                stroke="var(--ink)"
                strokeWidth="2"
              />
              <text
                x="250"
                y="128"
                textAnchor="middle"
                fill="var(--ink)"
                fontFamily="var(--f-display)"
                fontWeight="600"
                fontSize="15"
              >
                EBC
              </text>
            </g>

            <g onClick={() => setSelectedHc('ESF')} className="cursor-pointer">
              <rect
                x="456"
                y="141"
                width="28"
                height="28"
                rx="4"
                fill={selectedHc === 'ESF' ? 'var(--crude)' : 'var(--sheet)'}
                stroke="var(--ink)"
                strokeWidth="2"
              />
              <text
                x="470"
                y="214"
                textAnchor="middle"
                fill="var(--ink)"
                fontFamily="var(--f-display)"
                fontWeight="600"
                fontSize="15"
              >
                ESF · San Fernando
              </text>
              <text x="470" y="230" textAnchor="middle" fill="var(--muted)" fontFamily="var(--f-mono)" fontSize="11">
                600 kBbl · 390 KBPD
              </text>
            </g>

            <g onClick={() => setSelectedHc('EBA')} className="cursor-pointer">
              <rect
                x="926"
                y="141"
                width="28"
                height="28"
                rx="4"
                fill={selectedHc === 'EBA' ? 'var(--crude)' : 'var(--sheet)'}
                stroke="var(--ink)"
                strokeWidth="2"
              />
              <text
                x="940"
                y="128"
                textAnchor="middle"
                fill="var(--ink)"
                fontFamily="var(--f-display)"
                fontWeight="600"
                fontSize="15"
              >
                EBA · Apiay
              </text>
            </g>

            <g transform="translate(560 90)">
              <rect width="155" height="42" rx="5" fill="var(--paper)" stroke="var(--line)" />
              <circle cx="14" cy="21" r="4" fill="var(--ok)" />
              <text x="26" y="16" fill="var(--muted)" fontFamily="var(--f-mono)" fontSize="11">
                PT-EBC-01 · presión
              </text>
              <text x="26" y="33" fill="var(--ink)" fontFamily="var(--f-mono)" fontWeight="500" fontSize="13">
                {fmt(psi, 0)} psi
              </text>
            </g>

            <g transform="translate(560 194)">
              <rect width="155" height="42" rx="5" fill="var(--paper)" stroke="var(--line)" />
              <circle cx="14" cy="21" r="4" fill="var(--ok)" />
              <text x="26" y="16" fill="var(--muted)" fontFamily="var(--f-mono)" fontSize="11">
                FT-ESF-01 · bombeo
              </text>
              <text x="26" y="33" fill="var(--ink)" fontFamily="var(--f-mono)" fontWeight="500" fontSize="13">
                {fmt(bpd, 0)} bpd
              </text>
            </g>

            <g transform="translate(750 90)">
              <rect width="155" height="42" rx="5" fill="var(--paper)" stroke="var(--line)" />
              <circle cx="14" cy="21" r="4" fill="var(--ok)" />
              <text x="26" y="16" fill="var(--muted)" fontFamily="var(--f-mono)" fontSize="11">
                VFD-ESF-01 · variador
              </text>
              <text x="26" y="33" fill="var(--ink)" fontFamily="var(--f-mono)" fontWeight="500" fontSize="13">
                {fmt(hz, 1)} Hz
              </text>
            </g>
          </svg>
        )}

        {mode === 'agua' && (
          <svg
            viewBox="0 0 1000 250"
            className="w-full min-w-[640px] h-auto block"
            role="img"
            aria-labelledby="sch-agua"
          >
            <title id="sch-agua">
              Esquema hidráulico Bocatoma, PTAP, Tanque Norte, Sector 04, Colector Sur y PTAR
            </title>

            <path d="M70 155 H930" fill="none" stroke="var(--water)" strokeWidth="7" strokeLinecap="round" />
            <path
              d="M70 155 H930"
              fill="none"
              stroke="var(--paper)"
              strokeWidth="2"
              opacity="0.82"
              className="schematic-flow"
            />

            {(
              [
                ['BOC', 70, 'BOC · Bocatoma', 'Captación'],
                ['PTAP', 240, 'PTAP · Potable', 'Res. 2115'],
                ['TK1', 415, 'TK1 · Tanque', '4.500 m³'],
                ['SEC', 595, 'SEC · Sector 04', 'IANC 20,4 %'],
                ['COL', 765, 'COL · Colector', 'Saneamiento'],
                ['PTAR', 930, 'PTAR · Efluente', 'Res. 0631'],
              ] as const
            ).map(([id, cx, title, sub]) => (
              <g key={id} onClick={() => setSelectedAgua(id)} className="cursor-pointer">
                <rect
                  x={cx - 14}
                  y="141"
                  width="28"
                  height="28"
                  rx="5"
                  fill={selectedAgua === id ? 'var(--water)' : 'var(--sheet)'}
                  stroke="var(--ink)"
                  strokeWidth="2"
                />
                <text
                  x={cx}
                  y="124"
                  textAnchor="middle"
                  fill="var(--ink)"
                  fontFamily="var(--f-display)"
                  fontWeight="600"
                  fontSize="15"
                >
                  {title}
                </text>
                <text
                  x={cx}
                  y="194"
                  textAnchor="middle"
                  fill="var(--muted)"
                  fontFamily="var(--f-mono)"
                  fontSize="11"
                >
                  {sub}
                </text>
              </g>
            ))}

            <g transform="translate(150 34)">
              <rect width="165" height="42" rx="5" fill="var(--paper)" stroke="var(--line)" />
              <circle cx="14" cy="21" r="4" fill="var(--ok)" />
              <text x="26" y="16" fill="var(--muted)" fontFamily="var(--f-mono)" fontSize="11">
                CL-PTAP-01 · cloro
              </text>
              <text x="26" y="33" fill="var(--ink)" fontFamily="var(--f-mono)" fontWeight="500" fontSize="13">
                {fmt(cloro, 2)} mg/L
              </text>
            </g>

            <g transform="translate(495 34)">
              <rect width="175" height="42" rx="5" fill="var(--paper)" stroke="var(--line)" />
              <circle cx="14" cy="21" r="4" fill="var(--ok)" />
              <text x="26" y="16" fill="var(--muted)" fontFamily="var(--f-mono)" fontSize="11">
                QM-SEC-04 · macromedidor
              </text>
              <text x="26" y="33" fill="var(--ink)" fontFamily="var(--f-mono)" fontWeight="500" fontSize="13">
                {fmt(caudalAgua, 0)} m³/h
              </text>
            </g>

            <g transform="translate(510 202)">
              <rect width="165" height="42" rx="5" fill="var(--paper)" stroke="var(--line)" />
              <circle cx="14" cy="21" r="4" fill="var(--ok)" />
              <text x="26" y="16" fill="var(--muted)" fontFamily="var(--f-mono)" fontSize="11">
                PT-SEC-04 · presión red
              </text>
              <text x="26" y="33" fill="var(--ink)" fontFamily="var(--f-mono)" fontWeight="500" fontSize="13">
                {fmt(mca, 1)} mca
              </text>
            </g>
          </svg>
        )}

        {mode === 'energia' && (
          <svg
            viewBox="0 0 1000 250"
            className="w-full min-w-[640px] h-auto block"
            role="img"
            aria-labelledby="sch-elec"
          >
            <title id="sch-elec">
              Diagrama unifilar en vivo: Parque Solar Cesar I, Central Hidro Oriente, SE 115 kV, Torres y Circuito 13,2 kV
            </title>

            <path d="M75 75 H260 V150" fill="none" stroke="var(--electric)" strokeWidth="4" opacity="0.78" />
            <path d="M75 215 H260 V160" fill="none" stroke="var(--electric)" strokeWidth="4" opacity="0.78" />
            <path d="M260 155 H925" fill="none" stroke="var(--electric)" strokeWidth="7" strokeLinecap="round" />
            <path
              d="M260 155 H925"
              fill="none"
              stroke="var(--paper)"
              strokeWidth="2"
              opacity="0.85"
              className="schematic-flow"
            />

            <g onClick={() => setSelectedEnergia('SOL')} className="cursor-pointer">
              <circle
                cx="75"
                cy="75"
                r="10"
                fill={selectedEnergia === 'SOL' ? 'var(--electric)' : 'var(--sheet)'}
                stroke="var(--ink)"
                strokeWidth="2"
              />
              <text x="95" y="71" fill="var(--ink)" fontFamily="var(--f-display)" fontWeight="600" fontSize="15">
                SOL · Parque Solar Cesar I
              </text>
              <text x="95" y="88" fill="var(--muted)" fontFamily="var(--f-mono)" fontSize="11">
                34,5 kV · 43,9 MW
              </text>
            </g>

            <g onClick={() => setSelectedEnergia('HID')} className="cursor-pointer">
              <circle
                cx="75"
                cy="215"
                r="10"
                fill={selectedEnergia === 'HID' ? 'var(--electric)' : 'var(--sheet)'}
                stroke="var(--ink)"
                strokeWidth="2"
              />
              <text x="95" y="211" fill="var(--ink)" fontFamily="var(--f-display)" fontWeight="600" fontSize="15">
                HID · Hidro Oriente
              </text>
              <text x="95" y="228" fill="var(--muted)" fontFamily="var(--f-mono)" fontSize="11">
                230/115 kV · 3× Francis
              </text>
            </g>

            {(
              [
                ['SE1', 260, 'SE1 · Trafo 115 kV', 'DGA H₂ · SF₆'],
                ['TOR', 490, 'TOR · Línea 115 kV', '38,4 km · ACSR'],
                ['SE2', 715, 'SE2 · SE Valledupar', 'IEC 61850'],
                ['CIR', 925, 'CIR · Circuito 13,2 kV', 'Reconectador R-12'],
              ] as const
            ).map(([id, cx, title, sub]) => (
              <g key={id} onClick={() => setSelectedEnergia(id)} className="cursor-pointer">
                <rect
                  x={cx - 14}
                  y="141"
                  width="28"
                  height="28"
                  rx="4"
                  fill={selectedEnergia === id ? 'var(--electric)' : 'var(--sheet)'}
                  stroke="var(--ink)"
                  strokeWidth="2"
                />
                <text
                  x={cx}
                  y="124"
                  textAnchor="middle"
                  fill="var(--ink)"
                  fontFamily="var(--f-display)"
                  fontWeight="600"
                  fontSize="15"
                >
                  {title}
                </text>
                <text
                  x={cx}
                  y="192"
                  textAnchor="middle"
                  fill="var(--muted)"
                  fontFamily="var(--f-mono)"
                  fontSize="11"
                >
                  {sub}
                </text>
              </g>
            ))}

            <g transform="translate(345 36)">
              <rect width="160" height="42" rx="5" fill="var(--paper)" stroke="var(--line)" />
              <circle cx="14" cy="21" r="4" fill="var(--ok)" />
              <text x="26" y="16" fill="var(--muted)" fontFamily="var(--f-mono)" fontSize="11">
                KV-115 · tensión barra
              </text>
              <text x="26" y="33" fill="var(--ink)" fontFamily="var(--f-mono)" fontWeight="500" fontSize="13">
                {fmt(kv, 1)} kV
              </text>
            </g>

            <g transform="translate(555 36)">
              <rect width="160" height="42" rx="5" fill="var(--paper)" stroke="var(--line)" />
              <circle cx="14" cy="21" r="4" fill="var(--ok)" />
              <text x="26" y="16" fill="var(--muted)" fontFamily="var(--f-mono)" fontSize="11">
                PM-SOL-01 · potencia
              </text>
              <text x="26" y="33" fill="var(--ink)" fontFamily="var(--f-mono)" fontWeight="500" fontSize="13">
                {fmt(mw, 1)} MW
              </text>
            </g>

            <g transform="translate(555 202)">
              <rect width="160" height="42" rx="5" fill="var(--paper)" stroke="var(--line)" />
              <circle cx="14" cy="21" r="4" fill="var(--ok)" />
              <text x="26" y="16" fill="var(--muted)" fontFamily="var(--f-mono)" fontSize="11">
                FR-SE2-01 · frecuencia
              </text>
              <text x="26" y="33" fill="var(--ink)" fontFamily="var(--f-mono)" fontWeight="500" fontSize="13">
                {fmt(freqElec, 2)} Hz
              </text>
            </g>
          </svg>
        )}
      </div>

      {/* Interactive station inspector bar */}
      <div className="mt-3 pt-3 border-t border-[var(--line)] flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex flex-wrap items-baseline gap-2">
          <span className="font-semibold text-[var(--ink)]">{st.name}</span>
          <span className="font-mono-tech" style={{ color: accentVar }}>
            {st.kp}
          </span>
          <span className="text-[var(--muted)]">{st.detail}</span>
        </div>
        <span className="font-mono-tech text-[11px] text-[var(--muted)]">
          Clic en cualquier nodo del esquema para inspeccionar
        </span>
      </div>
    </figure>
  );
}
