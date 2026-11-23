import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { AlertTriangle, CheckCircle2, RotateCcw } from 'lucide-react';
import { PRODUCTS, ProductId } from '../data/arteriaData';

interface LiveCallout {
  id: number;
  label: string;
  value: string;
  sub: string;
  alarm: boolean;
}

const _projVec = new THREE.Vector3();

const PIPE_ANCHORS = [
  new THREE.Vector3(-4.4, 2.25, 0.05),
  new THREE.Vector3(-2.5, 0.2, 1.48),
  new THREE.Vector3(2.6, -0.88, 1.25),
  new THREE.Vector3(4.4, 0.95, 2.2),
  new THREE.Vector3(-5.3, -1.85, 0.25),
];

const ELECTRIC_ANCHORS = [
  new THREE.Vector3(-4.6, 2.15, 0.85),
  new THREE.Vector3(-1.1, 1.52, 0.85),
  new THREE.Vector3(1.15, 0.72, 0.55),
  new THREE.Vector3(4.15, 1.2, 0.45),
  new THREE.Vector3(1.15, -0.85, 1.1),
];

const SLOTS: [number, number][] = [
  [0.02, 0.04],
  [0.3, 0.76],
  [0.6, 0.76],
  [0.72, 0.04],
  [0.02, 0.76],
];

const formatNum = (v: number, d = 0) =>
  v.toLocaleString('es-CO', { minimumFractionDigits: d, maximumFractionDigits: d });

const driftVal = (s: { v: number; lo: number; hi: number }) => {
  const span = s.hi - s.lo;
  s.v = Math.min(
    s.hi,
    Math.max(s.lo, s.v + (Math.random() - 0.5) * span * 0.08 + ((s.lo + s.hi) / 2 - s.v) * 0.05)
  );
};

interface PipeAnatomy3DProps {
  preferredProduct?: ProductId;
}

