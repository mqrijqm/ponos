"use client";

import { Environment, Html, Lightformer, PerspectiveCamera, useTexture } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import Image from "next/image";
import * as THREE from "three";

import {
  BACKGROUND,
  CAMERA,
  LAYERS,
  SCROLL_SMOOTHING,
  clamp,
  createProfileGeometry,
  createSlabGeometry,
  easeOutCubic,
  fitDistance,
  layerY,
  lerp,
  markerOpacity,
  separateProgress,
} from "./layer-config";

/**
 * Progres scrolla zivi u mutabilnoj kutiji, ne u state-u - inace bi se React
 * renderovao na svaki frejm scrolla.
 */
type ProgressRef = { current: number };

/** Ravan spisak svih mapa, u obliku koji useTexture ocekuje. */
const TEXTURE_URLS: Record<string, string> = {};
for (const layer of LAYERS) {
  const def = layer.materijal;
  if (def.vrsta !== "teksture") continue;
  TEXTURE_URLS[`${layer.id}.map`] = def.map;
  TEXTURE_URLS[`${layer.id}.normalMap`] = def.normalMap;
  if (def.roughnessMap) TEXTURE_URLS[`${layer.id}.roughnessMap`] = def.roughnessMap;
}

// ---------------------------------------------------------------- materijali

function useLayerMaterials() {
  const maxAnisotropy = useThree((s) => s.gl.capabilities.getMaxAnisotropy());
  const loaded = useTexture(TEXTURE_URLS);

  const materials = useMemo(() => {
    const anisotropy = Math.min(8, maxAnisotropy);

    return LAYERS.map((layer) => {
      const def = layer.materijal;

      if (def.vrsta === "folija") {
        // transmission umjesto obicne prozirnosti: svjetlo prolazi KROZ sloj i
        // lomi se, pa folija dobije debljinu umjesto da izgleda kao rupa
        return new THREE.MeshPhysicalMaterial({
          color: def.boja,
          transmission: def.transmission,
          thickness: def.thickness,
          roughness: def.roughness,
          ior: def.ior,
          attenuationColor: new THREE.Color(def.attenuationColor),
          attenuationDistance: def.attenuationDistance,
          // Odsjaj je ono sto oku kaze "folija", ali mora ostati odsjaj a ne
          // pokrivac. Kod transmisije boja mnozi i ono sto prolazi kroz sloj,
          // pa tinta ide kroz attenuationColor a `boja` ostaje neutralna -
          // inace folija posvijetli iznad pozadine i ispadne bijela ploca.
          specularIntensity: 0.25,
          clearcoat: 0.15,
          clearcoatRoughness: 0.18,
          metalness: 0,
          envMapIntensity: 0.12,
        });
      }

      if (def.vrsta === "ravna") {
        return new THREE.MeshStandardMaterial({
          color: def.boja,
          roughness: def.roughness,
          metalness: 0,
          // nisko, inace bijela okolina isprazni boju u skoro bijelo
          envMapIntensity: 0.12,
        });
      }

      // UV su u JEDINICAMA SCENE (i ExtrudeGeometry i nas box projekcija rade
      // tako), pa je repeat prosto 1/tile - isti otisak i na povrsini i na
      // bocnom presjeku, bez razvlacenja.
      const repeat = 1 / def.tile;
      const maps: Partial<Record<"map" | "normalMap" | "roughnessMap", THREE.Texture>> = {};

      for (const slot of ["map", "normalMap", "roughnessMap"] as const) {
        const source = loaded[`${layer.id}.${slot}`];
        if (!source) continue;

        const texture = source.clone();
        // boja je slika -> sRGB; normala i roughness su podaci -> linearno
        texture.colorSpace = slot === "map" ? THREE.SRGBColorSpace : THREE.NoColorSpace;
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(repeat, repeat);
        texture.anisotropy = anisotropy;
        maps[slot] = texture;
      }

      return new THREE.MeshStandardMaterial({
        ...maps,
        color: def.boja ?? "#ffffff",
        roughness: def.roughness,
        metalness: 0,
        normalScale: new THREE.Vector2(def.normalScale, def.normalScale),
        envMapIntensity: 0.4,
      });
    });
  }, [loaded, maxAnisotropy]);

  useEffect(() => {
    return () => {
      for (const material of materials) {
        if ("map" in material) {
          material.map?.dispose();
          material.normalMap?.dispose();
          material.roughnessMap?.dispose();
        }
        material.dispose();
      }
    };
  }, [materials]);

  return materials;
}

