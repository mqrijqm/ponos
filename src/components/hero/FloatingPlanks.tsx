"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Suspense, useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useTexture } from "@react-three/drei";

import {
  CAMERA,
  FLOAT_PERIOD,
  PLANK_SIZE,
  PLANKS,
} from "./sequence-config";

/**
 * Daske koje lebde - zivi nastavak snimka.
 *
 * Scena pocinje tacno tamo gdje snimak stane: iste pozicije, isti uglovi, ista
 * kamera. Pozadina je proziran canvas, a soba ispod je posljednji kadar snimka
 * kao obicna slika. Zato prelaz nije rez nego zamjena dasaka - snimljene odlaze,
 * ove nastavljaju da se krecu.
 */

const TEXTURES = ["/textures/laminate/diff.webp", "/textures/laminate/normal.png"];

function Planks({ animated }: { animated: boolean }) {
  const [map, normalMap] = useTexture(TEXTURES);
  const groups = useRef<(THREE.Group | null)[]>([]);

  // Daske su duge po X, pa tekstura mora lezati uzduz - inace se godovi vide
  // poprijeko i drvo izgleda kao da je isjeceno na kockice.
  useLayoutEffect(() => {
    for (const texture of [map, normalMap]) {
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(1, 0.22);
      texture.needsUpdate = true;
    }
  }, [map, normalMap]);

  const geometry = useMemo(
    () => new THREE.BoxGeometry(PLANK_SIZE.length, PLANK_SIZE.thickness, PLANK_SIZE.width),
    [],
  );
  useLayoutEffect(() => () => geometry.dispose(), [geometry]);

  useFrame(({ clock }) => {
    if (!animated) return;
    const t = (clock.elapsedTime / FLOAT_PERIOD) * Math.PI * 2;
    for (let i = 0; i < PLANKS.length; i++) {
      const group = groups.current[i];
      const plank = PLANKS[i];
      if (!group) continue;
      // lagano dizanje-spustanje i jedva primjetno njihanje oko ose daske
      group.position.y = plank.position[1] + Math.sin(t + plank.phase) * plank.drift;
      group.rotation.z = plank.rotation[2] + Math.sin(t * 0.6 + plank.phase) * 0.012;
      group.rotation.x = plank.rotation[0] + Math.cos(t * 0.45 + plank.phase) * 0.01;
    }
  });

  return (
    <group>
      {PLANKS.map((plank, i) => (
        <group
          key={i}
          ref={(node) => {
            groups.current[i] = node;
          }}
          position={[plank.position[0], plank.position[1], plank.position[2]]}
          rotation={[plank.rotation[0], plank.rotation[1], plank.rotation[2]]}
        >
          <mesh geometry={geometry}>
            <meshStandardMaterial
              map={map}
              normalMap={normalMap}
              normalScale={new THREE.Vector2(0.5, 0.5)}
              roughness={0.62}
              metalness={0}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/** Svjetlo prati snimak: jako sa lijeva, sa prozora, i meko dopunsko odozgo. */
function Lights() {
  return (
    <>
      <ambientLight intensity={1.15} />
      <directionalLight position={[-4, 3, 4]} intensity={2.2} color="#fffaf2" />
      <directionalLight position={[3, 2, 2]} intensity={0.55} color="#ffffff" />
    </>
  );
}

/** Kamera se postavi jednom; scena nema orbit kontrole ni scroll vezu. */
function Rig() {
  const camera = useThree((state) => state.camera);
  useLayoutEffect(() => {
    camera.position.set(...CAMERA.position);
    camera.lookAt(0, 0, 0);
  }, [camera]);
  return null;
}

export default function FloatingPlanks({ animated }: { animated: boolean }) {
  return (
    <Canvas
      // alpha + clearAlpha 0: soba ispod je slika, scena crta samo daske preko
      // nje. Bez izricitog clearAlpha platno se cisti u punu boju i pokrije sobu.
      gl={{ alpha: true, antialias: true, premultipliedAlpha: false }}
      onCreated={({ gl }) => gl.setClearAlpha(0)}
      dpr={[1, 1.75]}
      camera={{ fov: CAMERA.fov, near: 0.1, far: 50 }}
      // frameloop staje kad nema animacije - nema smisla vrtjeti petlju za
      // sliku koja se ne mijenja
      frameloop={animated ? "always" : "demand"}
      style={{ position: "absolute", inset: 0 }}
    >
      <Rig />
      <Lights />
      {/* useTexture suspenduje dok tekstura stize; bez granice scena ostane prazna */}
      <Suspense fallback={null}>
        <Planks animated={animated} />
      </Suspense>
    </Canvas>
  );
}
