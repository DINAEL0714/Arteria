export type ProductId = 'crudo' | 'gas' | 'agua' | 'electrica';

export interface ProductSpec {
  id: ProductId;
  label: string;
  colorVar: string;
  hexLight: string;
  hexDark: string;
  legend: string;
  spec: string;
  speed: number;
  p: { v: number; lo: number; hi: number; d: number; u: string };
  q: { v: number; lo: number; hi: number; d: number; u: string };
  t: { v: number; lo: number; hi: number; d: number; u: string };
}

export const PRODUCTS: Record<ProductId, ProductSpec> = {
  crudo: {
    id: 'crudo',
    label: 'Crudo',
    colorVar: '--crude',
    hexLight: '#c95716',
    hexDark: '#ee7a36',
    legend: 'Crudo pesado en flujo',
    spec: 'API 5L X65 · 30″ · 12,7 mm',
    speed: 1,
    p: { v: 1100, lo: 1060, hi: 1140, d: 0, u: 'psi' },
    q: { v: 361000, lo: 352000, hi: 372000, d: 0, u: 'bpd' },
    t: { v: 74, lo: 70, hi: 78, d: 1, u: '°C' },
  },
  gas: {
    id: 'gas',
    label: 'Gas',
    colorVar: '--gas',
    hexLight: '#6358c8',
    hexDark: '#988ef0',
    legend: 'Gas natural en flujo',
    spec: 'API 5L X70 · 22″ · 11,1 mm',
    speed: 2.1,
    p: { v: 1090, lo: 1050, hi: 1120, d: 0, u: 'psi' },
    q: { v: 180, lo: 172, hi: 188, d: 1, u: 'mmscfd' },
    t: { v: 31, lo: 28, hi: 34, d: 1, u: '°C' },
  },
  agua: {
    id: 'agua',
    label: 'Agua',
    colorVar: '--water',
    hexLight: '#1b7fae',
    hexDark: '#4fb3e2',
    legend: 'Agua potable en flujo',
    spec: 'Acero · 16″ · 9,5 mm',
    speed: 0.7,
    p: { v: 48, lo: 45, hi: 52, d: 1, u: 'mca' },
    q: { v: 410, lo: 395, hi: 425, d: 0, u: 'm³/h' },
    t: { v: 18, lo: 16, hi: 20, d: 1, u: '°C' },
  },
  electrica: {
    id: 'electrica',
    label: 'Eléctrica',
    colorVar: '--electric',
    hexLight: '#b57c08',
    hexDark: '#eab308',
    legend: 'Flujo trifásico 115 kV (MW)',
    spec: 'Línea 115 kV · ACSR 477 · Trafo + SF₆',
    speed: 2.6,
    p: { v: 115.6, lo: 114.2, hi: 116.8, d: 1, u: 'kV' },
    q: { v: 59.98, lo: 59.9, hi: 60.06, d: 2, u: 'Hz' },
    t: { v: 56.1, lo: 53.5, hi: 58.8, d: 1, u: '°C' },
  },
};

export type DeviceZone = 'hc' | 'captacion' | 'distribucion' | 'saneamiento' | 'tratamiento' | 'energia';

export interface DeviceSpec {
  id: string;
  filter: DeviceZone;
  sector: 'hc' | 'agua' | 'energia';
  glyph: string;
  name: string;
  zoneLabel: string;
  unit: string;
  min: number;
  max: number;
  initial: number;
  decimals: number;
  description: string;
  protocols: string;
}

export const ZONE_LABELS: Record<DeviceZone, string> = {
  hc: 'Ductos',
  captacion: 'Agua · captación',
  distribucion: 'Agua · distribución',
  saneamiento: 'Agua · saneamiento',
  tratamiento: 'Agua · tratamiento',
  energia: 'Redes eléctricas',
};