// ------------------------------------------------------------------- markeri

/**
 * Numerisani krug uz desnu ivicu sloja.
 *
 * Svaki marker sam gasi i pali svoju prozirnost, umjesto da to radi jedna
 * petlja nad nizom refova - tako nema mutiranja tudjeg refa i React compiler
 * je miran. Pet useFrame poziva po frejmu je nista.
 *
 * useFrame MORA biti ovdje, iznad <Html>: Html svoju djecu prebacuje u obicni
 * DOM izvan R3F stabla, pa unutra nema ni scene ni render petlje.
 */
function Marker({
  index,
  anchor,
  size,
  progressRef,
  animated,
}: {
  index: number;
  anchor: [number, number, number];
  size: number;
  progressRef: ProgressRef;
  animated: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useFrame(() => {
    const el = ref.current;
    if (!el || !animated) return;
    const opacity = markerOpacity(progressRef.current, index);
    el.style.opacity = String(opacity);
    el.style.transform = `translate3d(0, ${(1 - opacity) * 6}px, 0)`;
  });

  return (
    <Html position={anchor} center occlude={false} zIndexRange={[20, 0]}>
      <div
        ref={ref}
        // pocinje ugaseno kad ima animacije; iznad je useFrame koji ga pali
        style={{
          opacity: animated ? 0 : 1,
          width: size,
          height: size,
          pointerEvents: "none",
          userSelect: "none",
        }}
      >
        {/*
          Krug, prsten i cifra su u samom SVG-u, pa ovdje nema ni pozadine ni
          rama. unoptimized: SVG je vec vektor, nema sta da se skalira.
        */}
        <Image
          src={`/images/layers/markers/marker-${index + 1}.svg`}
          alt=""
          width={size}
          height={size}
          unoptimized
          draggable={false}
          style={{ display: "block", width: size, height: size }}
        />
      </div>
    </Html>
  );
}

// ------------------------------------------------------------------- slojevi

function Layers({
  progressRef,
  animated,
  isMobile,
}: {
  progressRef: ProgressRef;
  animated: boolean;
  isMobile: boolean;
}) {
  const materials = useLayerMaterials();
  const groups = useRef<(THREE.Group | null)[]>([]);

  const geometries = useMemo(
    () =>
      LAYERS.map((layer) =>
        layer.profil ? createProfileGeometry(layer.debljina) : createSlabGeometry(layer.debljina),
      ),
    [],
  );
  useEffect(() => () => geometries.forEach((g) => g.dispose()), [geometries]);

  useFrame(() => {
    if (!animated) return;
    const progress = separateProgress(progressRef.current);
    for (let i = 0; i < groups.current.length; i++) {
      const group = groups.current[i];
      if (group) group.position.y = layerY(i, progress);
    }
  }, -1);

  const markerSize = isMobile ? 26 : 34;

  return (
    <group>
      {LAYERS.map((layer, i) => (
        <group
          key={layer.id}
          ref={(node) => {
            groups.current[i] = node;
          }}
          // JSX vrijednost je KRAJNJE stanje kad nema animacije - tako je
          // staticni render tacan bez i jednog frejma
          position={[0, layerY(i, animated ? 0 : 1), 0]}
        >
          <mesh
            geometry={geometries[i]}
            material={materials[i]}
            // folija ne baca sjenku - providan sloj bi bacio punu crnu mrlju
            castShadow={layer.materijal.vrsta !== "folija"}
            receiveShadow
          />

          <Marker
            index={i}
            anchor={layer.anchor}
            size={markerSize}
            progressRef={progressRef}
            animated={animated}
          />
        </group>
      ))}
    </group>
  );
}

// --------------------------------------------------------------------- kamera

function CameraRig({
  progressRef,
  animated,
  isMobile,
}: {
  progressRef: ProgressRef;
  animated: boolean;
  isMobile: boolean;
}) {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const size = useThree((s) => s.size);
  const target = useMemo(() => new THREE.Vector3(), []);

  const view = isMobile ? CAMERA.mobile : CAMERA.desktop;
  const aspect = size.width / size.height;

  const place = (p: number) => {
    const camera = cameraRef.current;
    if (!camera) return;

    const e = easeOutCubic(clamp(p));
    const { from, to } = view;

    const elevation = (lerp(from.elevation, to.elevation, e) * Math.PI) / 180;
    const azimuth = (lerp(from.azimuth, to.azimuth, e) * Math.PI) / 180;
    const fov = lerp(from.fov, to.fov, e);
    const targetY = lerp(from.targetY, to.targetY, e);
    const distance = fitDistance(fov, aspect, e, lerp(from.framing, to.framing, e));

    target.set(0, targetY, 0);
    const ground = Math.cos(elevation) * distance;
    camera.position.set(
      Math.sin(azimuth) * ground,
      targetY + Math.sin(elevation) * distance,
      Math.cos(azimuth) * ground,
    );
    camera.lookAt(target);

    if (camera.fov !== fov) {
      camera.fov = fov;
      camera.updateProjectionMatrix();
    }
  };

  // prvi frejm i svaka promjena velicine prozora - prije nego se bilo sta nacrta
  useLayoutEffect(() => {
    place(animated ? 0 : 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animated, isMobile, size.width, size.height]);

  useFrame(() => place(animated ? separateProgress(progressRef.current) : 1), -1);

  return <PerspectiveCamera ref={cameraRef} makeDefault near={0.1} far={80} />;
}

// --------------------------------------------------------------------- scroll

/**
 * Cita poziciju sekcije i pretvara je u progres 0-1, pa pali markere.
 *
 * Sekcija je visoka SCROLL_LENGTH_VH a unutar nje stoji sticky ekran; progres
 * je koliko je od te razlike prescrollano. Nista se ne renderuje kroz React.
 */
function ScrollReader({
  sectionRef,
  progressRef,
}: {
  sectionRef: React.RefObject<HTMLElement | null>;
  progressRef: ProgressRef;
}) {
  // visina canvasa je tacno visina sticky kontejnera, pouzdanije od innerHeight
  const viewportHeight = useThree((s) => s.size.height);

  useFrame((_, delta) => {
    const section = sectionRef.current;
    if (!section) return;

    const rect = section.getBoundingClientRect();
    const travel = rect.height - viewportHeight;
    const target = travel > 0 ? clamp(-rect.top / travel) : 0;

    // eksponencijalno prigusenje - isto na 60 i na 144 Hz, za razliku od
    // obicnog lerpa sa fiksnim koeficijentom
    progressRef.current +=
      (target - progressRef.current) * (1 - Math.exp(-delta / SCROLL_SMOOTHING));
  }, -2);

  return null;
}

// ---------------------------------------------------------------------- scena

/**
 * Ravan koja hvata sjenku. shadowMaterial crta SAMO sjenku - obican materijal
 * bi ostavio sivi pravougaonik preko bijele pozadine.
 */
function ShadowCatcher() {
  return (
    <mesh receiveShadow rotation-x={-Math.PI / 2} position-y={-0.75}>
      <planeGeometry args={[40, 40]} />
      {/* svijetla i topla, da ne otvori rupu u bijelom */}
      <shadowMaterial transparent color="#8a7a6a" opacity={0.16} />
    </mesh>
  );
}

function SceneContents({
  sectionRef,
  progressRef,
  animated,
  isMobile,
}: {
  sectionRef: React.RefObject<HTMLElement | null>;
  progressRef: ProgressRef;
  animated: boolean;
  isMobile: boolean;
}) {
  return (
    <>
      {animated && <ScrollReader sectionRef={sectionRef} progressRef={progressRef} />}

      <CameraRig progressRef={progressRef} animated={animated} isMobile={isMobile} />

      {/* neutralno bijelo, bez toplog tona - boja treba da dodje iz materijala */}
      <ambientLight intensity={0.5} color="#ffffff" />

      {/*
        Key sa strane i nisko. Da dolazi odozgo, bocni presjeci bi bili ravno
        osvijetljeni i slojevi bi izgledali kao papiri; ovako svjetlo klizi
        preko presjeka i debljina se vidi.
      */}
      <directionalLight
        castShadow
        position={[6, 5, 4]}
        intensity={2}
        color="#ffffff"
        shadow-mapSize={[1024, 1024]}
        shadow-radius={10}
        shadow-blurSamples={16}
        shadow-bias={-0.0004}
        shadow-normalBias={0.01}
        shadow-camera-near={1}
        shadow-camera-far={24}
        shadow-camera-left={-4}
        shadow-camera-right={4}
        shadow-camera-top={4}
        shadow-camera-bottom={-4}
      />

      {/* fill sa suprotne strane, bez sjenke - da tamna strana ne padne u crno */}
      <directionalLight position={[-5, 2, 3]} intensity={0.55} color="#ffffff" />

      {/*
        Okolina se crta u sceni umjesto skidanja HDRI-ja. Foliji treba nesto da
        lomi, inace transmission nema sta da pokaze.
      */}
      <Environment resolution={128} frames={1}>
        {/*
          Okolina mora biti boje stranice. Transmisija i odsjaji uzimaju boju
          odavde, a ne iz CSS-a - platno je providno i scena ne zna sta je iza
          njega. Bijela okolina preko krem stranice pretvori foliju u bijelu
          plocu.
        */}
        <color attach="background" args={[BACKGROUND]} />
        {/*
          Gornje svjetlo je namjerno usko i pomjereno sa ose. Siroka ploca tacno
          iznad se preslika preko cijele folije i pretvori je u bijelu povrsinu;
          ovako padne kao kosa pruga i drvo se vidi kroz nju.
        */}
        <Lightformer form="rect" intensity={1.8} color="#ffffff" position={[-3, 6, 3]} rotation={[Math.PI / 2, 0, 0]} scale={[5, 2.5, 1]} />
        <Lightformer form="rect" intensity={1.1} color="#ffffff" position={[-6, 1, 3]} rotation={[0, Math.PI / 2, 0]} scale={[8, 5, 1]} />
        <Lightformer form="rect" intensity={0.8} color="#ffffff" position={[6, 1, 3]} rotation={[0, -Math.PI / 2, 0]} scale={[8, 5, 1]} />
      </Environment>

      <Layers progressRef={progressRef} animated={animated} isMobile={isMobile} />

      <ShadowCatcher />
    </>
  );
}

export type LayerSceneProps = {
  /** Sekcija koja nosi scroll; iz nje se cita progres. */
  sectionRef: React.RefObject<HTMLElement | null>;
  /** false = prefers-reduced-motion: odmah razdvojeno stanje sa markerima. */
  animated: boolean;
  isMobile: boolean;
  /** Pauzira render petlju kad sekcija nije na ekranu. */
  active: boolean;
};

export default function LayerScene({ sectionRef, animated, isMobile, active }: LayerSceneProps) {
  const progressRef = useRef(animated ? 0 : 1);

  return (
    // key: prelazak preko mobilnog praga mijenja fov, kadar i velicinu markera
    <Canvas
      key={isMobile ? "mobile" : "desktop"}
      shadows="variance"
      dpr={[1, 2]}
      frameloop={!active ? "never" : animated ? "always" : "demand"}
      // alpha, i nigdje scene.background: bijelo dolazi iz CSS-a na sticky
      // kontejneru, pa se sjenka na shadowMaterial-u stapa sa pozadinom
      gl={{
        antialias: true,
        alpha: true,
        toneMapping: THREE.NeutralToneMapping,
        toneMappingExposure: 1.05,
      }}
    >
      <Suspense fallback={null}>
        <SceneContents
          sectionRef={sectionRef}
          progressRef={progressRef}
          animated={animated}
          isMobile={isMobile}
        />
      </Suspense>
    </Canvas>
  );
}
