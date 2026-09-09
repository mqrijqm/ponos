"use client";

import { Suspense, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, PerspectiveCamera, useTexture } from "@react-three/drei";
import * as THREE from "three";

import {
  DASKA,
  Daska,
  EKRANA_SCROLLA,
  KAMERA,
  SET_HEROJA,
  Set,
  TALASANJE,
  UV_PONAVLJANJE,
  easeInOutCubic,
  easeOutCubic,
  napraviPod,
  udio,
} from "./floor-config";

/**
 * Scena heroja: pod od dasaka koji se na scroll raspada.
 *
 * Napredak scrolla NE ide kroz React state. Dolazi kao `ref` i cita se u
 * `useFrame` — da ide kroz state, svaki piksel scrolla bio bi novi render
 * cijelog stabla i scena bi kaskala za mišem.
 *
 * Statične daske su tri `InstancedMesh`-a, po jedan za svaki teksturni set:
 * dvadeset odvojenih mesh-eva bi bilo dvadeset draw callova za nesto sto se
 * nikad ne mice. Aktivne daske su obicni mesh-evi — njih je sedam, svaka ima
 * svoju teksturu sa slucajnim pomjerajem i svoj put kroz vazduh.
 */

type Teksture = { map: THREE.Texture; normalMap: THREE.Texture; roughnessMap: THREE.Texture };

/* Anizotropija: pod se gleda pod ostrim uglom, gdje mipmape inace razmazu
   godove u kasu. Osam je granica poslije koje se na ovoj sceni ne vidi razlika. */
const ANIZOTROPIJA = 8;

function putevi(set: Set) {
  return [
    `/textures/hero/${set}/diff.webp`,
    `/textures/hero/${set}/normal.webp`,
    `/textures/hero/${set}/rough.webp`,
  ];
}

/**
 * Ucitava jedan set — onaj kojim je pod obloxen — i namjesta mu boju,
 * ponavljanje i filtriranje. Ostala dva seta stoje na disku i ne skidaju se.
 */
function useSetHeroja(): Teksture {
  /*
    Namjestanje ide kroz `onLoad` callback samog `useTexture`, a ne poslije
    njega: lint (react-hooks/immutability) ne dozvoljava mijenjanje vrijednosti
    koju je hook vratio, a ovaj callback je dio njegovog ucitavanja.
  */
  const [map, normalMap, roughnessMap] = useTexture(putevi(SET_HEROJA), (ucitane) => {
    const sve = Array.isArray(ucitane) ? ucitane : [ucitane];
    /* Samo boja je u sRGB-u; normala i roughness su podaci i ostaju linearni. */
    if (sve[0]) sve[0].colorSpace = THREE.SRGBColorSpace;
    sve.forEach((tekstura) => {
      tekstura.wrapS = THREE.RepeatWrapping;
      tekstura.wrapT = THREE.RepeatWrapping;
      tekstura.repeat.set(...UV_PONAVLJANJE);
      tekstura.anisotropy = ANIZOTROPIJA;
    });
  });

  return useMemo(
    () => ({ map, normalMap, roughnessMap }),
    [map, normalMap, roughnessMap],
  );
}

/**
 * Kopija teksture sa svojim pomjerajem. Klon dijeli `source` sa originalom, pa
 * ne ide drugi put na grafičku — mijenja se samo kako se cita, ne sto se cita.
 */
function pomjerenaKopija(izvor: THREE.Texture, pomak: [number, number]) {
  const klon = izvor.clone();
  klon.offset.set(pomak[0], pomak[1]);
  return klon;
}

/* ── statične daske: pod koji ostaje ────────────────────────────── */

function StatickiPod({
  daske,
  geometrija,
  teksture,
}: {
  daske: Daska[];
  geometrija: THREE.BoxGeometry;
  teksture: Teksture;
}) {
  /* Cijeli pod je jedan materijal, pa je i jedan `InstancedMesh` — bez obzira
     na to koliko dasaka nosi, to je jedan draw call. */
  const clanovi = useMemo(() => daske.filter((d) => !d.aktivna), [daske]);
  if (!clanovi.length) return null;
  return <Grupa clanovi={clanovi} geometrija={geometrija} teksture={teksture} />;
}