export const DEVICES: DeviceSpec[] = [
  {
    id: 'pt-linea',
    filter: 'hc',
    sector: 'hc',
    glyph: 'P',
    name: 'Presión de línea',
    zoneLabel: ZONE_LABELS.hc,
    unit: 'psi',
    min: 900,
    max: 1300,
    initial: 1100,
    decimals: 0,
    description: 'Sobrepresión frente a la MAOP, golpe de ariete y caídas que delatan una fuga.',
    protocols: 'HART · Modbus · OPC UA',
  },
  {
    id: 'ft-bombeo',
    filter: 'hc',
    sector: 'hc',
    glyph: 'Q',
    name: 'Caudal de bombeo',
    zoneLabel: ZONE_LABELS.hc,
    unit: 'bpd',
    min: 352000,
    max: 372000,
    initial: 361000,
    decimals: 0,
    description: 'Balance de masa entre estaciones para detectar fugas (API 1130).',
    protocols: 'Modbus · OPC UA',
  },
  {
    id: 'tt-crudo',
    filter: 'hc',
    sector: 'hc',
    glyph: 'T',
    name: 'Temperatura del crudo',
    zoneLabel: ZONE_LABELS.hc,
    unit: '°C',
    min: 60,
    max: 90,
    initial: 74,
    decimals: 1,
    description: 'Pérdida de calentamiento que sube la viscosidad del crudo pesado.',
    protocols: 'Modbus · 4–20 mA',
  },
  {
    id: 'ut-espesor',
    filter: 'hc',
    sector: 'hc',
    glyph: 'Co',
    name: 'Espesor de pared (UT)',
    zoneLabel: ZONE_LABELS.hc,
    unit: 'mm',
    min: 8,
    max: 12.7,
    initial: 12.4,
    decimals: 2,
    description: 'Corrosión interna: avisa antes de llegar al espesor mínimo (API 570).',
    protocols: 'LoRaWAN · NB-IoT',
  },
  {
    id: 'cp-potencial',
    filter: 'hc',
    sector: 'hc',
    glyph: 'CP',
    name: 'Protección catódica',
    zoneLabel: ZONE_LABELS.hc,
    unit: 'mV',
    min: -1200,
    max: -850,
    initial: -1010,
    decimals: 0,
    description: 'Pérdida de protección del acero enterrado (NACE SP0169).',
    protocols: 'LoRaWAN · Sigfox',
  },
  {
    id: 'tk-inventario',
    filter: 'hc',
    sector: 'hc',
    glyph: 'Tk',
    name: 'Inventario de tanque',
    zoneLabel: ZONE_LABELS.hc,
    unit: 'kBbl',
    min: 60,
    max: 570,
    initial: 410,
    decimals: 0,
    description: 'Sobrellenado y faltantes de inventario por tanque.',
    protocols: 'Modbus · OPC UA',
  },
  {
    id: 'vfd-bomba',
    filter: 'hc',
    sector: 'hc',
    glyph: 'Hz',
    name: 'Variador de bomba (VFD)',
    zoneLabel: ZONE_LABELS.hc,
    unit: 'Hz',
    min: 35,
    max: 60,
    initial: 47,
    decimals: 1,
    description: 'Velocidad de bombeo según la viscosidad; detecta disparos y sobrecarga.',
    protocols: 'Profibus · Modbus',
  },
  {
    id: 'visc-crudo',
    filter: 'hc',
    sector: 'hc',
    glyph: 'cSt',
    name: 'Viscosidad del crudo',
    zoneLabel: ZONE_LABELS.hc,
    unit: 'cSt',
    min: 300,
    max: 770,
    initial: 540,
    decimals: 0,
    description: 'Crudo fuera de especificación antes de entrar al oleoducto.',
    protocols: 'Modbus',
  },
  {
    id: 'lds-acustico',
    filter: 'hc',
    sector: 'hc',
    glyph: '!',
    name: 'Detector acústico de fugas',
    zoneLabel: ZONE_LABELS.hc,
    unit: '%',
    min: 0,
    max: 20,
    initial: 6,
    decimals: 1,
    description: 'Ruido de escape en la pared del tubo, ubicado por abscisa KP.',
    protocols: 'NB-IoT · MQTT',
  },
  {
    id: 'w-ph',
    filter: 'captacion',
    sector: 'agua',
    glyph: 'pH',
    name: 'pH',
    zoneLabel: ZONE_LABELS.captacion,
    unit: 'pH',
    min: 6.5,
    max: 9,
    initial: 7.4,
    decimals: 2,
    description: 'Agua fuera de norma a la salida de la planta (Res. 2115/2007).',
    protocols: 'Modbus · MQTT',
  },
  {
    id: 'w-turb',
    filter: 'captacion',
    sector: 'agua',
    glyph: 'Tu',
    name: 'Turbiedad',
    zoneLabel: ZONE_LABELS.captacion,
    unit: 'NTU',
    min: 0,
    max: 2,
    initial: 0.6,
    decimals: 2,
    description: 'Falla de coagulación o filtros antes de entregar agua a la red.',
    protocols: 'Modbus · MQTT',
  },
  {
    id: 'w-cloro',
    filter: 'captacion',
    sector: 'agua',
    glyph: 'Cl',
    name: 'Cloro residual',
    zoneLabel: ZONE_LABELS.captacion,
    unit: 'mg/L',
    min: 0.3,
    max: 2,
    initial: 1.1,
    decimals: 2,
    description: 'Sub o sobredosificación de cloro en la red potable.',
    protocols: 'Modbus · MQTT',
  },
  {
    id: 'w-cond',
    filter: 'captacion',
    sector: 'agua',
    glyph: 'Ce',
    name: 'Conductividad',
    zoneLabel: ZONE_LABELS.captacion,
    unit: 'µS/cm',
    min: 50,
    max: 1000,
    initial: 320,
    decimals: 0,
    description: 'Intrusión salina o vertimientos aguas arriba de la bocatoma.',
    protocols: 'Modbus · LoRaWAN',
  },
  {
    id: 'w-dosif',
    filter: 'captacion',
    sector: 'agua',
    glyph: 'Dq',
    name: 'Bomba dosificadora',
    zoneLabel: ZONE_LABELS.captacion,
    unit: 'kg/h',
    min: 0.5,
    max: 5,
    initial: 2.4,
    decimals: 1,
    description: 'Bomba de químico detenida o con aire en la línea.',
    protocols: 'Modbus',
  },
  {
    id: 'w-pres',
    filter: 'distribucion',
    sector: 'agua',
    glyph: 'P',
    name: 'Presión de red',
    zoneLabel: ZONE_LABELS.distribucion,
    unit: 'mca',
    min: 15,
    max: 60,
    initial: 42,
    decimals: 1,
    description: 'Baja presión en el sector y roturas de tubería.',
    protocols: 'NB-IoT · LoRaWAN',
  },
  {
    id: 'w-macro',
    filter: 'distribucion',
    sector: 'agua',
    glyph: 'Q',
    name: 'Macromedidor de entrada',
    zoneLabel: ZONE_LABELS.distribucion,
    unit: 'm³/h',
    min: 300,
    max: 520,
    initial: 410,
    decimals: 0,
    description: 'Agua que entra al sector, base del cálculo de agua no contabilizada.',
    protocols: 'Modbus · MQTT',
  },
  {
    id: 'w-nivel',
    filter: 'distribucion',
    sector: 'agua',
    glyph: 'L',
    name: 'Nivel de tanque',
    zoneLabel: ZONE_LABELS.distribucion,
    unit: 'm',
    min: 0.5,
    max: 6,
    initial: 4.2,
    decimals: 2,
    description: 'Rebose o tanque vacío antes de que se quede sin agua el sector.',
    protocols: 'LoRaWAN · MQTT',
  },
  {
    id: 'w-cont',
    filter: 'distribucion',
    sector: 'agua',
    glyph: 'C',
    name: 'Contador de consumo',
    zoneLabel: ZONE_LABELS.distribucion,
    unit: 'm³/h',
    min: 240,
    max: 420,
    initial: 330,
    decimals: 0,
    description: 'Consumo facturable del sector frente a la entrada.',
    protocols: 'NB-IoT · LoRaWAN',
  },
  {
    id: 'w-dom',
    filter: 'distribucion',
    sector: 'agua',
    glyph: 'q',
    name: 'Flujo domiciliario',
    zoneLabel: ZONE_LABELS.distribucion,
    unit: 'L/min',
    min: 0,
    max: 12,
    initial: 3.1,
    decimals: 2,
    description: 'Fuga dentro de la vivienda: consumo de 0,07 L/min o más de madrugada.',
    protocols: 'Wi-Fi · MQTT',
  },
  {
    id: 'w-h2s',
    filter: 'saneamiento',
    sector: 'agua',
    glyph: 'H2S',
    name: 'Sulfuro de hidrógeno',
    zoneLabel: ZONE_LABELS.saneamiento,
    unit: 'ppm',
    min: 0,
    max: 10,
    initial: 2,
    decimals: 1,
    description: 'Atmósfera tóxica en pozos: prohíbe el ingreso antes de trabajar.',
    protocols: 'LoRaWAN · NB-IoT',
  },
  {
    id: 'w-ch4',
    filter: 'saneamiento',
    sector: 'agua',
    glyph: 'CH4',
    name: 'Metano',
    zoneLabel: ZONE_LABELS.saneamiento,
    unit: '%LEL',
    min: 0,
    max: 10,
    initial: 1.5,
    decimals: 1,
    description: 'Riesgo de explosión en colectores y estaciones de bombeo.',
    protocols: 'LoRaWAN · NB-IoT',
  },
  {
    id: 'w-uv',
    filter: 'tratamiento',
    sector: 'agua',
    glyph: 'UV',
    name: 'Dosis UV',
    zoneLabel: ZONE_LABELS.tratamiento,
    unit: 'mJ/cm²',
    min: 40,
    max: 120,
    initial: 78,
    decimals: 0,
    description: 'Desinfección insuficiente por lámparas o camisas sucias.',
    protocols: 'Modbus · OPC UA',
  },
  {
    id: 'w-o3',
    filter: 'tratamiento',
    sector: 'agua',
    glyph: 'O3',
    name: 'Ozono residual',
    zoneLabel: ZONE_LABELS.tratamiento,
    unit: 'mg/L',
    min: 0.1,
    max: 0.5,
    initial: 0.3,
    decimals: 2,
    description: 'Dosis de ozono fuera del rango de desinfección.',
    protocols: 'Modbus · OPC UA',
  },
  {
    id: 'w-od',
    filter: 'tratamiento',
    sector: 'agua',
    glyph: 'OD',
    name: 'Oxígeno disuelto',
    zoneLabel: ZONE_LABELS.tratamiento,
    unit: 'mg/L',
    min: 1.5,
    max: 3,
    initial: 2.2,
    decimals: 2,
    description: 'Aireación insuficiente o sopladores gastando energía de más.',
    protocols: 'Modbus · OPC UA',
  },
  {
    id: 'w-dqo',
    filter: 'tratamiento',
    sector: 'agua',
    glyph: 'DQO',
    name: 'DQO del efluente',
    zoneLabel: ZONE_LABELS.tratamiento,
    unit: 'mg/L',
    min: 0,
    max: 180,
    initial: 95,
    decimals: 0,
    description: 'Vertimiento por encima del límite (Res. 0631/2015).',
    protocols: 'Modbus · MQTT',
  },
  {
    id: 'w-lodos',
    filter: 'tratamiento',
    sector: 'agua',
    glyph: 'Lo',
    name: 'Nivel de lodos',
    zoneLabel: ZONE_LABELS.tratamiento,
    unit: 'm',
    min: 0.2,
    max: 1.8,
    initial: 0.9,
    decimals: 2,
    description: 'Purga de lodos pendiente antes de arrastrar sólidos.',
    protocols: 'Modbus · LoRaWAN',
  },
  {
    id: 'kv-barra',
    filter: 'energia',
    sector: 'energia',
    glyph: 'kV',
    name: 'Tensión de barra / línea',
    zoneLabel: ZONE_LABELS.energia,
    unit: 'kV',
    min: 109,
    max: 121,
    initial: 115.6,
    decimals: 1,
    description: 'Estabilidad de tensión en subestaciones de 115 kV, 230 kV y circuitos de 13,2 kV.',
    protocols: 'IEC 61850 · DNP3 · Modbus',
  },
  {
    id: 'mw-potencia',
    filter: 'energia',
    sector: 'energia',
    glyph: 'MW',
    name: 'Potencia activa',
    zoneLabel: ZONE_LABELS.energia,
    unit: 'MW',
    min: 10,
    max: 86,
    initial: 43.9,
    decimals: 1,
    description: 'Entrega en vivo de inversores solares, aerogeneradores y unidades hidroeléctricas.',
    protocols: 'IEC 61850 · Modbus · MQTT',
  },
  {
    id: 'hz-frecuencia',
    filter: 'energia',
    sector: 'energia',
    glyph: 'Hz',
    name: 'Frecuencia de generación',
    zoneLabel: ZONE_LABELS.energia,
    unit: 'Hz',
    min: 59.8,
    max: 60.2,
    initial: 59.95,
    decimals: 2,
    description: 'Desviaciones de frecuencia en barras y unidades generadoras bajo Código de Redes.',
    protocols: 'PMU · IEC 61850 · DNP3',
  },
  {
    id: 'to-aceite',
    filter: 'energia',
    sector: 'energia',
    glyph: 'T°',
    name: 'Temp. aceite transformador',
    zoneLabel: ZONE_LABELS.energia,
    unit: '°C',
    min: 20,
    max: 90,
    initial: 56.1,
    decimals: 1,
    description: 'Calentamiento en transformadores elevadores 34,5/115 kV y 230 kV antes de sobrecarga.',
    protocols: 'Modbus · IEC 61850',
  },
  {
    id: 'h2-dga',
    filter: 'energia',
    sector: 'energia',
    glyph: 'H₂',
    name: 'H₂ disuelto (DGA)',
    zoneLabel: ZONE_LABELS.energia,
    unit: 'ppm',
    min: 0,
    max: 100,
    initial: 52.0,
    decimals: 1,
    description: 'Análisis de gases disueltos en aceite de transformador para anticipar fallas dieléctricas.',
    protocols: 'IEC 60599 · Modbus · DNP3',
  },
  {
    id: 'sf6-presion',
    filter: 'energia',
    sector: 'energia',
    glyph: 'SF₆',
    name: 'Presión gas SF₆',
    zoneLabel: ZONE_LABELS.energia,
    unit: 'bar',
    min: 6.2,
    max: 7.2,
    initial: 6.73,
    decimals: 2,
    description: 'Fugas de gas aislante en interruptores de potencia y bahías de subestación.',
    protocols: 'IEC 61850 · DNP3',
  },
  {
    id: 'dp-parciales',
    filter: 'energia',
    sector: 'energia',
    glyph: 'pC',
    name: 'Descargas parciales',
    zoneLabel: ZONE_LABELS.energia,
    unit: 'pC',
    min: 0,
    max: 200,
    initial: 118,
    decimals: 0,
    description: 'Degradación temprana de aislamiento en interruptores, cables y bornes de alta tensión.',
    protocols: 'IEC 60270 · MQTT · HTTP',
  },
  {
    id: 'irr-solar',
    filter: 'energia',
    sector: 'energia',
    glyph: 'W',
    name: 'Irradiancia plano del panel',
    zoneLabel: ZONE_LABELS.energia,
    unit: 'W/m²',
    min: 150,
    max: 1100,
    initial: 558,
    decimals: 0,
    description: 'Referencia solar en sitio para validar el desempeño (PR) del campo fotovoltaico.',
    protocols: 'Modbus · LoRaWAN · MQTT',
  },
];

