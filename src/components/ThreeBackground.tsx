import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

function ParticleField() {
  const ref = useRef<THREE.Points>(null);

  const particles = useMemo(() => {
    const count = 2000;
    const positions = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 20;
      const y = (Math.random() - 0.5) * 20;
      const z = (Math.random() - 0.5) * 20;
      
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
    }
    
    return positions;
  }, []);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.x = state.clock.elapsedTime * 0.02;
      ref.current.rotation.y = state.clock.elapsedTime * 0.03;
    }
  });

  return (
    <Points ref={ref} positions={particles} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#8b5cf6"
        size={0.03}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.6}
      />
    </Points>
  );
}

function FloatingGeometry() {
  const meshRef = useRef<THREE.Mesh>(null);
  const mesh2Ref = useRef<THREE.Mesh>(null);
  const mesh3Ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    
    if (meshRef.current) {
      meshRef.current.rotation.x = t * 0.2;
      meshRef.current.rotation.y = t * 0.3;
      meshRef.current.position.y = Math.sin(t * 0.5) * 0.5;
    }
    
    if (mesh2Ref.current) {
      mesh2Ref.current.rotation.x = t * 0.15;
      mesh2Ref.current.rotation.z = t * 0.25;
      mesh2Ref.current.position.y = Math.sin(t * 0.4 + 1) * 0.4;
    }
    
    if (mesh3Ref.current) {
      mesh3Ref.current.rotation.y = t * 0.2;
      mesh3Ref.current.rotation.z = t * 0.15;
      mesh3Ref.current.position.y = Math.sin(t * 0.6 + 2) * 0.3;
    }
  });

  return (
    <>
      <mesh ref={meshRef} position={[3, 0, -2]}>
        <octahedronGeometry args={[0.8, 0]} />
        <meshStandardMaterial
          color="#8b5cf6"
          wireframe
          transparent
          opacity={0.3}
        />
      </mesh>
      
      <mesh ref={mesh2Ref} position={[-3, 1, -3]}>
        <icosahedronGeometry args={[0.6, 0]} />
        <meshStandardMaterial
          color="#a855f7"
          wireframe
          transparent
          opacity={0.25}
        />
      </mesh>
      
      <mesh ref={mesh3Ref} position={[0, -2, -4]}>
        <torusGeometry args={[0.5, 0.2, 8, 16]} />
        <meshStandardMaterial
          color="#c084fc"
          wireframe
          transparent
          opacity={0.2}
        />
      </mesh>
    </>
  );
}

const ThreeBackground = () => {
  return (
    <div className="fixed inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 60 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={0.5} />
        <ParticleField />
        <FloatingGeometry />
      </Canvas>
    </div>
  );
};

export default ThreeBackground;