export function PipeAnatomy3D({ preferredProduct }: PipeAnatomy3DProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasMountRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const calloutRefs = useRef<(HTMLDivElement | null)[]>([]);

  const [product, setProduct] = useState<ProductId>(preferredProduct ?? 'crudo');
  const [faultElapsed, setFaultElapsed] = useState<number>(0);
  const [webglFailed, setWebglFailed] = useState(false);
  const [stacked, setStacked] = useState(false);
  const [callouts, setCallouts] = useState<LiveCallout[]>([
    { id: 1, label: '1 · Presión · PT-101', value: '1.100 psi', sub: 'MAOP 1.440 psi', alarm: false },
    { id: 2, label: '2 · Caudal · FT-102', value: '361.000 bpd', sub: 'Ultrasónico de abrazadera', alarm: false },
    { id: 3, label: '3 · Espesor · UT-103', value: '12,40 mm', sub: 'Mínimo diseño 8,0 mm', alarm: false },
    { id: 4, label: '4 · Prot. catódica · CP-104', value: '-1.010 mV', sub: 'Criterio ≤ −850 mV', alarm: false },
    { id: 5, label: '5 · Temperatura · TT-105', value: '74,0 °C', sub: 'Rango 60–90 °C', alarm: false },
  ]);

  const productRef = useRef<ProductId>(product);
  const faultRef = useRef<number>(faultElapsed);
  const stackedRef = useRef<boolean>(stacked);
  const alarmFlagsRef = useRef<boolean[]>([false, false, false, false, false]);
  const resetViewFnRef = useRef<(() => void) | null>(null);
  const faultTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (preferredProduct) {
      setProduct(preferredProduct);
    }
  }, [preferredProduct]);

  useEffect(() => {
    productRef.current = product;
    if (faultTimerRef.current) {
      window.clearInterval(faultTimerRef.current);
      faultTimerRef.current = null;
    }
    setFaultElapsed(0);
  }, [product]);

  useEffect(() => {
    faultRef.current = faultElapsed;
  }, [faultElapsed]);

  useEffect(() => {
    stackedRef.current = stacked;
  }, [stacked]);

  useEffect(() => {
    return () => {
      if (faultTimerRef.current) window.clearInterval(faultTimerRef.current);
    };
  }, []);

  // Live telemetry simulation
  useEffect(() => {
    const simProducts = structuredClone(PRODUCTS);
    const ut = { v: 12.4, lo: 12.2, hi: 12.6, d: 2 };
    const cp = { v: -1010, lo: -1040, hi: -980, d: 0 };
    const sf6 = { v: 6.78, lo: 6.62, hi: 6.92, d: 2 };
    const dgaH2 = { v: 52.0, lo: 48.0, hi: 56.5, d: 1 };

    const updateReadings = () => {
      const currentProduct = productRef.current;
      const P = simProducts[currentProduct];
      driftVal(P.p);
      driftVal(P.q);
      driftVal(P.t);
      driftVal(ut);
      driftVal(cp);
      driftVal(sf6);
      driftVal(dgaH2);

      const faultSec = faultRef.current;
      const drop = faultSec ? Math.min(1, faultSec / 3) : 0;
      const isAlarm = drop > 0.3;

      if (currentProduct === 'electrica') {
        const kv = P.p.v * (1 - 0.1 * drop);
        const hz = P.q.v - 0.32 * drop;
        const oilTemp = P.t.v + 16.5 * drop;
        alarmFlagsRef.current = [isAlarm, isAlarm, false, false, false];

        setCallouts([
          {
            id: 1,
            label: '1 · Tensión · KV-101',
            value: `${formatNum(kv, P.p.d)} ${P.p.u}`,
            sub: 'Barra 115 kV · ±5 %',
            alarm: isAlarm,
          },
          {
            id: 2,
            label: '2 · Frecuencia · FR-102',
            value: `${formatNum(hz, P.q.d)} ${P.q.u}`,
            sub: 'Rango CREG 59,8–60,2 Hz',
            alarm: isAlarm,
          },
          {
            id: 3,
            label: '3 · Aceite trafo · TO-103',
            value: `${formatNum(oilTemp, P.t.d)} ${P.t.u}`,
            sub: 'Elevador 34,5/115 kV',
            alarm: false,
          },
          {
            id: 4,
            label: '4 · Gas SF₆ · SF6-104',
            value: `${formatNum(sf6.v, sf6.d)} bar`,
            sub: 'Interruptor 52-1 · 6–7,5 bar',
            alarm: false,
          },
          {
            id: 5,
            label: '5 · H₂ disuelto · DGA-105',
            value: `${formatNum(dgaH2.v, dgaH2.d)} ppm`,
            sub: 'IEEE C57.104 · < 100 ppm',
            alarm: false,
          },
        ]);
        return;
      }

      const pv = P.p.v * (1 - 0.18 * drop);
      alarmFlagsRef.current = [isAlarm, isAlarm, false, false, false];

      setCallouts([
        {
          id: 1,
          label: '1 · Presión · PT-101',
          value: `${formatNum(pv, P.p.d)} ${P.p.u}`,
          sub: currentProduct === 'agua' ? 'Máx. servicio 60 mca' : 'MAOP 1.440 psi',
          alarm: isAlarm,
        },
        {
          id: 2,
          label: '2 · Caudal · FT-102',
          value: faultSec
            ? `${formatNum(P.q.v * (1 - 0.062 * drop), P.q.d)} ${P.q.u} · Δ −${formatNum(6.2 * drop, 1)}%`
            : `${formatNum(P.q.v, P.q.d)} ${P.q.u}`,
          sub: 'Ultrasónico de abrazadera',
          alarm: isAlarm,
        },
        {
          id: 3,
          label: '3 · Espesor · UT-103',
          value: `${formatNum(ut.v, ut.d)} mm`,
          sub: 'Mínimo diseño 8,0 mm',
          alarm: false,
        },
        {
          id: 4,
          label: '4 · Prot. catódica · CP-104',
          value: `${formatNum(cp.v)} mV`,
          sub: 'Criterio ≤ −850 mV',
          alarm: false,
        },
        {
          id: 5,
          label: '5 · Temperatura · TT-105',
          value: `${formatNum(P.t.v, P.t.d)} ${P.t.u}`,
          sub:
            currentProduct === 'crudo'
              ? 'Rango 60–90 °C'
              : currentProduct === 'gas'
                ? 'Rango 20–40 °C'
                : 'Rango 12–24 °C',
          alarm: false,
        },
      ]);
    };

    updateReadings();
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const id = window.setInterval(updateReadings, reduce ? 3500 : 1200);
    return () => window.clearInterval(id);
  }, [product]);

  // Fault / Leak trigger timer
  const startFaultSimulation = () => {
    if (faultElapsed > 0) return;
    setFaultElapsed(0.01);
    const t0 = performance.now();
    faultTimerRef.current = window.setInterval(() => {
      const elapsed = (performance.now() - t0) / 1000;
      if (elapsed > 11) {
        if (faultTimerRef.current) {
          window.clearInterval(faultTimerRef.current);
          faultTimerRef.current = null;
        }
        setFaultElapsed(0);
      } else {
        setFaultElapsed(elapsed);
      }
    }, 180);
  };

  // Three.js scene lifecycle
  useEffect(() => {
    const stage = stageRef.current;
    const mount = canvasMountRef.current;
    if (!stage || !mount) return;

    const isSoftwareGl = (() => {
      try {
        const probe = document.createElement('canvas');
        const gl = probe.getContext('webgl2');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return true;
      }
    })();

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch {
      setWebglFailed(true);
      return;
    }

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2));
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    renderer.domElement.setAttribute('aria-hidden', 'true');
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envTex = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTex;
    pmremGenerator.dispose();

    const camera = new THREE.PerspectiveCamera(31, 1.6, 0.1, 100);
    camera.position.set(0, 3.7, 17.6);
    camera.lookAt(0, -0.15, 0);

    // 3-point warm/cool lighting rig
    const hemi = new THREE.HemisphereLight(0xf6fafd, 0x4c5a64, 0.78);
    scene.add(hemi);
    const keyLight = new THREE.DirectionalLight(0xfff5e8, 1.15);
    keyLight.position.set(5, 9, 7);
    scene.add(keyLight);
    const rimLight = new THREE.DirectionalLight(0xd9ecff, 0.48);
    rimLight.position.set(-7, 2.5, -5);
    scene.add(rimLight);

    const root = new THREE.Group();
    scene.add(root);

    const pipeGroup = new THREE.Group();
    const electricGroup = new THREE.Group();
    root.add(pipeGroup);
    root.add(electricGroup);

    const disposables: { dispose: () => void }[] = [envTex];

    // =========================================================================
    // 1. PIPE ANATOMY CUTAWAY GROUP (Crudo / Gas / Agua)
    // =========================================================================
    const L = 12;
    const X0 = -L / 2;
    const CLOSED = 5;
    const GAP0 = THREE.MathUtils.degToRad(84);
    const GAP1 = THREE.MathUtils.degToRad(206);

    const ring = (rIn: number, rOut: number) => {
      const s = new THREE.Shape();
      s.absarc(0, 0, rOut, 0, Math.PI * 2, false);
      const h = new THREE.Path();
      h.absarc(0, 0, rIn, 0, Math.PI * 2, true);
      s.holes.push(h);
      return s;
    };

    const sector = (rIn: number, rOut: number) => {
      const s = new THREE.Shape();
      s.absarc(0, 0, rOut, GAP1, GAP0 + Math.PI * 2, false);
      s.lineTo(Math.cos(GAP0) * rIn, Math.sin(GAP0) * rIn);
      s.absarc(0, 0, rIn, GAP0 + Math.PI * 2, GAP1, true);
      s.closePath();
      return s;
    };

    const extrude = (shape: THREE.Shape, from: number, len: number, mat: THREE.Material) => {
      const geo = new THREE.ExtrudeGeometry(shape, {
        depth: len,
        bevelEnabled: false,
        curveSegments: 72,
      });
      disposables.push(geo);
      const m = new THREE.Mesh(geo, mat);
      m.rotation.y = Math.PI / 2;
      m.position.x = from;
      pipeGroup.add(m);
    };

    const createLayer = (
      rIn: number,
      rOut: number,
      len: number,
      color: number,
      rough: number,
      metal: number
    ) => {
      const mat = new THREE.MeshStandardMaterial({
        color,
        roughness: rough,
        metalness: metal,
        side: THREE.DoubleSide,
      });
      disposables.push(mat);
      extrude(ring(rIn, rOut), X0, CLOSED, mat);
      extrude(sector(rIn, rOut), X0 + CLOSED, len - CLOSED, mat);
      return mat;
    };

    createLayer(0.94, 0.99, L, 0xd9d2c4, 0.82, 0.02); // Epoxy lining
    const steelMat = createLayer(0.99, 1.12, L - 2.2, 0x8a9aa6, 0.3, 0.82); // API 5L X65 steel
    const coatMat = createLayer(1.12, 1.2, L - 4.6, 0x2f6f62, 0.65, 0.08); // 3LPE coating

    const coreGeo = new THREE.CylinderGeometry(0.92, 0.92, L, 48, 1, true);
    const coreMat = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0.28,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    disposables.push(coreGeo, coreMat);
    const core = new THREE.Mesh(coreGeo, coreMat);
    core.rotation.z = Math.PI / 2;
    pipeGroup.add(core);

    const N = 1100;
    const pos = new Float32Array(N * 3);
    const seed = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      const r = Math.sqrt(Math.random()) * 0.88;
      const a = Math.random() * Math.PI * 2;
      pos[i * 3] = X0 + Math.random() * L;
      pos[i * 3 + 1] = Math.sin(a) * r;
      pos[i * 3 + 2] = Math.cos(a) * r;
      seed[i] = 1 - (r / 0.88) ** 2 * 0.7;
    }
    const pg = new THREE.BufferGeometry();
    pg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const ptsMat = new THREE.PointsMaterial({
      size: 0.12,
      transparent: true,
      opacity: 0.95,
      depthWrite: false,
    });
    disposables.push(pg, ptsMat);
    const pts = new THREE.Points(pg, ptsMat);
    pipeGroup.add(pts);

    // Leak spray particles
    const LN = 220;
    const lpos = new Float32Array(LN * 3);
    const lvel = new Float32Array(LN * 3);
    const lg = new THREE.BufferGeometry();
    lg.setAttribute('position', new THREE.BufferAttribute(lpos, 3));
    const sprayMat = new THREE.PointsMaterial({
      size: 0.085,
      transparent: true,
      opacity: 0.92,
      depthWrite: false,
    });
    disposables.push(lg, sprayMat);
    const spray = new THREE.Points(lg, sprayMat);
    spray.visible = false;
    pipeGroup.add(spray);

    const LEAK_ORIGIN = new THREE.Vector3(0.6, 1.04, -0.6);
    const resetDrop = (i: number) => {
      lpos[i * 3] = LEAK_ORIGIN.x;
      lpos[i * 3 + 1] = LEAK_ORIGIN.y;
      lpos[i * 3 + 2] = LEAK_ORIGIN.z;
      lvel[i * 3] = (Math.random() - 0.5) * 0.8;
      lvel[i * 3 + 1] = 1.4 + Math.random() * 1.4;
      lvel[i * 3 + 2] = (Math.random() - 0.7) * 0.9;
    };
    for (let i = 0; i < LN; i++) resetDrop(i);

    const metalInst = new THREE.MeshStandardMaterial({ color: 0x5c6870, roughness: 0.35, metalness: 0.8 });
    const housingMat = new THREE.MeshStandardMaterial({ color: 0xeae6de, roughness: 0.45, metalness: 0.1 });
    const cpPostMat = new THREE.MeshStandardMaterial({ color: 0xd6a42b, roughness: 0.55, metalness: 0.1 });
    disposables.push(metalInst, housingMat, cpPostMat);

    const addPartTo = (
      parent: THREE.Group,
      geo: THREE.BufferGeometry,
      mat: THREE.Material,
      x: number,
      y: number,
      z: number,
      rx = 0,
      ry = 0,
      rz = 0
    ) => {
      disposables.push(geo);
      const m = new THREE.Mesh(geo, mat);
      m.position.set(x, y, z);
      m.rotation.set(rx, ry, rz);
      parent.add(m);
      return m;
    };

    // Pipe instrumentation
    addPartTo(pipeGroup, new THREE.CylinderGeometry(0.06, 0.06, 0.8, 16), metalInst, -4.4, 1.55, 0);
    addPartTo(pipeGroup, new THREE.CylinderGeometry(0.34, 0.34, 0.14, 32), housingMat, -4.4, 2.1, 0.05, Math.PI / 2);
    addPartTo(pipeGroup, new THREE.BoxGeometry(0.5, 0.28, 0.3), housingMat, -3.2, 0, 1.3);
    addPartTo(pipeGroup, new THREE.BoxGeometry(0.5, 0.28, 0.3), housingMat, -1.8, 0, 1.3);
    addPartTo(pipeGroup, new THREE.TorusGeometry(1.23, 0.03, 8, 48), metalInst, -3.2, 0, 0, 0, Math.PI / 2);
    addPartTo(pipeGroup, new THREE.TorusGeometry(1.23, 0.03, 8, 48), metalInst, -1.8, 0, 0, 0, Math.PI / 2);
    addPartTo(pipeGroup, new THREE.CylinderGeometry(0.11, 0.11, 0.34, 16), housingMat, 2.6, -0.72, 1.02, 2.18);
    addPartTo(pipeGroup, new THREE.CylinderGeometry(0.07, 0.07, 2.3, 12), cpPostMat, 4.4, -0.45, 2.2);
    addPartTo(pipeGroup, new THREE.BoxGeometry(0.3, 0.26, 0.18), housingMat, 4.4, 0.8, 2.2);
    addPartTo(pipeGroup, new THREE.CylinderGeometry(0.07, 0.07, 0.7, 12), metalInst, -5.3, -1.5, 0.25);

    // =========================================================================
    // 2. ELECTRICAL NETWORK 3D GROUP (Torre 115 kV + Trafo + Interruptor SF6)
    // =========================================================================
    const galvSteelMat = new THREE.MeshStandardMaterial({ color: 0x8d9ca8, roughness: 0.38, metalness: 0.78 });
    const ceramicMat = new THREE.MeshStandardMaterial({ color: 0x7a4b2a, roughness: 0.32, metalness: 0.08 });
    const tankMat = new THREE.MeshStandardMaterial({ color: 0x5d6e7b, roughness: 0.45, metalness: 0.55 });
    const concreteMat = new THREE.MeshStandardMaterial({ color: 0xbcc4ca, roughness: 0.88, metalness: 0.02 });
    const conductorMat = new THREE.MeshStandardMaterial({ color: 0xc2cbd2, roughness: 0.26, metalness: 0.88 });
    const copperMat = new THREE.MeshStandardMaterial({ color: 0xb87333, roughness: 0.3, metalness: 0.82 });
    const electricPulseMat = new THREE.PointsMaterial({
      size: 0.15,
      transparent: true,
      opacity: 0.98,
      depthWrite: false,
    });
    const sparkMat = new THREE.PointsMaterial({
      size: 0.12,
      color: 0xff4d4d,
      transparent: true,
      opacity: 0.95,
      depthWrite: false,
    });
    disposables.push(
      galvSteelMat,
      ceramicMat,
      tankMat,
      concreteMat,
      conductorMat,
      copperMat,
      electricPulseMat,
      sparkMat
    );

    const addStrut = (a: THREE.Vector3, b: THREE.Vector3, radius: number, mat: THREE.Material) => {
      const dir = new THREE.Vector3().subVectors(b, a);
      const len = dir.length();
      const geo = new THREE.CylinderGeometry(radius, radius, len, 8);
      disposables.push(geo);
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.copy(a).add(b).multiplyScalar(0.5);
      mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
      electricGroup.add(mesh);
    };

    // Helper: Build galvanized lattice transmission tower at x position
    const buildTower = (tx: number) => {
      const baseY = -1.6;
      const midY = 0.75;
      const topY = 2.65;
      const peakY = 3.25;
      const bW = 0.62;
      const tW = 0.26;
      const corners = [
        [-1, -1],
        [1, -1],
        [1, 1],
        [-1, 1],
      ];

      // 4 inclined corner legs
      corners.forEach(([sx, sz]) => {
        const p0 = new THREE.Vector3(tx + sx * bW, baseY, sz * bW);
        const p1 = new THREE.Vector3(tx + sx * tW, topY, sz * tW);
        addStrut(p0, p1, 0.048, galvSteelMat);
        // Peak mast struts
        addStrut(p1, new THREE.Vector3(tx, peakY, 0), 0.036, galvSteelMat);
      });

      // Horizontal & X-bracing bays
      const levels = [baseY + 0.15, -0.45, midY, 1.7, topY];
      for (let li = 0; li < levels.length; li++) {
        const y = levels[li];
        const frac = (y - baseY) / (topY - baseY);
        const w = THREE.MathUtils.lerp(bW, tW, frac);
        const ringPts = corners.map(([sx, sz]) => new THREE.Vector3(tx + sx * w, y, sz * w));
        for (let c = 0; c < 4; c++) {
          addStrut(ringPts[c], ringPts[(c + 1) % 4], 0.028, galvSteelMat);
        }
        if (li < levels.length - 1) {
          const yNext = levels[li + 1];
          const fracNext = (yNext - baseY) / (topY - baseY);
          const wNext = THREE.MathUtils.lerp(bW, tW, fracNext);
          const nextPts = corners.map(([sx, sz]) => new THREE.Vector3(tx + sx * wNext, yNext, sz * wNext));
          for (let c = 0; c < 4; c++) {
            const c2 = (c + 1) % 4;
            addStrut(ringPts[c], nextPts[c2], 0.02, galvSteelMat);
            addStrut(ringPts[c2], nextPts[c], 0.02, galvSteelMat);
          }
        }
      }

      // Cross-arm (cruceta trifásica) along Z
      const armY = 2.45;
      addPartTo(electricGroup, new THREE.BoxGeometry(0.18, 0.12, 2.35), galvSteelMat, tx, armY, 0);
      addStrut(new THREE.Vector3(tx, 1.9, 0.35), new THREE.Vector3(tx, armY, 1.05), 0.028, galvSteelMat);
      addStrut(new THREE.Vector3(tx, 1.9, -0.35), new THREE.Vector3(tx, armY, -1.05), 0.028, galvSteelMat);

      // 3 hanging ceramic disc insulator strings (phases A, B, C)
      [-0.95, 0, 0.95].forEach((zOff) => {
        addPartTo(electricGroup, new THREE.CylinderGeometry(0.025, 0.025, 0.55, 8), galvSteelMat, tx, armY - 0.3, zOff);
        for (let d = 0; d < 5; d++) {
          addPartTo(
            electricGroup,
            new THREE.CylinderGeometry(0.11, 0.13, 0.045, 14),
            ceramicMat,
            tx,
            armY - 0.12 - d * 0.095,
            zOff
          );
        }
      });
    };

    // Left 115 kV lattice tower + Right substation gantry frame
    buildTower(-4.6);

    // Concrete foundation pad for Substation Transformer + SF6 Breaker
    addPartTo(electricGroup, new THREE.BoxGeometry(5.8, 0.16, 2.8), concreteMat, 2.55, -1.52, 0.1);

    // Step-up Power Transformer (34.5 / 115 kV) at x = 1.15
    addPartTo(electricGroup, new THREE.BoxGeometry(1.85, 1.55, 1.25), tankMat, 1.15, -0.65, 0.15);
    // Cooling radiator fins on front & back
    for (let f = -3; f <= 3; f++) {
      addPartTo(electricGroup, new THREE.BoxGeometry(0.08, 1.25, 0.32), galvSteelMat, 1.15 + f * 0.22, -0.68, 0.92);
      addPartTo(electricGroup, new THREE.BoxGeometry(0.08, 1.25, 0.32), galvSteelMat, 1.15 + f * 0.22, -0.68, -0.62);
    }
    // Oil conservator tank on top
    addPartTo(electricGroup, new THREE.CylinderGeometry(0.24, 0.24, 1.45, 20), tankMat, 1.15, 0.48, -0.25, 0, 0, Math.PI / 2);
    // 3 HV Transformer bushings
    [-0.55, 0, 0.55].forEach((xOff) => {
      addPartTo(electricGroup, new THREE.CylinderGeometry(0.05, 0.09, 0.92, 14), ceramicMat, 1.15 + xOff, 0.58, 0.35);
      for (let r = 0; r < 5; r++) {
        addPartTo(electricGroup, new THREE.TorusGeometry(0.095, 0.022, 8, 16), ceramicMat, 1.15 + xOff, 0.25 + r * 0.15, 0.35, Math.PI / 2);
      }
      addPartTo(electricGroup, new THREE.SphereGeometry(0.075, 12, 12), copperMat, 1.15 + xOff, 1.08, 0.35);
    });
    // DGA H2 sensor box mounted on transformer front-bottom
    addPartTo(electricGroup, new THREE.BoxGeometry(0.36, 0.34, 0.22), housingMat, 1.15, -0.88, 1.12);
    addPartTo(electricGroup, new THREE.CylinderGeometry(0.035, 0.035, 0.35, 10), copperMat, 1.15, -0.88, 0.95, Math.PI / 2);

    // 3-Pole SF6 Circuit Breaker (Interruptor 52-1) at x = 4.15
    addPartTo(electricGroup, new THREE.BoxGeometry(1.75, 0.52, 0.68), housingMat, 4.15, -0.58, 0.15);
    addPartTo(electricGroup, new THREE.CylinderGeometry(0.08, 0.08, 0.85, 12), galvSteelMat, 3.55, -1.08, 0.15);
    addPartTo(electricGroup, new THREE.CylinderGeometry(0.08, 0.08, 0.85, 12), galvSteelMat, 4.75, -1.08, 0.15);
    // SF6 pressure gauge indicator
    addPartTo(electricGroup, new THREE.CylinderGeometry(0.14, 0.14, 0.08, 18), cpPostMat, 4.78, -0.55, 0.52, Math.PI / 2);
    // 3 vertical insulated SF6 interrupting columns
    [-0.55, 0, 0.55].forEach((zOff) => {
      const poleX = 4.15 + zOff * 0.85;
      addPartTo(electricGroup, new THREE.CylinderGeometry(0.075, 0.09, 1.65, 14), ceramicMat, poleX, 0.5, 0.15);
      for (let d = 0; d < 7; d++) {
        addPartTo(electricGroup, new THREE.TorusGeometry(0.12, 0.025, 8, 16), ceramicMat, poleX, -0.08 + d * 0.2, 0.15, Math.PI / 2);
      }
      addPartTo(electricGroup, new THREE.CylinderGeometry(0.04, 0.04, 0.25, 10), conductorMat, poleX, 1.4, 0.15);
    });

    // 3-Phase Overhead Catenary Conductors from Tower (-4.6) → Transformer HV Bushings (1.15) → SF6 Breaker (4.15)
    const phaseCurves: THREE.CatmullRomCurve3[] = [];
    const phaseZ = [-0.95, 0, 0.95];
    const trafoX = [0.6, 1.15, 1.7];
    const sf6X = [3.68, 4.15, 4.62];

    for (let i = 0; i < 3; i++) {
      const pStart = new THREE.Vector3(-4.6, 1.9, phaseZ[i]);
      const pMid1 = new THREE.Vector3(-2.1, 1.18, phaseZ[i] * 0.72 + 0.15);
      const pTrafo = new THREE.Vector3(trafoX[i], 1.12, 0.35);
      const pArc = new THREE.Vector3((trafoX[i] + sf6X[i]) / 2, 1.75, 0.25);
      const pSf6 = new THREE.Vector3(sf6X[i], 1.48, 0.15);

      const curve = new THREE.CatmullRomCurve3([pStart, pMid1, pTrafo, pArc, pSf6]);
      phaseCurves.push(curve);

      const tubeGeo = new THREE.TubeGeometry(curve, 48, 0.036, 8, false);
      disposables.push(tubeGeo);
      electricGroup.add(new THREE.Mesh(tubeGeo, conductorMat));
    }

    // Animated energy flow pulses along the 3 electrical phases
    const EN = 180;
    const ePos = new Float32Array(EN * 3);
    const ePhase = new Uint8Array(EN);
    const eT = new Float32Array(EN);
    for (let i = 0; i < EN; i++) {
      ePhase[i] = i % 3;
      eT[i] = Math.random();
      const pt = phaseCurves[ePhase[i]].getPoint(eT[i]);
      ePos[i * 3] = pt.x;
      ePos[i * 3 + 1] = pt.y;
      ePos[i * 3 + 2] = pt.z;
    }
    const eg = new THREE.BufferGeometry();
    eg.setAttribute('position', new THREE.BufferAttribute(ePos, 3));
    disposables.push(eg);
    const electricPulses = new THREE.Points(eg, electricPulseMat);
    electricGroup.add(electricPulses);

    // Electrical fault arc / discharge sparks near HV insulator & bushing
    const SN = 90;
    const sPos = new Float32Array(SN * 3);
    const sVel = new Float32Array(SN * 3);
    const sg = new THREE.BufferGeometry();
    sg.setAttribute('position', new THREE.BufferAttribute(sPos, 3));
    disposables.push(sg);
    const sparks = new THREE.Points(sg, sparkMat);
    sparks.visible = false;
    electricGroup.add(sparks);

    const FAULT_ORIGIN = new THREE.Vector3(-4.6, 1.9, 0.95);
    const resetSpark = (i: number) => {
      sPos[i * 3] = FAULT_ORIGIN.x + (Math.random() - 0.5) * 0.25;
      sPos[i * 3 + 1] = FAULT_ORIGIN.y + (Math.random() - 0.5) * 0.25;
      sPos[i * 3 + 2] = FAULT_ORIGIN.z + (Math.random() - 0.5) * 0.25;
      sVel[i * 3] = (Math.random() - 0.5) * 2.8;
      sVel[i * 3 + 1] = (Math.random() - 0.3) * 2.6;
      sVel[i * 3 + 2] = (Math.random() - 0.5) * 2.8;
    };
    for (let i = 0; i < SN; i++) resetSpark(i);

    // Engineering grid floor
    const ground = new THREE.GridHelper(18, 36, 0xcfd8de, 0xd8e0e5);
    ground.position.y = -1.6;
    const gMat = ground.material as THREE.Material;
    gMat.transparent = true;
    gMat.opacity = 0.7;
    scene.add(ground);

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    const syncThemeColors = () => {
      const dark = document.documentElement.classList.contains('dark');
      const spec = PRODUCTS[productRef.current];
      const accentColor = new THREE.Color(dark ? spec.hexDark : spec.hexLight);
      ptsMat.color.copy(accentColor);
      coreMat.color.copy(accentColor);
      sprayMat.color.copy(accentColor);
      electricPulseMat.color.set(faultRef.current > 0 ? '#ef4444' : dark ? '#facc15' : '#d97706');
      steelMat.color.set(dark ? '#9fb0bc' : '#8796a1');
      coatMat.color.set(dark ? '#4fa190' : '#2f6f62');
      galvSteelMat.color.set(dark ? '#a3b3bf' : '#7b8a96');
    };
    syncThemeColors();

    const observer = new MutationObserver(syncThemeColors);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    // Drag & keyboard yaw control
    let yaw = -0.38;
    let targetYaw = -0.38;
    let dragging = false;
    let lastX = 0;
    let idle = 0;

    resetViewFnRef.current = () => {
      targetYaw = -0.38;
      idle = 0;
    };

    const onPointerDown = (e: PointerEvent) => {
      dragging = true;
      lastX = e.clientX;
      stage.setPointerCapture(e.pointerId);
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!dragging) return;
      targetYaw += (e.clientX - lastX) * 0.008;
      lastX = e.clientX;
      idle = 0;
    };
    const onPointerUp = () => {
      dragging = false;
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        targetYaw -= 0.22;
        idle = 0;
      }
      if (e.key === 'ArrowRight') {
        targetYaw += 0.22;
        idle = 0;
      }
    };

    stage.addEventListener('pointerdown', onPointerDown);
    stage.addEventListener('pointermove', onPointerMove);
    stage.addEventListener('pointerup', onPointerUp);
    stage.addEventListener('pointercancel', onPointerUp);
    stage.addEventListener('keydown', onKeyDown);

    const updateSize = () => {
      const w = stage.clientWidth;
      const h = stage.clientHeight;
      if (!w || !h) return;
      const isNarrow = w < 620;
      setStacked(isNarrow);
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.position.set(0, isNarrow ? 3.2 : 3.7, isNarrow ? 14.5 : 17.6);
      camera.lookAt(0, -0.15, 0);
      camera.updateProjectionMatrix();
      svgRef.current?.setAttribute('viewBox', `0 0 ${w} ${h}`);
    };

    const ro = new ResizeObserver(updateSize);
    ro.observe(stage);
    updateSize();

    const drawLeaders = () => {
      const svg = svgRef.current;
      if (!svg) return;
      const w = stage.clientWidth;
      const h = stage.clientHeight;
      if (!w || !h || !Number.isFinite(camera.aspect)) return;

      const isStacked = stackedRef.current;
      const anchors = productRef.current === 'electrica' ? ELECTRIC_ANCHORS : PIPE_ANCHORS;
      let html = '';

      anchors.forEach((anchor, i) => {
        _projVec.copy(anchor).applyMatrix4(root.matrixWorld).project(camera);
        const x = (_projVec.x * 0.5 + 0.5) * w;
        const y = (-_projVec.y * 0.5 + 0.5) * h;
        const alarmClass = alarmFlagsRef.current[i] ? ' alarm' : '';

        if (!isStacked) {
          const card = calloutRefs.current[i];
          if (card) {
            const cw = card.offsetWidth || 176;
            const ch = card.offsetHeight || 62;
            const lx = Math.min(w - cw - 8, Math.max(8, SLOTS[i][0] * w));
            const ly = Math.min(h - ch - 8, Math.max(8, SLOTS[i][1] * h));
            card.style.transform = `translate3d(${lx}px, ${ly}px, 0)`;
            const ex = Math.min(Math.max(x, lx), lx + cw);
            const ey = Math.min(Math.max(y, ly), ly + ch);
            html += `<line x1="${x.toFixed(1)}" y1="${y.toFixed(1)}" x2="${ex.toFixed(1)}" y2="${ey.toFixed(1)}" stroke="currentColor" stroke-opacity="0.48" stroke-width="1"/>`;
          }
        }
        const fill = alarmClass ? 'var(--crit)' : 'var(--ink)';
        html += `<g><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="9.5" fill="${fill}"/><text x="${x.toFixed(1)}" y="${(y + 3.5).toFixed(1)}" text-anchor="middle" fill="var(--paper)" font-family="var(--f-mono)" font-size="10.5" font-weight="600">${i + 1}</text></g>`;
      });

      svg.innerHTML = html;
    };

    let visible = true;
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    io.observe(stage);

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let frameId = 0;
    let lastTime = performance.now();

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync?.(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      if (!sync) {
        frameId = window.setTimeout(cb, 80);
        return;
      }
      gl.flush();
      const poll = () => {
        const state = gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    const tick = () => {
      const now = performance.now();
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;

      if (visible) {
        const isElectric = productRef.current === 'electrica';
        pipeGroup.visible = !isElectric;
        electricGroup.visible = isElectric;

        syncThemeColors();
        idle += dt;
        if (!dragging && idle > 3 && !reduce) {
          targetYaw += dt * 0.055 * Math.sin(now / 4000);
        }
        yaw = THREE.MathUtils.damp(yaw, targetYaw, 8, dt);
        root.rotation.set(0, yaw, 0);

        const P = PRODUCTS[productRef.current];
        const faultSec = faultRef.current;
        const drop = faultSec ? Math.min(1, faultSec / 3) : 0;

        if (!isElectric) {
          const sp = (reduce ? 0.25 : 1) * 2.2 * P.speed * (1 - 0.35 * drop) * dt;
          for (let i = 0; i < N; i++) {
            const k = i * 3;
            pos[k] += sp * seed[i];
            if (pos[k] > X0 + L) pos[k] -= L;
          }
          pg.attributes.position.needsUpdate = true;

          spray.visible = faultSec > 0;
          if (spray.visible) {
            for (let i = 0; i < LN; i++) {
              const k = i * 3;
              lpos[k] += lvel[k] * dt;
              lpos[k + 1] += lvel[k + 1] * dt;
              lpos[k + 2] += lvel[k + 2] * dt;
              lvel[k + 1] -= 3.2 * dt;
              if (lpos[k + 1] < -1.6 || Math.random() < 0.01) resetDrop(i);
            }
            lg.attributes.position.needsUpdate = true;
          }
        } else {
          const esp = (reduce ? 0.12 : 0.45) * (faultSec > 0 ? 1.8 : 1) * dt;
          for (let i = 0; i < EN; i++) {
            eT[i] += esp;
            if (eT[i] >= 1) eT[i] -= 1;
            const pt = phaseCurves[ePhase[i]].getPoint(eT[i]);
            ePos[i * 3] = pt.x;
            ePos[i * 3 + 1] = pt.y;
            ePos[i * 3 + 2] = pt.z;
          }
          eg.attributes.position.needsUpdate = true;

          sparks.visible = faultSec > 0;
          if (sparks.visible) {
            for (let i = 0; i < SN; i++) {
              const k = i * 3;
              sPos[k] += sVel[k] * dt;
              sPos[k + 1] += sVel[k + 1] * dt;
              sPos[k + 2] += sVel[k + 2] * dt;
              if (Math.random() < 0.09) resetSpark(i);
            }
            sg.attributes.position.needsUpdate = true;
          }
        }

        renderer.render(scene, camera);
        drawLeaders();
      }

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = window.requestAnimationFrame(tick);
      }
    };

    if (isSoftwareGl) {
      frameId = window.setTimeout(tick, 16);
    } else {
      frameId = window.requestAnimationFrame(tick);
    }

    return () => {
      window.cancelAnimationFrame(frameId);
      window.clearTimeout(frameId);
      io.disconnect();
      ro.disconnect();
      observer.disconnect();
      stage.removeEventListener('pointerdown', onPointerDown);
      stage.removeEventListener('pointermove', onPointerMove);
      stage.removeEventListener('pointerup', onPointerUp);
      stage.removeEventListener('pointercancel', onPointerUp);
      stage.removeEventListener('keydown', onKeyDown);
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  const isElectric = product === 'electrica';
  const activeSpec = PRODUCTS[product];

  const statusText = isElectric
    ? faultElapsed === 0
      ? 'Operación normal · Línea 115 kV · SE Valledupar'
      : faultElapsed > 7
        ? 'Orden correctiva OT-2026-0318 creada · operario de subestación notificado'
        : faultElapsed > 4
          ? 'Seccionamiento sugerido: interruptor 52-1 y reconectador R-12'
          : 'Alerta crítica · caída de frecuencia (59,7 Hz) y tensión en barra 115 kV'
    : faultElapsed === 0
      ? 'Operación normal · KP 006+080'
      : faultElapsed > 7
        ? 'Orden correctiva OT-2026-0214 creada · cuadrilla notificada'
        : faultElapsed > 4
          ? 'Válvulas de aislamiento sugeridas: XV-04 y XV-05'
          : 'Alerta crítica · caída de presión en KP 006+080';

  const isAlarm = faultElapsed > 0;

  return (
    <figure
      className="rounded-xl border border-[var(--line)] bg-[var(--sheet)] shadow-sm overflow-hidden m-0 min-w-0"
      aria-labelledby="plate-title"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-b border-[var(--line)]">
        <div className="flex flex-wrap items-baseline gap-2 min-w-0">
          <span id="plate-title" className="font-display font-semibold text-xl tracking-tight text-[var(--ink)]">
            {isElectric ? 'Anatomía de una red eléctrica' : 'Anatomía de un ducto'}
          </span>
          <span className="font-mono-tech text-xs text-[var(--muted)]">{activeSpec.spec}</span>
        </div>

        <div className="flex items-center gap-2">
          <div
            className="inline-flex rounded-md border border-[var(--line)] bg-[var(--paper)] p-0.5"
            role="group"
            aria-label="Tipo de infraestructura en vista 3D"
          >
            {(['crudo', 'gas', 'agua', 'electrica'] as ProductId[]).map((pid) => {
              const active = product === pid;
              return (
                <button
                  key={pid}
                  type="button"
                  onClick={() => setProduct(pid)}
                  aria-pressed={active}
                  className={`px-2.5 py-1 text-xs font-medium rounded transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    active
                      ? 'bg-[var(--ink)] text-[var(--paper)]'
                      : 'text-[var(--muted)] hover:text-[var(--ink)]'
                  }`}
                >
                  {PRODUCTS[pid].label}
                </button>
              );
            })}
          </div>
          {!webglFailed && (
            <button
              type="button"
              onClick={() => resetViewFnRef.current?.()}
              title="Restablecer ángulo 3D"
              aria-label="Restablecer ángulo 3D"
              className="p-1.5 rounded-md border border-[var(--line)] text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--paper)] transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 3D Interactive Stage */}
      <div
        ref={stageRef}
        tabIndex={0}
        aria-label={
          isElectric
            ? 'Modelo 3D de línea eléctrica 115 kV, transformador elevador e interruptor SF6. Arrastra horizontalmente o usa las flechas izquierda y derecha para girar.'
            : 'Modelo 3D en corte de tubería industrial. Arrastra horizontalmente o usa las flechas izquierda y derecha para girar.'
        }
        className="relative aspect-[16/10] w-full select-none touch-pan-y cursor-grab active:cursor-grabbing bg-[var(--sheet)]"
      >
        {webglFailed ? (
          <img
            src={isElectric ? '/assets/aistudio/image_cc72a94d.png' : '/assets/aistudio/estacion_2e3332db.jpg'}
            alt={
              isElectric
                ? 'Torres de transmisión 115 kV y Parque solar Cesar I en la vista 3D de Arteria'
                : 'Estación de bombeo San Fernando en la vista 3D de Arteria'
            }
            className="absolute inset-0 w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div ref={canvasMountRef} className="absolute inset-0 w-full h-full" />
        )}

        {!webglFailed && (
          <svg
            ref={svgRef}
            className="pointer-events-none absolute inset-0 w-full h-full overflow-visible text-[var(--ink)]"
            aria-hidden="true"
          />
        )}

        {!stacked && !webglFailed && (
          <div className="pointer-events-none absolute inset-0">
            {callouts.map((c, idx) => (
              <div
                key={c.id}
                ref={(el) => {
                  calloutRefs.current[idx] = el;
                }}
                className={`absolute left-0 top-0 w-44 rounded-md border px-2.5 py-2 transition-colors ${
                  c.alarm
                    ? 'border-[var(--crit)] bg-[var(--sheet)]/95'
                    : 'border-[var(--line)] bg-[var(--sheet)]/92'
                }`}
              >
                <span className="block font-mono-tech text-[11px] text-[var(--muted)] truncate">{c.label}</span>
                <span
                  className={`block font-display text-lg font-semibold leading-tight tabular-nums ${
                    c.alarm ? 'text-[var(--crit)]' : 'text-[var(--ink)]'
                  }`}
                >
                  {c.value}
                </span>
                <span className="block font-mono-tech text-[11px] text-[var(--muted)] truncate">{c.sub}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Mobile stacked callouts */}
      {(stacked || webglFailed) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 border-t border-[var(--line)] bg-[var(--paper)]/50">
          {callouts.map((c) => (
            <div
              key={c.id}
              className={`rounded-md border px-3 py-2 bg-[var(--sheet)] ${
                c.alarm ? 'border-[var(--crit)]' : 'border-[var(--line)]'
              }`}
            >
              <span className="block font-mono-tech text-[11px] text-[var(--muted)]">{c.label}</span>
              <span
                className={`block font-display text-lg font-semibold leading-tight tabular-nums ${
                  c.alarm ? 'text-[var(--crit)]' : 'text-[var(--ink)]'
                }`}
              >
                {c.value}
              </span>
              <span className="block font-mono-tech text-[11px] text-[var(--muted)]">{c.sub}</span>
            </div>
          ))}
        </div>
      )}

      {/* Layer / Component Legend */}
      <ul
        className="flex flex-wrap gap-x-5 gap-y-1.5 px-4 py-2.5 border-t border-[var(--line)] font-mono-tech text-xs text-[var(--muted)] m-0 list-none"
        aria-label={isElectric ? 'Componentes de la red eléctrica' : 'Capas del tubo'}
      >
        {isElectric ? (
          <>
            <li className="flex items-center gap-1.5">
              <span className="inline-block w-3.5 h-2 rounded-xs bg-[var(--steel)]" aria-hidden="true" />
              Torre galvanizada 115 kV
            </li>
            <li className="flex items-center gap-1.5">
              <span className="inline-block w-3.5 h-2 rounded-xs bg-[#7a4b2a]" aria-hidden="true" />
              Aisladores cerámicos
            </li>
            <li className="flex items-center gap-1.5">
              <span className="inline-block w-3.5 h-2 rounded-xs bg-[#5d6e7b]" aria-hidden="true" />
              Trafo elevador + SF₆
            </li>
            <li className="flex items-center gap-1.5">
              <span
                className="inline-block w-3.5 h-2 rounded-xs"
                style={{ backgroundColor: `var(${activeSpec.colorVar})` }}
                aria-hidden="true"
              />
              {activeSpec.legend}
            </li>
          </>
        ) : (
          <>
            <li className="flex items-center gap-1.5">
              <span className="inline-block w-3.5 h-2 rounded-xs bg-[var(--coat)]" aria-hidden="true" />
              Recubrimiento tricapa (3LPE)
            </li>
            <li className="flex items-center gap-1.5">
              <span className="inline-block w-3.5 h-2 rounded-xs bg-[var(--steel)]" aria-hidden="true" />
              Acero API 5L X65
            </li>
            <li className="flex items-center gap-1.5">
              <span className="inline-block w-3.5 h-2 rounded-xs bg-[#d9d2c4]" aria-hidden="true" />
              Revestimiento epóxico
            </li>
            <li className="flex items-center gap-1.5">
              <span
                className="inline-block w-3.5 h-2 rounded-xs"
                style={{ backgroundColor: `var(${activeSpec.colorVar})` }}
                aria-hidden="true"
              />
              {activeSpec.legend}
            </li>
          </>
        )}
      </ul>

      {/* Footer status & fault/leak simulation control */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-t border-[var(--line)] bg-[var(--paper)]/40">
        <div
          role="status"
          className={`flex items-center gap-2 font-mono-tech text-xs font-medium min-w-0 ${
            isAlarm ? 'text-[var(--crit)]' : 'text-[var(--ok)]'
          }`}
        >
          {isAlarm ? (
            <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden="true" />
          ) : (
            <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
          )}
          <span className="truncate">{statusText}</span>
        </div>

        <button
          type="button"
          onClick={startFaultSimulation}
          disabled={faultElapsed > 0}
          className="px-3.5 py-1.5 text-xs font-semibold rounded-md border border-[var(--line)] bg-[var(--sheet)] text-[var(--ink)] hover:border-[var(--crude)] hover:text-[var(--crude)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer whitespace-nowrap shrink-0"
        >
          {faultElapsed > 0
            ? isElectric
              ? 'Simulando falla…'
              : 'Simulando fuga…'
            : isElectric
              ? 'Simular falla'
              : 'Simular fuga'}
        </button>
      </div>
    </figure>
  );
}