export type SectorKey = 'hc' | 'agua' | 'energia';

export interface TourRow {
  id: string;
  sector: SectorKey;
  image: string;
  width: number;
  height: number;
  caption: string;
  alt: string;
  title: string;
  description: string;
  specs: string[];
}

export const TOUR_ROWS: TourRow[] = [
  // --- DUCTOS (OLEODUCTOS, GASODUCTOS Y POLIDUCTOS) ---
  {
    id: 'relieve',
    sector: 'hc',
    image: '/assets/aistudio/ducto_42a94bfc.jpg',
    width: 1600,
    height: 1000,
    caption: 'Ductos · Vista 3D oleoducto ESF–Apiay',
    alt: 'Oleoducto San Fernando – Apiay en la vista 3D de Arteria con su ficha técnica: 49,9 km, 30 pulgadas, 390.000 bpd y perfil de elevación',
    title: 'La red de ductos sobre el relieve real',
    description:
      'Ductos, estaciones y sensores georreferenciados sobre imagen satelital y modelo de terreno de Colombia. Al elegir un ducto aparece su ficha: diámetro, longitud, capacidad, presión frente a MAOP, perfil de elevación y los departamentos que cruza.',
    specs: ['PostGIS', 'KP / abscisado', 'Corredor ±1 km', 'Importa KML · KMZ · GeoJSON'],
  },
  {
    id: 'estacion',
    sector: 'hc',
    image: '/assets/aistudio/estacion_2e3332db.jpg',
    width: 1600,
    height: 1000,
    caption: 'Ductos · Estación San Fernando (13 equipos)',
    alt: 'Estación San Fernando en 3D con tanques, bombas y la lista de equipos instrumentados con su lectura actual',
    title: 'Cada estación, en 3D y con sus equipos',
    description:
      'Tanques, bombas, medición y trampas de raspador, con la lectura de cada equipo al lado. Un clic en un equipo abre su ficha, su historial y sus órdenes de trabajo.',
    specs: ['Inventario kBbl', 'Bombas con VFD', 'Medición de custodia'],
  },
  {
    id: 'lecturas',
    sector: 'hc',
    image: '/assets/aistudio/sensor_dc223657.jpg',
    width: 1600,
    height: 1000,
    caption: 'Ductos · VFD-ESF-01 · 47,1 Hz · rango 35–60 Hz',
    alt: 'Variador de frecuencia de la bomba principal ubicado en el mapa, con lectura de 47,1 Hz, rango de 35 a 60 Hz y tendencia en vivo',
    title: 'Lecturas en vivo, con su rango de operación',
    description:
      'Los transmisores envían datos y la plataforma los evalúa al instante contra su rango. Si una lectura sale de rango se abre una alerta, y si es crítica, una orden correctiva. La pantalla se actualiza sola, sin recargar.',
    specs: ['Presión · caudal · temperatura', 'Corrosión UT (API 570)', 'Protección catódica'],
  },
  {
    id: 'mantenimiento-hc',
    sector: 'hc',
    image: '/assets/aistudio/tablero_bb918710.jpg',
    width: 1600,
    height: 1000,
    caption: 'Ductos · Tablero de órdenes de trabajo y notificaciones a operarios',
    alt: 'Tablero de mantenimiento en Arteria con órdenes abiertas, en curso y cerradas y despacho directo a operarios de campo',
    title: 'Diagnóstico que termina en orden de trabajo y avisa al operario',
    description:
      'Reglas de ingeniería convierten cada falla en una recomendación concreta y una orden con tipo y prioridad sugeridos. Al asignarla, Arteria notifica al operario en campo con la ubicación KP, el equipo afectado y los pasos sugeridos.',
    specs: ['Tablero · calendario · lista', 'Notificaciones de OT a operarios', 'Alertas por Telegram y correo'],
  },

  // --- ACUEDUCTOS Y SANEAMIENTO (PTAR) ---
  {
    id: 'agua-colector-3d',
    sector: 'agua',
    image: '/assets/aistudio/agua_e86174d9.jpg',
    width: 1600,
    height: 1000,
    caption: 'Acueductos · Colector Sur hacia PTAR por zona del ciclo del agua',
    alt: 'Colector de aguas residuales hacia la PTAR en la vista 3D de Arteria con filtros de captación, distribución, saneamiento y tratamiento',
    title: 'Todo el ciclo del agua sobre el trazado 3D real',
    description:
      'Separe su red por captación, distribución, saneamiento y tratamiento. Visualice presiones, caudales, calidad del agua potable (Res. 2115/2007) y límites de vertimiento en PTAR (Res. 0631/2015) sin salir del mapa.',
    specs: ['Captación · Distribución', 'Saneamiento · PTAR', 'Agua no contabilizada (IANC)'],
  },
  {
    id: 'agua-equipo-3d',
    sector: 'agua',
    image: '/assets/aistudio/image_0c6f51d7.png',
    width: 1600,
    height: 790,
    caption: 'Acueductos · Medidor domiciliario FL-BGA-002 (5,90 L/min) en 3D',
    alt: 'Módulo Dispositivos de Arteria para acueductos mostrando medidor de flujo domiciliario FL-BGA-002 en 3D leyendo 5.90 L/min en Bucaramanga',
    title: 'Inspección 3D por medidor y detección de fugas nocturnas',
    description:
      'Inspeccione macromedidores, válvulas y acometidas en 3D con su curva de las últimas 24 horas. Detecte fugas domiciliarias desde 0,07 L/min de madrugada y contraste entrada contra consumo facturable.',
    specs: ['Fugas desde 0,07 L/min', 'Tendencia 24 h', 'Salto al mapa 3D'],
  },
  {
    id: 'mantenimiento-agua',
    sector: 'agua',
    image: '/assets/aistudio/tablero_bb918710.jpg',
    width: 1600,
    height: 1000,
    caption: 'Acueductos · Despacho de órdenes de trabajo a cuadrillas',
    alt: 'Tablero de mantenimiento en Arteria con órdenes abiertas, en curso y cerradas y notificación automática a operarios de acueducto',
    title: 'De la alerta hidráulica al aviso inmediato a la cuadrilla',
    description:
      'Cuando cae la presión de un sector, falla una bomba dosificadora o se dispara un parámetro de calidad, Arteria abre la orden de trabajo y notifica directamente a los operarios asignados con el punto exacto y el historial del activo.',
    specs: ['Notificaciones de OT a operarios', 'Calibraciones y rutinas', 'Alertas por Telegram y correo'],
  },

  // --- REDES ELÉCTRICAS (TRANSMISIÓN, DISTRIBUCIÓN Y GENERACIÓN) ---
  {
    id: 'transmision-3d',
    sector: 'energia',
    image: '/assets/aistudio/image_1b05e468.png',
    width: 1600,
    height: 820,
    caption: 'Redes eléctricas · Línea 115 kV Parque solar Cesar I – SE Valledupar',
    alt: 'Vista 3D de torres de transmisión eléctrica de 115 kV en Cesar con lecturas flotantes de irradiancia, temperatura de aceite elevador, tensión y potencia de inversores',
    title: 'Líneas de transmisión, subestaciones y parques en 3D',
    description:
      'Filtre por circuitos de distribución (13,2 kV), subtransmisión (110/115 kV) y transmisión (230 kV) o por departamento. Cada torre, subestación y planta proyecta sus lecturas críticas directamente sobre el trazado satelital.',
    specs: ['Transmisión 230 kV', 'Subtransmisión 110/115 kV', 'Distribución 13,2 kV', 'Solar · Eólico · Hidro'],
  },
  {
    id: 'unifilar-modulos',
    sector: 'energia',
    image: '/assets/aistudio/image_43cc4ab7.png',
    width: 1600,
    height: 780,
    caption: 'Redes eléctricas · Diagrama unifilar Central hidroeléctrica Oriente',
    alt: 'Diagrama unifilar interactivo de Central hidroeléctrica Oriente dividido en Embalse y captación, Turbinas y generadores, Transformación con H2 disuelto DGA y Salida de línea 230 kV',
    title: 'Diagrama unifilar vivo por módulos de planta',
    description:
      'Supervise cada etapa eléctrica —embalse, generación, transformación y salida de línea— con lectura instantánea de DGA (H₂ disuelto), temperatura de aceite, frecuencia y tensión, sin perder el vínculo con el gemelo 3D.',
    specs: ['Diagrama unifilar interactivo', 'DGA H₂ y temp. aceite', 'Salto directo a Vista 3D'],
  },
  {
    id: 'solar-3d-unifilar-tour',
    sector: 'energia',
    image: '/assets/aistudio/image_059dc6ea.png',
    width: 1600,
    height: 790,
    caption: 'Redes eléctricas · Parque solar Cesar I (3D y unifilar integrados)',
    alt: 'Vista combinada 3D y diagrama unifilar del Parque solar Cesar I en Arteria mostrando campo fotovoltaico 540 W/m2, inversores 43.4 MW, subestación elevadora 46.5 °C y conexión a red 115 kV',
    title: 'Modelo 3D y unifilar sincronizados en la misma pantalla',
    description:
      'Recorra el campo fotovoltaico, inversores, transformadores elevadores y salida 115 kV en 3D mientras verifica el estado de cada módulo eléctrico y abre órdenes de trabajo con un clic.',
    specs: ['Campo FV · Inversores', 'Subestación elevadora', 'Conexión a red 115/230 kV'],
  },
  {
    id: 'flujo-datos-tour',
    sector: 'energia',
    image: '/assets/aistudio/image_2452dcee.png',
    width: 1600,
    height: 780,
    caption: 'Redes eléctricas · Flujo de datos, alarmas críticas y despacho de OT',
    alt: 'Pantalla de Flujo de datos de Arteria para red eléctrica mostrando 589 lecturas por minuto, estado de sensores de descargas parciales y SF6, y alerta crítica de frecuencia en 59.7 Hz',
    title: 'Salud de telemetría, alarmas críticas y aviso a operarios',
    description:
      'Detecte al instante equipos sin señal (descargas parciales, presión SF₆) o desviaciones críticas de frecuencia (59,7 Hz), dispare la orden de trabajo y notifique automáticamente al ingeniero o técnico de subestación.',
    specs: ['IEC 61850 · DNP3', 'Alertas SF₆ y frecuencia', 'Notificaciones de OT a operarios'],
  },
];

