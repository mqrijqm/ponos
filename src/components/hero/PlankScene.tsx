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

import { HERO_COLORS, MARKER_REVEAL, SCROLL } from "./hero-content";
import type { MarkerHandle } from "./HeroMarkers";
import {
  CAMERA,
  DECORS,
  FADE_DEPTH,
  MARKER_ANCHOR,
  METERS_PER_UNIT,
  MOBILE_PLANK_COUNT,
  PLANK,
  PLANKS,
  PLANK_TEXTURE,
  ROUGH_MAP_MEAN,
  SHOWCASE_PLANKS,
  SCROLL_DAMPING,
  SHADOW_RADIUS,
  anyPlankCasts,
  type CameraKeyframe,
  type PlankDef,
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
  liftProgress,
  markerProgress,
  showcaseProgress,
  showcaseSlot,
  showcaseTransform,
  startPosition,
  texturePaths,
} from "./plank-config";

/**
 * Mutabilna kutija za scroll progres - da se React ne renderuje na svaki frame.
 * Dvije faze: `assembly` je sklapanje poda, `pan` je listanje duz redova.
 */
type Phase = { assembly: number; pan: number; lift: number; showcase: number };
type ProgressRef = { current: Phase };

/** Tri fajla, jedan set za sve daske. Boja dolazi iz DECORS, ne iz teksture. */
const TEXTURE_URLS = texturePaths();

// -------------------------------------------------------------------- teksture

/**
 * Podesava UV jedne teksture za jednu dasku.
 *
 * Tekstura pokriva `physicalSize` metara stvarnog poda, a nasa daska je
 * 1.22 x 0.19 m - dakle uzimamo tanku traku iz otiska, ne cijeli otisak.
 * Svaka daska dobija svoj pomak (`uv`) pa se ponavljanje ne primjecuje: sve
 * daske dijele jednu teksturu, pa je taj pomak jedino sto sprjecava da se vidi
 * isti cvor u svakom redu.
 */
function configureUv(tex: THREE.Texture, uv: [number, number]) {
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;

  const along = (PLANK.length * METERS_PER_UNIT) / PLANK_TEXTURE.physicalSize;
  const across = (PLANK.width * METERS_PER_UNIT) / PLANK_TEXTURE.physicalSize;

  // centar trake popreko se hvata na sredinu jedne daske iz teksture, da nasa
  // daska ne pokupi fugu iz fotografije
  const acrossCenter = ((Math.round(uv[1]) % PLANK_TEXTURE.strips) + 0.5) / PLANK_TEXTURE.strips;
  const alongStart = uv[0] % 1;

  tex.repeat.set(along, across);
  tex.offset.set(alongStart, acrossCenter - across / 2);
}