function Grupa({
  clanovi,
  geometrija,
  teksture,
}: {
  clanovi: Daska[];
  geometrija: THREE.BoxGeometry;
  teksture: Teksture;
}) {
  const ref = useRef<THREE.InstancedMesh>(null);

  /* Matrice se upisuju jednom: statične daske se ne miču do kraja scrolla. */
  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const pomocni = new THREE.Object3D();
    clanovi.forEach((d, i) => {
      pomocni.position.set(...d.polozaj);
      pomocni.rotation.set(0, 0, 0);
      pomocni.scale.setScalar(1);
      pomocni.updateMatrix();
      mesh.setMatrixAt(i, pomocni.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [clanovi]);

  return (
    /*
      Pod prima sjenu, ali je ne baca: daske u podu su ravne jedna uz drugu i
      njihove sjene padaju same na sebe. Na velikoj povrsini to je izlazilo kao
      tamne pruge po podu (shadow acne), jer je jedan texel mape sjenke sirok
      oko dva centimetra scene. Bacaju samo podignute daske.
    */
    <instancedMesh
      ref={ref}
      args={[geometrija, undefined, clanovi.length]}
      castShadow={false}
      receiveShadow
    >
      <meshStandardMaterial {...teksture} roughness={1} metalness={0} />
    </instancedMesh>
  );
}

/* ── aktivne daske: one koje odlaze ─────────────────────────────── */

function AktivnaDaska({
  daska,
  geometrija,
  teksture,
  napredak,
  mirno,
}: {
  daska: Daska;
  geometrija: THREE.BoxGeometry;
  teksture: Teksture;
  napredak: React.RefObject<number>;
  mirno: boolean;
}) {
  const ref = useRef<THREE.Mesh>(null);

  /* Svoja kopija teksture, pomjerena — inace bi se sedam dasaka poklopilo u
     isti crtez godova i pod bi izgledao kao tapeta. */
  const svoje = useMemo(
    () => ({
      map: pomjerenaKopija(teksture.map, daska.uvPomak),
      normalMap: pomjerenaKopija(teksture.normalMap, daska.uvPomak),
      roughnessMap: pomjerenaKopija(teksture.roughnessMap, daska.uvPomak),
    }),
    [teksture, daska.uvPomak],
  );

  const primijeni = (p: number, vrijeme: number) => {
    const mesh = ref.current;
    if (!mesh) return;

    const t = easeOutCubic(udio(p, daska.pocetak, daska.kraj));
    const [x, y, z] = daska.polozaj;

    /* Dok se diže, daska blago drhti — put nije savrseno pravolinijski. */
    const drhtaj = mirno ? 0 : Math.sin(vrijeme * 2.1 + daska.faza) * daska.drhtaj * t;
    /* Kad je vec gore, ostaje mirno talasanje da kadar ne izgleda mrtav. */
    const talas =
      mirno || p < 0.6
        ? 0
        : Math.sin(vrijeme * 0.9 + daska.faza) * TALASANJE * udio(p, 0.6, 0.72);

    mesh.position.set(
      x + daska.zanos[0] * t,
      y + daska.visina * t + talas,
      z + daska.zanos[1] * t,
    );
    mesh.rotation.set(daska.nagib[0] * t + drhtaj, 0, daska.nagib[1] * t - drhtaj * 0.6);
    mesh.scale.setScalar(1 + (daska.uvecanje - 1) * t);
  };

  /* Bez animacije: krajnje stanje se upise jednom i tu ostaje. */
  useLayoutEffect(() => {
    if (mirno) primijeni(1, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mirno]);

  useFrame((stanje) => {
    if (mirno) return;
    primijeni(napredak.current ?? 0, stanje.clock.elapsedTime);
  });

  return (
    <mesh ref={ref} geometry={geometrija} castShadow receiveShadow={false}>
      <meshStandardMaterial {...svoje} roughness={1} metalness={0} />
    </mesh>
  );
}

/* ── kamera ─────────────────────────────────────────────────────── */

function Kamera({
  napredak,
  cilj,
  mirno,
}: {
  napredak: React.RefObject<number>;
  cilj: [number, number, number];
  mirno: boolean;
}) {
  /*
    Kamera se drzi kroz `ref`, a ne kroz `useThree(s => s.camera)`: lint
    (react-hooks/immutability) ne dozvoljava mijenjanje vrijednosti koju je
    vratio hook, a ovdje se mijenja svaki frejm. `makeDefault` je cini
    aktivnom kamerom scene.
  */
  const kameraRef = useRef<THREE.PerspectiveCamera>(null);
  const gledaj = useRef(new THREE.Vector3(...KAMERA.pocetniCilj));

  const postavi = (p: number) => {
    const kamera = kameraRef.current;
    if (!kamera) return;
    /*
      Kamera se do 0.6 pomjeri samo cetvrtinu puta — dok pod pucaju, kadar
      treba da stoji. Ostatak puta je tek poslije, kad se daske vec smire.
    */
    const t = easeInOutCubic(p < 0.6 ? (p / 0.6) * 0.25 : 0.25 + udio(p, 0.6, 1) * 0.75);

    const [x0, y0, z0] = KAMERA.pocetak.polozaj;
    const [x1, y1, z1] = KAMERA.kraj.polozaj;
    kamera.position.set(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, z0 + (z1 - z0) * t);

    kamera.fov = KAMERA.pocetak.fov + (KAMERA.kraj.fov - KAMERA.pocetak.fov) * t;
    kamera.updateProjectionMatrix();

    /* Pogled prelazi sa sredine poda na sredinu onoga sto lebdi. */
    const [cx, cy, cz] = cilj;
    const [px, py, pz] = KAMERA.pocetniCilj;
    gledaj.current.set(px + (cx - px) * t, py + (cy - py) * t, pz + (cz - pz) * t);
    kamera.lookAt(gledaj.current);
  };

  useLayoutEffect(() => {
    postavi(mirno ? 1 : 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mirno]);

  useFrame(() => {
    if (mirno) return;
    postavi(napredak.current ?? 0);
  });

  return (
    <PerspectiveCamera
      ref={kameraRef}
      makeDefault
      fov={KAMERA.pocetak.fov}
      position={[...KAMERA.pocetak.polozaj]}
      near={0.1}
      far={100}
    />
  );
}

/* ── scena ──────────────────────────────────────────────────────── */

function Scena({
  napredak,
  uzakEkran,
  mirno,
}: {
  napredak: React.RefObject<number>;
  uzakEkran: boolean;
  mirno: boolean;
}) {
  const teksture = useSetHeroja();
  const { daske, cilj } = useMemo(() => napraviPod(uzakEkran), [uzakEkran]);
  const invalidate = useThree((s) => s.invalidate);

  /* Segmenti po duzini: daska ostaje ravna, ali gusca mreza daje mekši prelaz
     osvjetljenja po duzini nego jedan cetvorougao od sest metara. */
  const geometrija = useMemo(
    () => new THREE.BoxGeometry(DASKA.duzina, DASKA.debljina, DASKA.sirina, 12, 1, 4),
    [],
  );

  /*
    Bez animacije scena crta samo kad je zatrazeno (`frameloop="demand"`), pa
    se prvi kadar mora zatraziti rucno — teksture stizu poslije montiranja.
  */
  useEffect(() => {
    if (mirno) invalidate();
  }, [mirno, invalidate, teksture]);

  useEffect(() => () => geometrija.dispose(), [geometrija]);

  const aktivne = daske.filter((d) => d.aktivna);

  return (
    <>
      <color attach="background" args={["#ffffff"]} />

      {/* Toplo svjetlo, jedno glavno sa mekom sjenkom. Sjena ispod lebdece
          daske je ono sto daje visinu — bez nje daska visi u nicemu. */}
      <ambientLight intensity={0.55} color="#fff4e6" />
      <directionalLight
        position={[4.5, 9, 5]}
        intensity={2.1}
        color="#fff1dd"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0008}
        shadow-camera-left={-14}
        shadow-camera-right={14}
        shadow-camera-top={14}
        shadow-camera-bottom={-14}
        shadow-camera-near={0.5}
        shadow-camera-far={30}
      />

      {/*
        Okruzenje za refleksije na laku daske. Gradi se od svjetlosnih ploca u
        sceni, ne skida se HDRI sa interneta — `preset` bi trazio fajl sa
        strane, sto ovdje ne smije.
      */}
      <Environment resolution={64} frames={1}>
        <Lightformer intensity={1.2} position={[0, 6, 3]} scale={[12, 12, 1]} color="#fff6ea" />
        <Lightformer intensity={0.45} position={[-7, 3, -4]} scale={[9, 9, 1]} color="#ffe6c9" />
      </Environment>

      {/*
        Podloga koja se vidi kroz rupe odakle su daske otisle. Boja je izrazito
        tamnija od pozadine: na svijetloj podlozi rupa se citala kao praznina u
        renderu, a ne kao dubina ispod poda.
      */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.002, 0]} receiveShadow>
        <planeGeometry args={[90, 90]} />
        <meshStandardMaterial color="#6f6153" roughness={0.95} metalness={0} />
      </mesh>

      <StatickiPod daske={daske} geometrija={geometrija} teksture={teksture} />

      {aktivne.map((d) => (
        <AktivnaDaska
          key={d.id}
          daska={d}
          geometrija={geometrija}
          teksture={teksture}
          napredak={napredak}
          mirno={mirno}
        />
      ))}

      <Kamera napredak={napredak} cilj={cilj} mirno={mirno} />
    </>
  );
}

export default function FloorScene({
  napredak,
  uzakEkran,
  mirno,
}: {
  napredak: React.RefObject<number>;
  uzakEkran: boolean;
  mirno: boolean;
}) {
  return (
    <Canvas
      /* Telefon nema sta da radi sa dva puta gustom mrezom piksela. */
      dpr={uzakEkran ? [1, 1.5] : [1, 2]}
      shadows
      /* Bez animacije nema petlje: scena se nacrta i stoji. */
      frameloop={mirno ? "demand" : "always"}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      /* Sekvenca je duga; kad hero izade iz kadra, Hero3D demontira canvas. */
      style={{ position: "absolute", inset: 0 }}
    >
      <Suspense fallback={null}>
        <Scena napredak={napredak} uzakEkran={uzakEkran} mirno={mirno} />
      </Suspense>
    </Canvas>
  );
}

export { EKRANA_SCROLLA };