export interface GalleryViewItem {
  id: string;
  category: SectorKey;
  image: string;
  width: number;
  height: number;
  span: 'wide' | 'half' | 'tall';
  title: string;
  body: string;
  alt: string;
}

export const GALLERY_VIEWS: GalleryViewItem[] = [
  // --- DUCTOS (5 capturas) ---
  {
    id: 'equipo-3d-ducto',
    category: 'hc',
    image: '/assets/aistudio/image_e798f2d5.png',
    width: 1600,
    height: 790,
    span: 'wide',
    title: 'Inspección 3D de equipo en ductos (CO-ECH-01).',
    body: 'Transmisor ultrasónico de espesor de pared en Estación Chichimene (10,4 mm, rango 8–12,7 mm) con tendencia en vivo y enlace directo al mapa 3D.',
    alt: 'Módulo Dispositivos de Arteria para ductos mostrando modelo 3D interactivo del sensor de espesor de pared UT CO-ECH-01 en 10.4 mm en Estación Chichimene, Meta',
  },
  {
    id: 'gasoducto',
    category: 'hc',
    image: '/assets/aistudio/gasoducto-sensor_654b0452.webp',
    width: 1236,
    height: 551,
    span: 'half',
    title: 'Gasoducto en 3D con la ficha del sensor.',
    body: 'Lectura, rango operativo, última calibración y tendencia en vivo, sin salir del mapa.',
    alt: 'Gasoducto en la vista 3D con la ficha del medidor de caudal de Puente Guillermo: 191 MMSCFD, rango 160 a 220 y tendencia en vivo',
  },
  {
    id: 'citygate',
    category: 'hc',
    image: '/assets/aistudio/citygate-3d_03b74640.png',
    width: 1090,
    height: 557,
    span: 'half',
    title: 'City gate en 3D.',
    body: 'Trenes de regulación y medición, odorizador y calentador, con el caudal entregado a la ciudad.',
    alt: 'City gate de Sincelejo en 3D con trenes de regulación y medición, odorizador y calentador, y la lectura de caudal de gas',
  },
  {
    id: 'terminal',
    category: 'hc',
    image: '/assets/aistudio/terminal-3d_6ccb4b3f.png',
    width: 617,
    height: 372,
    span: 'half',
    title: 'Terminal en 3D.',
    body: 'Tanques, medición de transferencia, trampa de recibo y bombas de cargue.',
    alt: 'Terminal en 3D con seis tanques, medición de transferencia, trampa de recibo, sala de control y bombas de cargue',
  },
  {
    id: 'historial',
    category: 'hc',
    image: '/assets/aistudio/historial-equipo_63930df7.png',
    width: 220,
    height: 422,
    span: 'tall',
    title: 'Historial de cada equipo.',
    body: 'Órdenes pendientes y vencidas, y todo lo que se le ha hecho: rutinas, calibraciones e inspecciones, con fecha y técnico.',
    alt: 'Pestaña de mantenimiento de un equipo con una orden de calibración vencida y el historial de rutinas, calibraciones e inspecciones',
  },

  // --- ACUEDUCTOS Y SANEAMIENTO (2 capturas) ---
  {
    id: 'equipo-3d-acueducto',
    category: 'agua',
    image: '/assets/aistudio/image_0c6f51d7.png',
    width: 1600,
    height: 790,
    span: 'half',
    title: 'Medidor domiciliario en 3D para acueducto (FL-BGA-002).',
    body: 'Flujo de acometida en Bucaramanga (5,90 L/min, rango 0–12 L/min), curva de últimas 24 h y filtros por etapa del ciclo del agua.',
    alt: 'Módulo Dispositivos de Arteria para acueductos mostrando medidor de flujo domiciliario FL-BGA-002 en 3D leyendo 5.90 L/min en Bucaramanga, Santander',
  },
  {
    id: 'colector-ptar-agua',
    category: 'agua',
    image: '/assets/aistudio/agua_e86174d9.jpg',
    width: 1600,
    height: 1000,
    span: 'half',
    title: 'Colector Sur hacia PTAR en vista 3D.',
    body: 'Trazado de aguas residuales y potables con filtros por captación, distribución, saneamiento y tratamiento.',
    alt: 'Colector de aguas residuales hacia la PTAR en la vista 3D de Arteria con filtro por zona del ciclo del agua',
  },

  // --- REDES ELÉCTRICAS (9 capturas) ---
  {
    id: 'torres-cesar-relieve',
    category: 'energia',
    image: '/assets/aistudio/image_cc72a94d.png',
    width: 1600,
    height: 900,
    span: 'wide',
    title: 'Torres de transmisión 115 kV sobre relieve satelital.',
    body: 'Parque solar Cesar I y corredor de torres con etiquetas flotantes de irradiancia, temperatura de aceite elevador, tensión y potencia.',
    alt: 'Vista 3D de torres de transmisión eléctrica de 115 kV y Parque solar Cesar I sobre relieve satelital con lecturas de irradiancia, aceite elevador, tensión y potencia',
  },
  {
    id: 'equipo-3d-sf6',
    category: 'energia',
    image: '/assets/aistudio/image_d1c22baf.png',
    width: 1600,
    height: 790,
    span: 'half',
    title: 'Interruptor de potencia SF₆ en 3D (SF6-AGU-01).',
    body: 'Presión de gas aislante en tiempo real (6,78 bar, rango 6–7,5 bar) en el Parque eólico Alta Guajira con histórico y pestaña de mantenimiento.',
    alt: 'Módulo Dispositivos de Arteria para energía eléctrica mostrando interruptor de potencia SF6-AGU-01 en 3D con lectura de 6.78 bar en Parque eólico Alta Guajira, Uribia',
  },
  {
    id: 'hidro-3d-unifilar',
    category: 'energia',
    image: '/assets/aistudio/image_cab697d3.png',
    width: 1600,
    height: 790,
    span: 'half',
    title: 'Central hidroeléctrica Oriente: 3D y unifilar integrados.',
    body: 'Embalse, presa, casa de máquinas (3 turbinas Francis) y salida 230 kV sincronizados en la misma pantalla con la alarma del diagrama unifilar.',
    alt: 'Vista combinada 3D y diagrama unifilar de la Central hidroeléctrica Oriente en Arteria mostrando embalse, presa, casa de máquinas, transformadores elevadores y salida 230 kV con 1 equipo en alarma',
  },
  {
    id: 'parque-solar-3d',
    category: 'energia',
    image: '/assets/aistudio/image_4b14f01d.png',
    width: 1600,
    height: 820,
    span: 'half',
    title: 'Parque solar Cesar I en 3D.',
    body: 'Campo fotovoltaico, inversores, sala de control y subestación elevadora 34,5/115 kV entregando 44,0 MW.',
    alt: 'Modelo 3D del Parque solar Cesar I mostrando campo fotovoltaico, inversores, sala de control y subestación elevadora 34,5/115 kV con ficha en vivo de 44.0 MW',
  },
  {
    id: 'hidro-230kv',
    category: 'energia',
    image: '/assets/aistudio/image_d1307e89.png',
    width: 1600,
    height: 820,
    span: 'half',
    title: 'Central hidroeléctrica Oriente 230 kV.',
    body: 'Relieve andino en Ubalá con frecuencia de generación (59,8 Hz), nivel de embalse y H₂ disuelto en transformador.',
    alt: 'Vista 3D de Central hidroeléctrica Oriente en Cundinamarca con lectura en vivo de frecuencia 59.8 Hz, tensión 225 kV, nivel de embalse 1545 msnm y tendencia en tiempo real',
  },
  {
    id: 'ficha-inversores-115kv',
    category: 'energia',
    image: '/assets/aistudio/image_a640b446.png',
    width: 1200,
    height: 920,
    span: 'half',
    title: 'Telemetría por torre y punto de conexión.',
    body: 'Ficha de potencia de inversores (43,1 MW) con rango operativo, tendencia en vivo y botón directo para crear OT.',
    alt: 'Detalle 3D de torre de transmisión 115 kV en Parque solar Cesar I con ficha del medidor de potencia activa de inversores en 43.1 MW',
  },
  {
    id: 'alarma-unifilar',
    category: 'energia',
    image: '/assets/aistudio/image_a3ddd80d.png',
    width: 1600,
    height: 760,
    span: 'half',
    title: 'Aislamiento visual de fallas en unifilar.',
    body: 'Cuando la frecuencia sale de rango (59,7 Hz), el módulo de turbinas y generadores se marca en rojo al instante.',
    alt: 'Diagrama unifilar de Central hidroeléctrica Oriente marcando estado Crítico en el módulo Turbinas y generadores por frecuencia de 59.7 Hz',
  },
  {
    id: 'config-redes-electricas',
    category: 'energia',
    image: '/assets/aistudio/image_b3cf7ded.png',
    width: 1600,
    height: 760,
    span: 'wide',
    title: 'Configuración multi-tensión en una sola cuenta.',
    body: 'Gestione líneas de 230 kV, subtransmisión 110/115 kV y circuitos de distribución 13,2 kV con alertas críticas en vivo.',
    alt: 'Tabla de configuración de red eléctrica en Arteria con Circuito 13,2 kV Chía 3, Línea 110 kV Alta Guajira, Línea 115 kV Cesar I y Línea 230 kV Central Oriente',
  },
];