function usePlankMaterials(defs: PlankDef[]) {
  const maxAnisotropy = useThree((s) => s.gl.capabilities.getMaxAnisotropy());
  const loaded = useTexture(TEXTURE_URLS);

  const materials = useMemo(() => {
    const anisotropy = Math.min(8, maxAnisotropy);

    return defs.map((def) => {
      const decor = DECORS[def.decor];
      const slots = ["map", "normalMap", "roughnessMap"] as const;

      const maps = {} as Record<(typeof slots)[number], THREE.Texture>;
      for (const slot of slots) {
        const clone = loaded[slot].clone();
        // mapa boje je boja -> sRGB; normal i roughness su podaci -> linearno
        clone.colorSpace = slot === "map" ? THREE.SRGBColorSpace : THREE.NoColorSpace;
        clone.anisotropy = anisotropy;
        configureUv(clone, def.uv);
        maps[slot] = clone;
      }

      return new THREE.MeshStandardMaterial({
        ...maps,
        // mapa je siva, pa je OVO jedina boja daske
        color: decor.color,
        // three mnozi roughness sa mapom, a mapa je tamna (prosjek 0.377) -
        // zato se dijeli, da stvarna hrapavost padne na zadatu vrijednost
        roughness: decor.roughness / ROUGH_MAP_MEAN,
        metalness: 0,
        // transparent od pocetka, ne tek kad daska pocne da nestaje: paljenje
        // transparentnosti u hodu tjera three da rekompajlira shader, a to je
        // vidljiv zastoj usred scrolla
        transparent: true,
        normalScale: new THREE.Vector2(0.85, 0.85),
        // nize nego prije: odsjaj okoline se DODAJE na boju, pa na tamnim
        // dekorima (antracit, orah) najvise i pojede boju - antracit posivi
        envMapIntensity: 0.35,
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
  material: THREE.MeshStandardMaterial;
  progressRef: ProgressRef;
  animated: boolean;
  isMobile: boolean;
  markersRef: React.RefObject<MarkerHandle | null>;
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
  markersRef,
}: PlankProps) {
  const ref = useRef<THREE.Mesh>(null);
  /** Redni broj medju izdvojenim daskama, ili -1 ako ova ostaje u podu. */
  const slot = showcaseSlot(index);

  const start = startPosition(def, isMobile);
  // pri montiranju (i u reduced motion) pod stoji na pocetku listanja
  const rest = finalTransform(index, count, isMobile, panOffset(0, isMobile));

  /** Radna tacka za projekciju sidrista - da se ne pravi nova svaki frejm. */
  const anchor = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ camera, size }) => {
    const mesh = ref.current;
    if (!animated || !mesh) return;

    const { assembly, pan, lift, showcase } = progressRef.current;

    // --- sklapanje i listanje: kao i do sada -------------------------------
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

    // --- FAZA A: izdvajanje ------------------------------------------------
    const l = easeOutCubic(lift);

    if (slot >= 0) {
      // Daska koja ostaje: iz reda u zavrsnu pozu. Lebdenje (FAZA B) je vec
      // ukracunato u ciljnu pozu, pa se ne mijesa u ovu interpolaciju.
      const target = showcaseTransform(slot, isMobile, showcase);
      mesh.position.set(
        lerp(mesh.position.x, target.position[0], l),
        lerp(mesh.position.y, target.position[1], l),
        lerp(mesh.position.z, target.position[2], l),
      );
      mesh.rotation.set(
        lerp(mesh.rotation.x, target.rotation[0], l),
        lerp(mesh.rotation.y, target.rotation[1], l),
        lerp(mesh.rotation.z, target.rotation[2], l),
      );
      material.opacity = 1;
    } else {
      // Ostale: nestaju i povlace se dublje, ne gase se naglo. Fade je brzi od
      // pomjeranja, pa daska ne stigne da se vidi kako "pada".
      material.opacity = 1 - clamp(l * 1.35);
      mesh.position.y -= FADE_DEPTH * l;
    }

    mesh.visible = material.opacity > 0.01;

    // Daska koja je jos daleko van kadra i dalje baca sjenku na ravan ispod, a
    // ta sjenka moze pasti unutar kadra. Zato sjenku pali tek kad se priblizi.
    mesh.castShadow =
      material.opacity > 0.5 &&
      (slot >= 0 || Math.hypot(mesh.position.x, mesh.position.y) < SHADOW_RADIUS);

    // --- FAZA C: sidriste pokazivaca u ekranske koordinate -----------------
    if (slot < 0) return;

    const markers = markersRef.current;
    if (!markers) return;

    // lokalna tacka na gornjoj povrsini -> svijet -> normalizovane koordinate
    anchor.set(...MARKER_ANCHOR[slot]);
    mesh.localToWorld(anchor);
    anchor.project(camera);

    markers.place(
      slot,
      (anchor.x * 0.5 + 0.5) * size.width,
      (-anchor.y * 0.5 + 0.5) * size.height,
      markerProgress(showcase, slot),
      // iza kamere ili van kadra - pokazivac bi visio u praznom
      anchor.z < 1 && Math.abs(anchor.x) < 0.98 && Math.abs(anchor.y) < 0.98,
    );
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

/**
 * Staticni raspored za prefers-reduced-motion: bez ijednog frejma animacije
 * odmah se crta zavrsnica - dvije daske u zavrsnoj pozi, ostalih nema.
 */
function StaticShowcase({
  geometry,
  materials,
  isMobile,
  markersRef,
}: {
  geometry: THREE.BufferGeometry;
  materials: THREE.MeshStandardMaterial[];
  isMobile: boolean;
  markersRef: React.RefObject<MarkerHandle | null>;
}) {
  const group = useRef<THREE.Group>(null);
  const anchor = useMemo(() => new THREE.Vector3(), []);

  // jedan prolaz kroz useFrame: kamera je gotova tek poslije prvog frejma, pa
  // se sidrista ne mogu projektovati u efektu
  useFrame(({ camera, size }) => {
    const meshes = group.current?.children;
    if (!meshes) return;

    for (let slot = 0; slot < meshes.length; slot++) {
      anchor.set(...MARKER_ANCHOR[slot]);
      meshes[slot].localToWorld(anchor);
      anchor.project(camera);
      markersRef.current?.place(
        slot,
        (anchor.x * 0.5 + 0.5) * size.width,
        (-anchor.y * 0.5 + 0.5) * size.height,
        1,
        true,
      );
    }
  });

  return (
    <group ref={group}>
      {SHOWCASE_PLANKS.map((index, slot) => {
        const pose = showcaseTransform(slot, isMobile, 0);
        return (
          <mesh
            key={index}
            geometry={geometry}
            material={materials[slot]}
            position={pose.position}
            rotation={pose.rotation}
            castShadow
            receiveShadow
          />
        );
      })}
    </group>
  );
}

function Planks({
  count,
  progressRef,
  animated,
  isMobile,
  markersRef,
}: {
  count: number;
  progressRef: ProgressRef;
  animated: boolean;
  isMobile: boolean;
  markersRef: React.RefObject<MarkerHandle | null>;
}) {
  // u reduced motion se crtaju samo dvije daske, pa se ni materijali za
  // ostale ne prave
  const defs = useMemo(
    () => (animated ? PLANKS.slice(0, count) : SHOWCASE_PLANKS.map((i) => PLANKS[i])),
    [animated, count],
  );
  const materials = usePlankMaterials(defs);

  const geometry = useMemo(
    () => new THREE.BoxGeometry(PLANK.length, PLANK.thickness, PLANK.width, ...PLANK.segments),
    [],
  );
  useEffect(() => () => geometry.dispose(), [geometry]);

  if (!animated) {
    return (
      <StaticShowcase
        geometry={geometry}
        materials={materials}
        isMobile={isMobile}
        markersRef={markersRef}
      />
    );
  }

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
          markersRef={markersRef}
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
  backdropRef,
}: {
  sectionRef: React.RefObject<HTMLElement | null>;
  progressRef: ProgressRef;
  introRef: React.RefObject<HTMLElement | null>;
  backdropRef: React.RefObject<HTMLElement | null>;
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
    progressRef.current.lift = liftProgress(offset);
    progressRef.current.showcase = showcaseProgress(offset);

    // Tamna pozadina zavrsne sekcije se ne mijesa u boju nego se preklapa
    // preko bijele - mijenja se samo opacity, jedan broj po frejmu.
    const backdrop = backdropRef.current;
    if (backdrop) {
      // x1.6: pozadina potamni prije nego daske stignu u pozu. Prelaz bijelo ->
      // tamno ide kroz sivo, a sivo je jedina ruzna tacka - neka traje kratko.
      backdrop.style.opacity = String(easeOutCubic(clamp(progressRef.current.lift * 1.6)));
    }

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
    // gasi se i cim krene izdvajanje: daske su tad u vazduhu, a ravan-hvatac
    // bi ispod njih ostavio mrlju na tamnoj pozadini
    mesh.visible = animated
      ? progressRef.current.lift < 0.02 &&
        anyPlankCasts(progressRef.current.assembly, count, isMobile)
      : false;
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
  markersRef,
}: {
  count: number;
  progressRef: ProgressRef;
  animated: boolean;
  isMobile: boolean;
  markersRef: React.RefObject<MarkerHandle | null>;
}) {
  return (
    <>
      <CameraRig
        progressRef={progressRef}
        animated={animated}
        isMobile={isMobile}
        count={count}
      />

      {/*
        NEUTRALNO BIJELO svjetlo, bez toplog tinta. Paleta ima i hladne dekore
        (antracit, sivi hrast) i tople (svijetli hrast, orah). Cim se na izvor
        stavi topao tint, hladni dekori odu u prljavo bez.

        ambient je namjerno visok: antracit (#334144) je toliko taman da mu u
        sjeni nestane zrno i daska postane crna mrlja. Ovo je rucica za to -
        ako antracit i dalje "propada", podigni ambient prije nego sto diras boju.
      */}
      <ambientLight intensity={0.6} color="#ffffff" />
      <directionalLight
        castShadow
        position={[4, 13, 6]}
        intensity={2.1}
        color="#ffffff"
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
        {/* neutralno sivo, ne bez - okolina se odbija od dasaka i tintuje ih */}
        <color attach="background" args={["#dedede"]} />
        <Lightformer
          form="rect"
          intensity={3}
          color="#ffffff"
          position={[0, 6, -5]}
          rotation={[Math.PI / 2, 0, 0]}
          scale={[14, 8, 1]}
        />
        <Lightformer
          form="rect"
          intensity={1.3}
          color="#ffffff"
          position={[-7, 2, 2]}
          rotation={[0, Math.PI / 2, 0]}
          scale={[9, 6, 1]}
        />
        <Lightformer
          form="rect"
          intensity={0.8}
          color="#ffffff"
          position={[7, 1.5, 3]}
          rotation={[0, -Math.PI / 2, 0]}
          scale={[9, 5, 1]}
        />
      </Environment>

      <Planks
        count={count}
        progressRef={progressRef}
        animated={animated}
        isMobile={isMobile}
        markersRef={markersRef}
      />

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
  /** Tamna pozadina zavrsne sekcije - pali se tokom izdvajanja. */
  backdropRef: React.RefObject<HTMLElement | null>;
  /** Ruckica za pokazivace iznad canvasa (FAZA C). */
  markersRef: React.RefObject<MarkerHandle | null>;
};

export default function PlankScene({
  animated,
  isMobile,
  active,
  sectionRef,
  introRef,
  backdropRef,
  markersRef,
}: PlankSceneProps) {
  const count = isMobile ? MOBILE_PLANK_COUNT : PLANKS.length;
  const progressRef = useRef<Phase>({
    assembly: animated ? 0 : 1,
    pan: 0,
    lift: animated ? 0 : 1,
    showcase: 0,
  });

  const contents = (
    <SceneContents
      count={count}
      progressRef={progressRef}
      animated={animated}
      isMobile={isMobile}
      markersRef={markersRef}
    />
  );

  return (
    // key: prelazak preko mobilnog praga mijenja fov, broj dasaka i materijale,
    // pa je cistije podici scenu iznova nego mijenjati kameru u hodu
    <Canvas
      key={isMobile ? "mobile" : "desktop"}
      /*
        PCF soft, ne VSM. VSM na velikom radijusu "propusta svjetlo" - sjenka
        jedne daske preko druge ispadne kao SVJETLIJA mrlja umjesto tamnija, a
        u zavrsnici dvije daske stoje jedna preko druge pa se to odmah vidi.
      */
      shadows="soft"
      dpr={isMobile ? [1, 1.5] : [1, 2]}
      frameloop={!active ? "never" : animated ? "always" : "demand"}
      // alpha + nigdje scene.background: pozadinska slika je CSS ispod canvasa
      gl={{
        antialias: true,
        alpha: true,
        toneMapping: THREE.NeutralToneMapping,
        // 0.88, ne 1.05: mapa boje je sad svijetla siva pa je scena na staroj
        // ekspoziciji izlazila oko 15% svjetlija od zadatih boja iz DECORS
        toneMappingExposure: 0.88,
      }}
    >
      <Suspense fallback={null}>
        {animated && (
          <ScrollReader
            sectionRef={sectionRef}
            progressRef={progressRef}
            introRef={introRef}
            backdropRef={backdropRef}
          />
        )}
        {contents}
      </Suspense>
    </Canvas>
  );
}
