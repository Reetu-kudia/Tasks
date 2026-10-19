import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export interface GlobeProps {
  theme?: 'dark' | 'light';
}

export const Globe: React.FC<GlobeProps> = ({ theme = 'dark' }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 800;

    const isDark = theme === 'dark';
    const bgColor = isDark ? 0x000000 : 0xbae6fd;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(bgColor);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(0, 0, 8.2);

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, isDark ? 1.6 : 2.2);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, isDark ? 2.8 : 3.2);
    dirLight.position.set(10, 10, 6);
    scene.add(dirLight);

    // 5. Stars (Dark Mode)
    let starsPoints: THREE.Points | null = null;
    if (isDark) {
      const starsCount = 2500;
      const starGeometry = new THREE.BufferGeometry();
      const positions = new Float32Array(starsCount * 3);
      for (let i = 0; i < starsCount * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 80;
        positions[i + 1] = (Math.random() - 0.5) * 80;
        positions[i + 2] = -10 - Math.random() * 40;
      }
      starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      const starMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.15,
        transparent: true,
        opacity: 0.85,
      });
      starsPoints = new THREE.Points(starGeometry, starMaterial);
      scene.add(starsPoints);
    }

    // 6. Earth Mesh (scaled to fit comfortably without overflowing screen)
    const sphereGeometry = new THREE.SphereGeometry(2.0, 64, 64);
    const textureLoader = new THREE.TextureLoader();
    let earthMesh: THREE.Mesh | null = null;

    textureLoader.load(
      '/textures/earth_map.jpg',
      (texture: THREE.Texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        const material = new THREE.MeshStandardMaterial({
          map: texture,
          roughness: 0.55,
          metalness: 0.25,
          emissive: new THREE.Color(isDark ? 0x050505 : 0x222222),
          emissiveIntensity: 0.15,
        });
        earthMesh = new THREE.Mesh(sphereGeometry, material);
        earthMesh.rotation.set(0.3, 4.0, 0);
        scene.add(earthMesh);
      },
      undefined,
      (err: unknown) => {
        console.warn('Could not load /textures/earth_map.jpg, falling back to procedural sphere', err);
        const fallbackMat = new THREE.MeshStandardMaterial({
          color: 0x1e3a8a,
          roughness: 0.6,
          metalness: 0.3,
          wireframe: true,
        });
        earthMesh = new THREE.Mesh(sphereGeometry, fallbackMat);
        earthMesh.rotation.set(0.3, 4.0, 0);
        scene.add(earthMesh);
      }
    );

    // 7. Mouse drag interaction for globe
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging || !earthMesh) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      earthMesh.rotation.y += deltaX * 0.005;
      earthMesh.rotation.x += deltaY * 0.005;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // 8. Resize observer
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w === 0 || h === 0) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // 9. Animation loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      if (earthMesh && !isDragging) {
        earthMesh.rotation.y += 0.001;
      }
      if (starsPoints) {
        starsPoints.rotation.y += 0.0002;
      }
      renderer.render(scene, camera);
    };
    animate();

    // 10. Cleanup
    return () => {
      cancelAnimationFrame(animId);
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      resizeObserver.disconnect();
      renderer.dispose();
      sphereGeometry.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [theme]);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        cursor: 'grab',
      }}
      aria-label="3D Earth Telemetry Globe"
    />
  );
};