export const VALUE_PILLARS = [
  {
    kicker: 'Seguridad y riesgo',
    value: '0,9 min',
    unit: 'para reconocer una alerta',
    desc: 'Mediana desde que se dispara la alerta hasta que alguien la atiende.',
  },
  {
    kicker: 'Sostenibilidad y fugas',
    value: '20,4 %',
    unit: 'agua no contabilizada',
    desc: 'Entrada del macromedidor frente a consumo de los contadores.',
  },
  {
    kicker: 'Eficiencia energética',
    value: '0,29',
    unit: 'kWh por m³ bombeado',
    desc: 'Potencia de bombeo frente al caudal entregado.',
  },
  {
    kicker: 'Reducción de costos',
    value: '93 %',
    unit: 'mantenimiento planificado',
    desc: 'Órdenes preventivas e inspecciones frente a correctivas.',
  },
];

export const SECURITY_CHECKS = [
  {
    title: 'Separación por organización y por zona',
    desc: 'Un técnico de un ducto solo ve ese ducto. Una empresa nunca ve los datos de otra.',
  },
  {
    title: 'Roles y permisos',
    desc: 'Administrador, supervisor, operador, técnico y consulta, o roles propios.',
  },
  {
    title: 'Sesiones cortas y bloqueo por intentos',
    desc: 'Contraseñas con argon2, sesión de 15 minutos con renovación segura y límite de intentos por IP.',
  },
  {
    title: 'Registro de actividad inmutable',
    desc: 'Quién hizo qué, cuándo y desde dónde. No se puede editar ni borrar.',
  },
  {
    title: 'Pruebas de seguridad automatizadas',
    desc: 'Más de 40 pruebas en cada cambio: tokens falsos, inyección, acceso entre empresas, cabeceras y WebSocket.',
  },
];

