import React, { Suspense, useMemo, useRef, useEffect } from 'react';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { OrbitControls as OrbitControlsImpl } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import cameraModelUrl from '../assets/red_camera_web.glb?url';

function CinemaCameraModel() {
  const rig = useRef(null);
  const gltf = useLoader(GLTFLoader, cameraModelUrl);

  const { scene, scale } = useMemo(() => {
    const clonedScene = gltf.scene.clone(true);

    clonedScene.traverse((object) => {
      if (!object.isMesh) return;

      // Скрываем стол — плоский широкий меш
      const box = new THREE.Box3().setFromObject(object);
      const sz = new THREE.Vector3();
      box.getSize(sz);
      if (sz.x > sz.y * 3 || sz.z > sz.y * 3) {
        object.visible = false;
        return;
      }

      object.castShadow = true;
      object.receiveShadow = false;

      if (object.material) {
        object.material = object.material.clone();
        object.material.roughness   = Math.min(object.material.roughness  ?? 0.3,  0.28);
        object.material.metalness   = Math.max(object.material.metalness  ?? 0.6,  0.55);
        object.material.envMapIntensity = 1.4;
        if (object.material.color) object.material.color.multiplyScalar(1.35);
        object.material.needsUpdate = true;
      }
    });

    const box    = new THREE.Box3().setFromObject(clonedScene);
    const size   = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);
    clonedScene.position.set(-center.x, -center.y, -center.z);

    const maxDimension = Math.max(size.x, size.y, size.z) || 1;
    return { scene: clonedScene, scale: 5.6 / maxDimension };
  }, [gltf]);

  return (
    <group ref={rig} scale={scale}>
      <primitive object={scene} />
    </group>
  );
}

function SmartControls({ isInteracting }) {
  const { camera, gl } = useThree();
  const controls = useRef(null);

  useEffect(() => {
    const c = new OrbitControlsImpl(camera, gl.domElement);
    c.enableDamping   = true;
    c.dampingFactor   = 0.07;
    c.enablePan       = false;
    c.enableZoom      = true;
    c.enableRotate    = true;
    c.minDistance     = 2.5;
    c.maxDistance     = 12;
    c.rotateSpeed     = 0.85;
    c.zoomSpeed       = 0.9;
    // Без ограничений по вертикали — полный 360°
    c.minPolarAngle   = 0;
    c.maxPolarAngle   = Math.PI;
    c.target.set(0, 0, 0);
    c.update();
    controls.current = c;
    return () => { c.dispose(); controls.current = null; };
  }, [camera, gl]);

  useFrame((_, delta) => {
    if (!controls.current) return;

    if (isInteracting.current) {
      controls.current.autoRotate = false;
      controls.current.update();
    } else {
      controls.current.autoRotate      = true;
      controls.current.autoRotateSpeed = 1.2;
      controls.current.update();
    }
  });

  return null;
}

function CameraLoadingFallback() {
  return (
    <group>
      <mesh>
        <boxGeometry args={[2.2, 1.1, 0.9]} />
        <meshStandardMaterial color="#252b34" roughness={0.6} metalness={0.35} />
      </mesh>
      <mesh position={[-1.45, 0, 0.28]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.42, 0.52, 0.9, 48]} />
        <meshStandardMaterial color="#08090b" roughness={0.5} metalness={0.6} />
      </mesh>
    </group>
  );
}

export default function CameraScene({ isInteracting }) {
  return (
    <Canvas
      aria-hidden="true"
      camera={{ position: [0, 0.5, 6.2], fov: 30 }}
      dpr={[1, 1.7]}
      gl={{
        antialias: true,
        alpha: true,
        preserveDrawingBuffer: true,
        powerPreference: 'high-performance',
      }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.65;
      }}
    >
      <hemisphereLight args={['#ffffff', '#1a0a05', 1.4]} />
      <ambientLight intensity={1.6} />
      <directionalLight position={[4, 6, 6]}   intensity={5.5} color="#f5f8ff" />
      <directionalLight position={[-3, 4, 2]}  intensity={2.8} color="#ffffff" />
      <spotLight       position={[-4.6, 3.2, 4.2]} intensity={4.5} angle={0.45} penumbra={0.6} color="#ff6a2a" />
      <pointLight      position={[2.6, 1.2, 3.2]}  intensity={4.0} color="#86b5ff" />
      <pointLight      position={[-2.8, 1.5, 2.6]} intensity={3.2} color="#ffffff" />
      <pointLight      position={[0, -1, 2]}        intensity={1.8} color="#ffcfb0" />
      <Suspense fallback={<CameraLoadingFallback />}>
        <CinemaCameraModel />
      </Suspense>
      <SmartControls isInteracting={isInteracting} />
    </Canvas>
  );
}
