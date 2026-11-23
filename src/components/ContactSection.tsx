import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { Check, Copy, ExternalLink, FileCode2, Mail, Upload } from 'lucide-react';
import type { LandingSegment } from './ProductTour';

interface ContactSectionProps {
  activeSector?: LandingSegment;
  prefill?: {
    sector: string;
    msg: string;
    nonce: number;
  } | null;
}

interface ParsedGeoFile {
  fileName: string;
  sizeKb: string;
  format: 'KML' | 'KMZ' | 'GeoJSON';
  featuresCount: number;
  coordsCount: number;
}

export function ContactSection({ activeSector = 'todos', prefill }: ContactSectionProps) {
  const [name, setName] = useState('');
  const [org, setOrg] = useState('');
  const [email, setEmail] = useState('');
  const [sector, setSector] = useState('Oleoductos');
  const [msg, setMsg] = useState('');
  const [hasKml, setHasKml] = useState(true);
  const [parsedGeo, setParsedGeo] = useState<ParsedGeoFile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [preparedText, setPreparedText] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    if (activeSector === 'hidrocarburos') setSector('Oleoductos');
    else if (activeSector === 'acueducto') setSector('Acueducto');
    else if (activeSector === 'electrica') setSector('Redes eléctricas');
  }, [activeSector]);

  useEffect(() => {
    if (!prefill) return;
    setSector(prefill.sector);
    setMsg(prefill.msg);
  }, [prefill]);

  const handleFileInspect = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
    const sizeKb = (file.size / 1024).toFixed(1);
    const format: 'KML' | 'KMZ' | 'GeoJSON' =
      ext === 'kmz' ? 'KMZ' : ext === 'geojson' || ext === 'json' ? 'GeoJSON' : 'KML';

    let featuresCount = 1;
    let coordsCount = 0;

    try {
      if (format === 'KML') {
        const text = await file.text();
        const placemarks = text.match(/<Placemark\b/gi);
        const coordsBlocks = text.match(/<coordinates>([\s\S]*?)<\/coordinates>/gi) ?? [];
        featuresCount = placemarks ? placemarks.length : 1;
        coordsCount = coordsBlocks.reduce((acc, block) => {
          const inner = block.replace(/<\/?coordinates>/gi, '').trim();
          const pts = inner ? inner.split(/\s+/).length : 0;
          return acc + pts;
        }, 0);
      } else if (format === 'GeoJSON') {
        const text = await file.text();
        const json = JSON.parse(text);
        if (Array.isArray(json?.features)) {
          featuresCount = json.features.length;
        }
        const rawMatches = text.match(/\[\s*-?\d+\.\d+\s*,\s*-?\d+\.\d+/g);
        coordsCount = rawMatches ? rawMatches.length : featuresCount;
      }
    } catch {
      featuresCount = 1;
    }

    setHasKml(true);
    setParsedGeo({
      fileName: file.name,
      sizeKb,
      format,
      featuresCount,
      coordsCount,
    });
  };

  const handleCopy = async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      window.setTimeout(() => setCopiedKey(null), 1800);
    } catch {
      setCopiedKey(key);
      window.setTimeout(() => setCopiedKey(null), 1800);
    }
  };

  const buildLeadText = (trimmedName: string) => {
    const lines = [
      `Hola, soy ${trimmedName}${org.trim() ? ` de ${org.trim()}` : ''}.`,
      `Me interesa agendar una demo de Arteria para ${sector.toLowerCase()}.`,
    ];
    if (parsedGeo) {
      lines.push(
        `Archivo de trazado listo: ${parsedGeo.fileName} (${parsedGeo.format}, ${parsedGeo.sizeKb} KB, ${parsedGeo.featuresCount} elemento(s)${
          parsedGeo.coordsCount > 0 ? `, ~${parsedGeo.coordsCount} vértices GPS` : ''
        }) para la maqueta 3D gratuita en 48 h.`
      );
    } else if (hasKml) {
      lines.push('Cuento con trazado KML/KMZ/GeoJSON para solicitar la vista previa en 3D en 48 h.');
    }
    if (email.trim()) lines.push(`Correo de contacto: ${email.trim()}`);
    if (msg.trim()) lines.push(`\nNuestra red: ${msg.trim()}`);
    return lines.join('\n');
  };

  const validateAndPrepare = (): string | null => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Por favor ingresa tu nombre para preparar la solicitud.');
      document.getElementById('f-name')?.focus();
      return null;
    }
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Verifica el formato del correo electrónico.');
      document.getElementById('f-email')?.focus();
      return null;
    }
    setError(null);
    const text = buildLeadText(trimmedName);
    setPreparedText(text);
    return text;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const text = validateAndPrepare();
    if (!text) return;
    window.open(`https://wa.me/573106933958?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  };

  const handleSendEmail = () => {
    const text = validateAndPrepare();
    if (!text) return;
    const subject = encodeURIComponent(`Solicitud maqueta 3D Arteria – ${org.trim() || name.trim()} (${sector})`);
    const body = encodeURIComponent(text);
    window.location.href = `mailto:dinaelospino07@gmail.com?subject=${subject}&body=${body}`;
  };

  const waHref = preparedText
    ? `https://wa.me/573106933958?text=${encodeURIComponent(preparedText)}`
    : 'https://wa.me/573106933958?text=Hola%2C%20quiero%20ver%20mi%20red%20en%203D%20con%20Arteria.';

  return (
    <section id="contacto" className="py-20 sm:py-24 border-t border-[var(--line)]" aria-labelledby="contacto-h">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="rounded-2xl bg-[#0f222e] text-[#f2f4f5] p-6 sm:p-10 lg:p-12 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">
          <div className="flex flex-col justify-between gap-8">
            <div>
              <p className="font-mono-tech text-xs uppercase tracking-[0.14em] text-[#ee7a36]">
                Gancho sin compromiso · 48 horas
              </p>
              <h2 id="contacto-h" className="mt-2 text-4xl sm:text-5xl font-semibold tracking-tight text-white">
                Envíe su KML/KMZ y vea su red en 3D antes de decidir
              </h2>
              <p className="mt-4 text-base text-[#b8c6d0] max-w-md leading-relaxed">
                Compártanos el trazado o los datos de su red. En 48 horas le mostramos su corredor sobre relieve real y
                le indicamos qué equipos se conectan desde el primer día.
              </p>

              {/* Interactive Local KML/KMZ/GeoJSON Inspector */}
              <div className="mt-6 rounded-xl border border-white/15 bg-white/[0.04] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="font-mono-tech text-[11px] uppercase tracking-wider text-[#ee7a36]">
                      Validador local de trazado
                    </span>
                    <p className="text-xs text-[#d4e0e7] mt-0.5">
                      Seleccione su archivo <code className="font-mono-tech">.kml</code>,{' '}
                      <code className="font-mono-tech">.kmz</code> o <code className="font-mono-tech">.geojson</code>{' '}
                      para adjuntar sus metadatos técnicos a la solicitud (se analiza en su navegador, sin subir datos).
                    </p>
                  </div>
                  <FileCode2 className="w-5 h-5 text-[#ee7a36] shrink-0" aria-hidden="true" />
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-white/25 bg-white/10 hover:bg-white/15 text-xs font-semibold text-white cursor-pointer transition-colors">
                    <Upload className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>{parsedGeo ? 'Cambiar archivo KML/KMZ' : 'Inspeccionar mi KML / GeoJSON'}</span>
                    <input
                      type="file"
                      accept=".kml,.kmz,.geojson,.json"
                      onChange={handleFileInspect}
                      className="sr-only"
                    />
                  </label>

                  {parsedGeo && (
                    <span className="font-mono-tech text-xs text-[#3ccf7f] flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 shrink-0" />
                      {parsedGeo.fileName} · {parsedGeo.featuresCount} tramos/nodos
                      {parsedGeo.coordsCount > 0 ? ` · ${parsedGeo.coordsCount} pts GPS` : ''}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="grid gap-3 pt-4 border-t border-white/15 text-sm">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-[#9fb2c0] w-20">Correo</span>
                <span className="font-mono-tech text-white select-all">dinaelospino07@gmail.com</span>
                <button
                  type="button"
                  onClick={() => handleCopy('mail', 'dinaelospino07@gmail.com')}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded border border-white/25 font-mono-tech text-xs text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  {copiedKey === 'mail' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copiedKey === 'mail' ? 'Copiado' : 'Copiar'}
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <span className="text-[#9fb2c0] w-20">WhatsApp</span>
                <span className="font-mono-tech text-white select-all">+57 310 693 3958</span>
                <button
                  type="button"
                  onClick={() => handleCopy('phone', '+57 310 693 3958')}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded border border-white/25 font-mono-tech text-xs text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  {copiedKey === 'phone' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copiedKey === 'phone' ? 'Copiado' : 'Copiar'}
                </button>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} noValidate className="grid gap-4 content-start">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <label htmlFor="f-name" className="grid gap-1.5 text-sm text-[#d4e0e7]">
                Nombre *
                <input
                  id="f-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ing. Carlos Mendoza"
                  className="w-full rounded-md border border-white/25 bg-white/8 px-3 py-2.5 text-base text-white placeholder:text-white/40 focus:border-[#ee7a36] focus:outline-none"
                />
              </label>

              <label htmlFor="f-org" className="grid gap-1.5 text-sm text-[#d4e0e7]">
                Empresa
                <input
                  id="f-org"
                  name="org"
                  type="text"
                  autoComplete="organization"
                  value={org}
                  onChange={(e) => setOrg(e.target.value)}
                  placeholder="Empresa operadora"
                  className="w-full rounded-md border border-white/25 bg-white/8 px-3 py-2.5 text-base text-white placeholder:text-white/40 focus:border-[#ee7a36] focus:outline-none"
                />
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <label htmlFor="f-email" className="grid gap-1.5 text-sm text-[#d4e0e7]">
                Correo corporativo (opcional)
                <input
                  id="f-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nombre@empresa.com"
                  className="w-full rounded-md border border-white/25 bg-white/8 px-3 py-2.5 text-base text-white placeholder:text-white/40 focus:border-[#ee7a36] focus:outline-none"
                />
              </label>

              <label htmlFor="f-sector" className="grid gap-1.5 text-sm text-[#d4e0e7]">
                Sector
                <select
                  id="f-sector"
                  name="sector"
                  value={sector}
                  onChange={(e) => setSector(e.target.value)}
                  className="w-full rounded-md border border-white/25 bg-[#162c3a] px-3 py-2.5 text-base text-white focus:border-[#ee7a36] focus:outline-none"
                >
                  <option>Oleoductos</option>
                  <option>Gasoductos</option>
                  <option>Poliductos</option>
                  <option>Acueducto</option>
                  <option>Alcantarillado / PTAR</option>
                  <option>Redes eléctricas</option>
                  <option>Generación solar / eólica / hidro</option>
                  <option>Otro</option>
                </select>
              </label>
            </div>

            <label htmlFor="f-msg" className="grid gap-1.5 text-sm text-[#d4e0e7]">
              ¿Qué red quiere monitorear?
              <textarea
                id="f-msg"
                name="msg"
                rows={3}
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                placeholder="Ej.: 3 estaciones de bombeo, 120 km de línea de 16″, PLC Modbus."
                className="w-full rounded-md border border-white/25 bg-white/8 px-3 py-2.5 text-base text-white placeholder:text-white/40 focus:border-[#ee7a36] focus:outline-none resize-y"
              />
            </label>

            <label className="flex items-start gap-2.5 text-xs text-[#d4e0e7] cursor-pointer">
              <input
                type="checkbox"
                checked={hasKml}
                onChange={(e) => setHasKml(e.target.checked)}
                className="mt-0.5 accent-[#ee7a36] cursor-pointer"
              />
              <span>Tengo trazado en KML, KMZ o GeoJSON y quiero recibir la vista previa 3D gratuita en 48 h</span>
            </label>

            {error && (
              <p role="alert" className="text-sm text-[#ff8787] font-medium">
                {error}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-md bg-[#1f8f4e] hover:bg-[#1a7a42] text-white font-semibold text-sm transition-colors cursor-pointer whitespace-nowrap"
              >
                Enviar solicitud por WhatsApp
                <ExternalLink className="w-4 h-4" aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={handleSendEmail}
                className="inline-flex items-center gap-2 px-4 py-3 rounded-md bg-[#c95716] hover:bg-[#b24b11] text-white font-semibold text-sm transition-colors cursor-pointer whitespace-nowrap"
              >
                <Mail className="w-4 h-4" aria-hidden="true" />
                Enviar por correo
              </button>
            </div>

            {preparedText && (
              <div className="mt-1 rounded-lg border border-dashed border-white/30 bg-white/8 p-4 grid gap-3">
                <pre className="m-0 whitespace-pre-wrap font-mono-tech text-xs text-white leading-relaxed">
                  {preparedText}
                </pre>
                <div className="flex flex-wrap items-center gap-2.5">
                  <a
                    href={waHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-md bg-[#1f8f4e] hover:bg-[#1a7a42] text-white text-xs font-semibold transition-colors"
                  >
                    Abrir WhatsApp
                    <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                  </a>
                  <button
                    type="button"
                    onClick={() => handleCopy('lead-msg', preparedText)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md border border-white/30 font-mono-tech text-xs text-white hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    {copiedKey === 'lead-msg' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedKey === 'lead-msg' ? 'Mensaje copiado' : 'Copiar resumen'}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}