export const NORMS = [
  { code: 'API 570', desc: 'Inspección de tuberías y control de espesor de pared.' },
  { code: 'API 1130', desc: 'Detección de fugas por balance y presión.' },
  { code: 'NACE SP0169', desc: 'Criterio de −850 mV para protección catódica.' },
  { code: 'IEC 61850 · IEEE C57.104', desc: 'Subestaciones, gases disueltos (DGA) en transformadores y SF₆.' },
  { code: 'RETIE · CREG 025', desc: 'Código de redes eléctricas, control de frecuencia (59,8–60,2 Hz) y tensión.' },
  { code: 'Res. 2115/2007', desc: 'Calidad del agua potable: pH, turbiedad, cloro.' },
  { code: 'Res. 0631/2015', desc: 'Límites de vertimiento, como la DQO del efluente.' },
  { code: 'Ley 1581/2012', desc: 'Tratamiento de datos personales de los operarios.' },
];

export const STEPS = [
  {
    num: '01',
    title: 'Diagnóstico',
    desc: 'Revisamos su red, sus equipos y cómo se comunican hoy. Usted comparte el trazado en KML, KMZ o GeoJSON.',
  },
  {
    num: '02',
    title: 'Piloto',
    desc: 'Un tramo o un sector con datos reales, para medir la línea base de sus indicadores.',
  },
  {
    num: '03',
    title: 'Integración',
    desc: 'Conexión del resto de equipos y del SCADA, usuarios por rol y zona, y notificaciones de alertas y órdenes de trabajo al celular de los operarios.',
  },
  {
    num: '04',
    title: 'Operación',
    desc: 'Soporte, nuevas reglas de diagnóstico, despacho automatizado a cuadrillas y reportes según lo que pida su operación.',
  },
];

