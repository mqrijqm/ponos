"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Environment,
  Lightformer,
  PerspectiveCamera,
  useTexture,
} from "@react-three/drei";
import { Suspense, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";

import { SCROLL } from "./hero-content";
import {
  CAMERA,
  METERS_PER_UNIT,
  MOBILE_PLANK_COUNT,
  PLANK,
  PLANKS,
  SCROLL_DAMPING,
  SHADOW_RADIUS,
  TEXTURE_SETS,
  anyPlankCasts,
  type CameraKeyframe,
  type PlankDef,
  type TextureSet,
  type TextureSetName,
  clamp,
  easeOutCubic,
  assemblyProgress,
  finalTransform,
  fitDistance,
  floorSpan,
  lerp,
  panOffset,
  panProgress,
  plankProgress,
  startPosition,
  texturePaths,
} from "./plank-config";

/**
 * Mutabilna kutija za scroll progres - da se React ne renderuje na svaki frame.
 * Dvije faze: `assembly` je sklapanje poda, `pan` je listanje duz redova.
 */
type Phase = { assembly: number; pan: number };
type ProgressRef = { current: Phase };

const SET_NAMES = Object.keys(TEXTURE_SETS) as TextureSetName[];

/** Ravan spisak svih 9 fajlova, u obliku koji useTexture ocekuje. */
const TEXTURE_URLS = Object.fromEntries(
  SET_NAMES.flatMap((name) =>
    Object.entries(texturePaths(name)).map(([slot, url]) => [`${name}.${slot}`, url]),
  ),
) as Record<string, string>;

// -------------------------------------------------------------------- teksture

/**
 * Podesava UV jedne teksture za jednu dasku.
 *
 * Tekstura pokriva `physicalSize` metara stvarnog poda, a nasa daska je
 * 1.22 x 0.19 m - dakle uzimamo tanku traku iz otiska, ne cijeli otisak.
 * Svaka daska dobija svoj pomak (`uv`) pa se ponavljanje ne primjecuje.
 *
 * Kod rotiranih setova three primjenjuje skalu prije rotacije, pa repeat.x
 * i repeat.y mijenjaju uloge - otud dvije grane.
 */
function configureUv(tex: THREE.Texture, set: TextureSet, uv: [number, number]) {
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;

  const along = (PLANK.length * METERS_PER_UNIT) / set.physicalSize;
  const across = (PLANK.width * METERS_PER_UNIT) / set.physicalSize;

  // centar trake popreko: ili poravnat na sredinu jedne daske iz teksture,
  // ili slobodan pomak ako je tekstura pregusta da se poravnava
  const acrossCenter = set.strips
    ? ((Math.round(uv[1]) % set.strips) + 0.5) / set.strips
    : uv[1] % 1;
  const alongStart = uv[0] % 1;

  if (set.rotated) {
    tex.center.set(0.5, 0.5);
    tex.rotation = Math.PI / 2;
    tex.repeat.set(across, along);
    tex.offset.set(acrossCenter - 0.5, alongStart - 0.5);
  } else {
    tex.repeat.set(along, across);
    tex.offset.set(alongStart, acrossCenter - across / 2);
  }
}

function usePlankMaterials(defs: PlankDef[]) {
  const maxAnisotropy = useThree((s) => s.gl.capabilities.getMaxAnisotropy());
  const loaded = useTexture(TEXTURE_URLS);

  const materials = useMemo(() => {
    const anisotropy = Math.min(8, maxAnisotropy);

    return defs.map((def) => {
      const set = TEXTURE_SETS[def.set];
      const slots = ["map", "normalMap", "roughnessMap"] as const;

      const maps = {} as Record<(typeof slots)[number], THREE.Texture>;
      for (const slot of slots) {
        const clone = loaded[`${def.set}.${slot}`].clone();
        // diffuse je boja -> sRGB; normal i roughness su podaci -> linearno
        clone.colorSpace = slot === "map" ? THREE.SRGBColorSpace : THREE.NoColorSpace;
        clone.anisotropy = anisotropy;
        configureUv(clone, set, def.uv);
        maps[slot] = clone;
      }

      return new THREE.MeshStandardMaterial({
        ...maps,
        color: set.tint ?? "#ffffff",
        roughness: 1,
        metalness: 0,
        normalScale: new THREE.Vector2(0.85, 0.85),
        envMapIntensity: 0.6,
      });
    });
  }, [defs, loaded, maxAnisotropy]);

  useEffect(() => {
    return () => {
      for (const material of materials) {
        material.map?.dispose();
        material.normalMap?.dispose();
        material.roughnessMap?.dispose();
        material.dispose();
      }
    };
  }, [materials]);

  return materials;
}

// ---------------------------------------------------------------------- daske

type PlankProps = {
  def: PlankDef;
  index: number;
  count: number;
  geometry: THREE.BufferGeometry;
  material: THREE.Material;
  progressRef: ProgressRef;
  animated: boolean;
  isMobile: boolean;
};

function Plank({
  def,
  index,
  count,
  geometry,
  material,
  progressRef,
  animated,
  isMobile,
}: PlankProps) {
  const ref = useRef<THREE.Mesh>(null);
  const start = startPosition(def, isMobile);
  // pri montiranju (i u reduced motion) pod stoji na pocetku listanja
  const rest = finalTransform(index, count, isMobile, panOffset(0, isMobile));

  useFrame(() => {
    const mesh = ref.current;
    if (!animated || !mesh) return;

    const { assembly, pan } = progressRef.current;
    const t = plankProgress(assembly, index, count);
    const { position: end } = finalTransform(index, count, isMobile, panOffset(pan, isMobile));

    mesh.position.set(
      lerp(start[0], end[0], t),
      lerp(start[1], end[1], t),
      lerp(start[2], end[2], t),
    );
    mesh.rotation.set(
      lerp(def.rotation[0], 0, t),
      lerp(def.rotation[1], rest.rotationY, t),
      lerp(def.rotation[2], 0, t),
    );
    mesh.scale.setScalar(lerp(def.scale, 1, t));

    // Daska koja je jos daleko van kadra i dalje baca sjenku na ravan ispod, a
    // ta sjenka moze pasti unutar kadra. Zato sjenku pali tek kad se priblizi.
    mesh.castShadow = Math.hypot(mesh.position.x, mesh.position.y) < SHADOW_RADIUS;
  });

  // JSX vrijednosti su KRAJNJE stanje - tako je staticni render (reduced motion)
  // tacan bez i jednog frejma animacije.
  return (
    <mesh
      ref={ref}
      geometry={geometry}
      material={material}
      position={rest.position}
      rotation={[0, rest.rotationY, 0]}
      castShadow
      receiveShadow
    />
  );
}

function Planks({
  count,
  progressRef,
  animated,
  isMobile,
}: {
  count: number;
  progressRef: ProgressRef;
  animated: boolean;
  isMobile: boolean;
}) {
  const defs = useMemo(() => PLANKS.slice(0, count), [count]);
  const materials = usePlankMaterials(defs);

  const geometry = useMemo(
    () => new THREE.BoxGeometry(PLANK.length, PLANK.thickness, PLANK.width, ...PLANK.segments),
    [],
  );
  useEffect(() => () => geometry.dispose(), [geometry]);

  return (
    <group>
      {defs.map((def, i) => (
        <Plank
          key={i}
          def={def}
          index={i}
          count={count}
          geometry={geometry}
          material={materials[i]}
          progressRef={progressRef}
          animated={animated}
          isMobile={isMobile}
        />
      ))}
    </group>
  );
}

// --------------------------------------------------------------------- kamera

function CameraRig({
  progressRef,
  animated,
  isMobile,
  count,
}: {
  progressRef: ProgressRef;
  animated: boolean;
  isMobile: boolean;
  count: number;
}) {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const size = useThree((s) => s.size);
  const target = useMemo(() => new THREE.Vector3(), []);

  const view = isMobile ? CAMERA.mobile : CAMERA.desktop;
  const span = floorSpan(count, isMobile);
  const aspect = size.width / size.height;

  /** "fit" se racuna iz gabarita poda i oblika ekrana, ostalo je zadato. */
  const resolveDistance = (key: CameraKeyframe) =>
    key.distance === "fit" ? fitDistance(key.fov, aspect, span.x, span.z) : key.distance;

  const place = (p: number) => {
    const camera = cameraRef.current;
    if (!camera) return;

    const e = easeOutCubic(clamp(p));
    const { from, to, orbit } = view;

    const elevation = (lerp(from.elevation, to.elevation, e) * Math.PI) / 180;
    const fov = lerp(from.fov, to.fov, e);
    const distance = lerp(resolveDistance(from), resolveDistance(to), e);
    const targetY = lerp(from.targetY, to.targetY, e);
    const offsetX = lerp(from.offsetX, to.offsetX, e) + Math.sin(e * Math.PI) * orbit;

    target.set(0, targetY, 0);
    camera.position.set(
      offsetX,
      targetY + Math.sin(elevation) * distance,
      Math.cos(elevation) * distance,
    );

    // "gore" se okrece zajedno sa kamerom. Bez toga bi lookAt pukao kad kamera
    // dodje tacno iznad poda - pravac gledanja bi bio paralelan sa up vektorom.
    camera.up.set(0, Math.cos(elevation), -Math.sin(elevation));
    camera.lookAt(target);

    if (camera.fov !== fov) {
      camera.fov = fov;
      camera.updateProjectionMatrix();
    }
  };

  // prvi frejm: postavi kameru prije nego sto se bilo sta nacrta
  useLayoutEffect(() => {
    place(animated ? 0 : 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animated, isMobile, count, size.width, size.height]);

  // racuna se i u staticnom slucaju, da promjena velicine prozora ponovo
  // uklopi pod u kadar
  useFrame(() => place(animated ? progressRef.current.assembly : 1), -1);

  return <PerspectiveCamera ref={cameraRef} makeDefault near={0.1} far={160} />;
}

/**
 * Racuna progres iz pozicije sekcije u stranici, bez sopstvenog scroll
 * kontejnera. Tako radi i sa Lenisom / GSAP ScrollTriggerom na stranici -
 * hero samo cita gdje se sekcija nalazi, ne otima scroll nikome.
 */
function ScrollReader({
  sectionRef,
  progressRef,
  introRef,
}: {
  sectionRef: React.RefObject<HTMLElement | null>;
  progressRef: ProgressRef;
  introRef: React.RefObject<HTMLElement | null>;
}) {
  const smoothedRef = useRef(0);

  useFrame((_, delta) => {
    const section = sectionRef.current;
    if (!section) return;

    // koliko je sekcija prosla kroz ekran: 0 kad joj je vrh na vrhu ekrana,
    // 1 kad joj je dno na dnu ekrana
    const travel = section.offsetHeight - window.innerHeight;
    const raw = travel > 0 ? clamp(-section.getBoundingClientRect().top / travel) : 0;

    // eksponencijalno glacanje - bez njega scena poskakuje po koracima tockica
    smoothedRef.current = lerp(smoothedRef.current, raw, 1 - Math.exp(-delta / SCROLL_DAMPING));
    const offset = smoothedRef.current;

    progressRef.current.assembly = assemblyProgress(offset);
    progressRef.current.pan = panProgress(offset);

    const intro = introRef.current;
    if (!intro) return;

    // linearno, ne easeOutCubic: eased fade nestane vec na trecini raspona,
    // pa se uvodni blok i daske ne bi stigli preklopiti
    const out = clamp((offset - SCROLL.textOutStart) / (SCROLL.textOutEnd - SCROLL.textOutStart));
    intro.style.opacity = String(1 - out);
    intro.style.transform = `translate3d(0, ${-SCROLL.textRise * out}px, 0)`;
    // sakrij ga skroz da dugme ne hvata klikove kad se vise ne vidi
    intro.style.visibility = out > 0.98 ? "hidden" : "visible";
  }, -2);

  return null;
}

/**
 * Ravan koja hvata sjenku dasaka. shadowMaterial crta SAMO sjenku, pa ispod
 * poda ne ostaje siva ploca. Spustena je malo nize od poda da se u frontalnom
 * kadru vidi mekan obrub oko dasaka.
 *
 * Gasi se dok nijedna daska nije u dometu: VSM sjenke po praznoj mapi ostavljaju
 * blijede mrlje, a one bi se na bijelom vidjele u uvodnom frejmu.
 */
function ShadowCatcher({
  count,
  progressRef,
  animated,
  isMobile,
}: {
  count: number;
  progressRef: ProgressRef;
  animated: boolean;
  isMobile: boolean;
}) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(() => {
    const mesh = ref.current;
    if (!mesh) return;
    mesh.visible = animated ? anyPlankCasts(progressRef.current.assembly, count, isMobile) : true;
  });

  return (
    <mesh ref={ref} receiveShadow rotation-x={-Math.PI / 2} position-y={-0.55}>
      <planeGeometry args={[80, 80]} />
      <shadowMaterial transparent color="#3b2e20" opacity={0.24} />
    </mesh>
  );
}

// ---------------------------------------------------------------------- scena

function SceneContents({
  count,
  progressRef,
  animated,
  isMobile,
}: {
  count: number;
  progressRef: ProgressRef;
  animated: boolean;
  isMobile: boolean;
}) {
  return (
    <>
      <CameraRig
        progressRef={progressRef}
        animated={animated}
        isMobile={isMobile}
        count={count}
      />

      {/* toplo svjetlo, uskladjeno sa smedjom pozadinom - bez hladnih highlightova */}
      <ambientLight intensity={0.55} color="#ffeedd" />
      <directionalLight
        castShadow
        position={[4, 13, 6]}
        intensity={2.1}
        color="#ffe7c9"
        shadow-mapSize={[1024, 1024]}
        shadow-radius={9}
        shadow-blurSamples={16}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
        shadow-camera-near={1}
        shadow-camera-far={44}
        shadow-camera-left={-14}
        shadow-camera-right={14}
        shadow-camera-top={14}
        shadow-camera-bottom={-14}
      />

      {/* refleksije bez skidanja HDRI-ja sa mreze - okolina se crta u sceni */}
      <Environment resolution={128} frames={1}>
        <color attach="background" args={["#e6d8c4"]} />
        <Lightformer
          form="rect"
          intensity={3}
          color="#ffeed6"
          position={[0, 6, -5]}
          rotation={[Math.PI / 2, 0, 0]}
          scale={[14, 8, 1]}
        />
        <Lightformer
          form="rect"
          intensity={1.3}
          color="#ffdfba"
          position={[-7, 2, 2]}
          rotation={[0, Math.PI / 2, 0]}
          scale={[9, 6, 1]}
        />
        <Lightformer
          form="rect"
          intensity={0.8}
          color="#fff6ea"
          position={[7, 1.5, 3]}
          rotation={[0, -Math.PI / 2, 0]}
          scale={[9, 5, 1]}
        />
      </Environment>

      <Planks count={count} progressRef={progressRef} animated={animated} isMobile={isMobile} />

      <ShadowCatcher
        count={count}
        progressRef={progressRef}
        animated={animated}
        isMobile={isMobile}
      />
    </>
  );
}

export type PlankSceneProps = {
  /** false = prefers-reduced-motion, crta se samo krajnje stanje. */
  animated: boolean;
  isMobile: boolean;
  /** Pauzira render petlju kad hero nije na ekranu. */
  active: boolean;
  /** Sekcija iz koje se cita progres scrolla. */
  sectionRef: React.RefObject<HTMLElement | null>;
  /** Uvodni blok sa logom i dugmetom - gasi se na scroll. */
  introRef: React.RefObject<HTMLElement | null>;
};

export default function PlankScene({
  animated,
  isMobile,
  active,
  sectionRef,
  introRef,
}: PlankSceneProps) {
  const count = isMobile ? MOBILE_PLANK_COUNT : PLANKS.length;
  const progressRef = useRef<Phase>({ assembly: animated ? 0 : 1, pan: 0 });

  const contents = <SceneContents count={count} progressRef={progressRef} animated={animated} isMobile={isMobile} />;

  return (
    // key: prelazak preko mobilnog praga mijenja fov, broj dasaka i materijale,
    // pa je cistije podici scenu iznova nego mijenjati kameru u hodu
    <Canvas
      key={isMobile ? "mobile" : "desktop"}
      shadows="variance"
      dpr={isMobile ? [1, 1.5] : [1, 2]}
      frameloop={!active ? "never" : animated ? "always" : "demand"}
      // alpha + nigdje scene.background: pozadinska slika je CSS ispod canvasa
      gl={{
        antialias: true,
        alpha: true,
        toneMapping: THREE.NeutralToneMapping,
        toneMappingExposure: 1.05,
      }}
    >
      <Suspense fallback={null}>
        {animated && (
          <ScrollReader
            sectionRef={sectionRef}
            progressRef={progressRef}
            introRef={introRef}
          />
        )}
        {contents}
      </Suspense>
    </Canvas>
  );
}