export const FAQS = [
  {
    q: '¿Tengo que cambiar mis sensores o mi SCADA?',
    a: 'No. Los equipos que ya publican por MQTT, OPC UA o HTTP se conectan directo. Los que hablan Modbus, Profibus o DNP3 entran por un gateway, sin tocar la lógica de sus PLC.',
  },
  {
    q: '¿Cómo funciona el licenciamiento y cuánto cuesta empezar?',
    a: 'Se licencia por puntos de telemetría o estaciones activas, sin costos adicionales por cantidad de usuarios ni por almacenamiento histórico base. Puede iniciar con un piloto acotado de 30 días en un tramo o sector hidráulico antes de escalar a toda la red.',
  },
  {
    q: '¿Puedo ver mi propio trazado KML o KMZ en 3D antes de contratar?',
    a: 'Sí. Si nos comparte un archivo KML, KMZ o GeoJSON de su corredor o red de acueducto, preparamos en 48 horas una vista previa en 3D sobre relieve real con perfil de elevación para que su equipo la evalúe.',
  },
  {
    q: '¿Dónde quedan mis datos?',
    a: 'En una base de datos separada por organización, en la nube que usted apruebe. Usted es dueño de sus datos y puede exportarlos cuando quiera.',
  },
  {
    q: '¿Qué pasa si se cae la comunicación en campo?',
    a: 'El tablero marca el equipo como fuera de línea y genera un aviso. Recomendamos gateways que guarden las lecturas y las reenvíen con su hora original al volver la señal.',
  },
  {
    q: '¿Sirve para una red de agua pequeña?',
    a: 'Sí. La misma plataforma funciona para un acueducto municipal, un sector hidráulico o una red domiciliaria con contadores IoT.',
  },
  {
    q: '¿Cuánto tarda en estar funcionando?',
    a: 'Depende del número de equipos y de cómo se comunican hoy. Lo definimos con usted al terminar el diagnóstico, antes de empezar el piloto.',
  },
];

export const CASE_SCENARIOS = [
  {
    sector: 'Hidrocarburos · Corredor Meta',
    title: 'Troncal de crudo pesado 30″ y estaciones de rebombeo',
    before:
      'Alarmas de presión en SCADA separadas de los reportes mensuales de ultrasonido y las órdenes correctivas en hojas de cálculo.',
    change:
      'Integración de transmisores PT/FT/VFD y mediciones UT/CP sobre un gemelo 3D con perfil de elevación y balance de línea API 1130.',
    outcome:
      'Reconocimiento de alertas en menos de 1 minuto (0,9 min mediana en red demo) y trazabilidad completa por abscisa KP.',
    stack: ['PostGIS', 'OPC UA', 'Modbus', 'API 1130 · API 570'],
  },
  {
    sector: 'Acueducto y Saneamiento · Red Hidráulica',
    title: 'Sectorización hidráulica, macromedición y colector hacia PTAR',
    before:
      'Cálculo anual del agua no contabilizada (IANC) y detección tardía de caídas nocturnas o descargas fuera de norma en PTAR.',
    change:
      'Comparación continua entre macromedidores de entrada y consumo sectorial, junto con sondas de pH, turbiedad, cloro y DQO.',
    outcome:
      'Detección temprana de fugas nocturnas desde 0,07 L/min, control energético en kWh/m³ y alertas automáticas ante desvíos Res. 2115.',
    stack: ['LoRaWAN', 'NB-IoT', 'MQTT', 'Res. 2115 · Res. 0631'],
  },
  {
    sector: 'Energía Eléctrica · Generación y Transmisión',
    title: 'Líneas 230/115 kV, parques renovables y subestaciones',
    before:
      'Telemetría de inversores solares, pruebas DGA de transformadores y fallas de comunicación dispersas en consolas separadas.',
    change:
      'Corredor de torres en 3D conectado al diagrama unifilar por módulos y monitor de flujo de datos en tiempo real.',
    outcome:
      'Aislamiento inmediato de desviaciones de frecuencia (59,7 Hz), pérdida de SF₆ y descargas parciales con orden correctiva directa.',
    stack: ['IEC 61850', 'DNP3', 'Modbus', 'IEEE C57.104 · RETIE'],
  },
];

export const LICENSING_PILLARS = [
  {
    title: 'Piloto acotado de 30 días',
    desc: 'Conecte un tramo, subestación o sector hidráulico con datos reales para validar retorno operativo sin comprometer toda la red.',
  },
  {
    title: 'Licenciamiento por puntos activos',
    desc: 'Tarifa escalable según sensores o estaciones monitoreadas. Sin cobros extra por usuario de consulta, técnico o gerente.',
  },
  {
    title: 'Propiedad total de trazados y datos',
    desc: 'Sus archivos KML/GeoJSON y series históricas le pertenecen y pueden exportarse en cualquier momento sin cláusulas de bloqueo.',
  },
];

export interface SatelliteSolution {
  slug: string;
  path: string;
  badge: string;
  seoTitle: string;
  seoDescription: string;
  h1: string;
  lede: string;
  sectorType: 'Oleoductos' | 'Acueducto' | 'Gasoductos' | 'Redes eléctricas';
  highlights: { title: string; detail: string }[];
  norms: string[];
  protocols: string[];
  screenshot: string;
  screenshotAlt: string;
}

export const SATELLITE_SOLUTIONS: SatelliteSolution[] = [
  {
    slug: 'oleoductos-api-1130',
    path: '/soluciones/oleoductos-api-1130',
    badge: 'Hidrocarburos · Midstream',
    seoTitle: 'Monitoreo de Oleoductos 3D y Detección de Fugas API 1130 | Arteria',
    seoDescription:
      'Supervise oleoductos y gasoductos en 3D con balance de masa API 1130, control de espesor UT API 570 y protección catódica NACE SP0169 sin cambiar su SCADA.',
    h1: 'Monitoreo de oleoductos y gasoductos en 3D bajo criterios API 1130 y API 570',
    lede: 'Centralice la telemetría de estaciones, trampas de raspador, variadores VFD y corrosión interna sobre el derecho de vía real en Colombia.',
    sectorType: 'Oleoductos',
    highlights: [
      {
        title: 'Detección de fugas por balance y presión (API 1130)',
        detail:
          'Compare caudales entre estaciones de bombeo, identifique caídas frente a la MAOP y ubique el evento por abscisa KP al instante.',
      },
      {
        title: 'Integridad de tubería y protección catódica',
        detail:
          'Correlacione lecturas de espesor de pared por ultrasonido (API 570) y potencial de postes de prueba (−850 mV NACE SP0169) en un solo mapa.',
      },
      {
        title: 'Despacho directo a cuadrillas de mantenimiento',
        detail:
          'Cada desviación crítica genera una orden de trabajo con válvulas de aislamiento sugeridas, repuestos e historial del activo.',
      },
    ],
    norms: ['API 1130 (Fugas)', 'API 570 (Espesor UT)', 'NACE SP0169 (Catódica)'],
    protocols: ['OPC UA', 'Modbus TCP/RTU', 'DNP3', 'LoRaWAN', 'HART'],
    screenshot: '/assets/aistudio/ducto_42a94bfc.jpg',
    screenshotAlt: 'Vista 3D del oleoducto San Fernando - Apiay con ficha técnica y perfil de elevación en Arteria',
  },
  {
    slug: 'agua-no-contabilizada-acueductos',
    path: '/soluciones/agua-no-contabilizada-acueductos',
    badge: 'Agua y Saneamiento · Colombia',
    seoTitle: 'Software para Reducir Agua No Contabilizada (IANC) y Calidad en Acueductos | Arteria',
    seoDescription:
      'Calcule el agua no contabilizada en tiempo real, detecte fugas nocturnas y vigile pH, turbiedad y cloro bajo Resolución 2115/2007 y 0631/2015.',
    h1: 'Control de agua no contabilizada (IANC) y calidad en tiempo real para acueductos',
    lede: 'Pase del cálculo anual en hojas de cálculo al monitoreo continuo desde la bocatoma y la distribución hasta el efluente de la PTAR.',
    sectorType: 'Acueducto',
    highlights: [
      {
        title: 'Balance hidráulico continuo por sector',
        detail:
          'Cruce el caudal de macromedidores de entrada contra los contadores de consumo y detecte fugas domiciliarias nocturnas desde 0,07 L/min.',
      },
      {
        title: 'Cumplimiento en línea Res. 2115/2007 y Res. 0631/2015',
        detail:
          'Vigile pH, turbiedad, cloro residual, conductividad, dosis UV y DQO con alertas automáticas antes de entregar agua o verter.',
      },
      {
        title: 'Eficiencia energética de bombeo (kWh/m³)',
        detail:
          'Mida la potencia consumida frente al caudal entregado por estación para detectar bombas ineficientes o cavitación temprana.',
      },
    ],
    norms: ['Res. 2115/2007 (Agua potable)', 'Res. 0631/2015 (Vertimientos)', 'Metas IANC CRA'],
    protocols: ['LoRaWAN', 'NB-IoT', 'MQTT', 'Modbus', 'Wi-Fi'],
    screenshot: '/assets/aistudio/agua_e86174d9.jpg',
    screenshotAlt: 'Colector Sur hacia la PTAR en la vista 3D de Arteria con filtro por zona del ciclo del agua',
  },
  {
    slug: 'integracion-scada-modbus-dnp3',
    path: '/soluciones/integracion-scada-modbus-dnp3',
    badge: 'Arquitectura IoT · Gateways',
    seoTitle: 'Conectar SCADA Modbus, Profibus y DNP3 a la Nube sin Cambiar PLC | Arteria',
    seoDescription:
      'Conecte sus PLC y sensores industriales actuales (Modbus, DNP3, Profibus, OPC UA, LoRaWAN) a Arteria mediante gateways de solo lectura con buffer local.',
    h1: 'Conecte su SCADA Modbus, DNP3 o Profibus sin reemplazar sensores ni intervenir sus PLC',
    lede: 'Aproveche la instrumentación instalada en estaciones y plantas mediante gateways industriales seguros con almacenamiento ante caídas de red.',
    sectorType: 'Gasoductos',
    highlights: [
      {
        title: 'Lectura no intrusiva de PLC y RTU existentes',
        detail:
          'Un gateway industrial lee registros Modbus, Profibus o DNP3 en modo seguro y los traduce a MQTT/HTTPS cifrado sin tocar la lógica de control.',
      },
      {
        title: 'Tolerancia a desconexiones en zonas remotas',
        detail:
          'Cuando falla la señal celular o satelital en campo, el gateway almacena las lecturas localmente y las sincroniza con su estampilla de tiempo original.',
      },
      {
        title: 'Seguridad multi-empresa y auditoría inmutable',
        detail:
          'Cada equipo cuenta con su propia credencial de acceso, aislamiento estricto por zona y registro de actividad inmutable (Ley 1581/2012).',
      },
    ],
    norms: ['Ley 1581/2012 (Datos)', 'Aislamiento RBAC por zona', 'Registro inmutable'],
    protocols: ['Modbus', 'DNP3', 'Profibus', 'OPC UA', 'MQTT', 'LoRaWAN'],
    screenshot: '/assets/aistudio/sensor_dc223657.jpg',
    screenshotAlt: 'Variador de frecuencia VFD-ESF-01 conectado en tiempo real sobre mapa 3D en Arteria',
  },
  {
    slug: 'redes-electricas-subestaciones-3d',
    path: '/soluciones/redes-electricas-subestaciones-3d',
    badge: 'Redes Eléctricas · AT / MT',
    seoTitle: 'Monitoreo de Redes Eléctricas, Subestaciones y Parques Solares en 3D | Arteria',
    seoDescription:
      'Supervise líneas de transmisión 230/115 kV, circuitos 13,2 kV, parques solares, centrales hidroeléctricas y subestaciones con diagrama unifilar en vivo, DGA y SF6.',
    h1: 'Monitoreo 3D y diagrama unifilar para redes eléctricas, subestaciones y generación',
    lede: 'Reúna torres de transmisión, parques solares y eólicos, centrales hidroeléctricas y circuitos de distribución en un gemelo 3D conectado a su telemetría IEC 61850, DNP3 y Modbus.',
    sectorType: 'Redes eléctricas',
    highlights: [
      {
        title: 'Corredores 230/115 kV y circuitos 13,2 kV en 3D',
        detail:
          'Visualice torres, reconectadores, subestaciones y parques de generación sobre relieve satelital con lecturas flotantes de tensión, potencia e irradiancia.',
      },
      {
        title: 'Diagrama unifilar vivo por módulos de planta',
        detail:
          'Aísle alarmas al instante entre captación/embalse, turbinas o inversores, transformación (H₂ disuelto DGA y temp. de aceite) y salida de línea.',
      },
      {
        title: 'Salud de activos críticos y flujo de datos',
        detail:
          'Vigile presión de gas SF₆, descargas parciales, desviaciones de frecuencia (59,8–60,2 Hz) y sensores sin señal con disparo automático de órdenes de trabajo.',
      },
    ],
    norms: ['IEC 61850 / IEC 104', 'IEEE C57.104 (DGA transformadores)', 'RETIE · CREG 025'],
    protocols: ['IEC 61850', 'DNP3', 'IEC 60870-5-104', 'Modbus TCP', 'MQTT'],
    screenshot: '/assets/aistudio/image_1b05e468.png',
    screenshotAlt: 'Línea eléctrica de 115 kV Parque solar Cesar I en la vista 3D de Arteria con torres, filtros por tensión y telemetría en vivo',
  },
];

