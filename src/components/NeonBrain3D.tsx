import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { THEMES } from '../game/themes';
import { ThemeId } from '../game/types';

interface NeonBrain3DProps {
  themeId: ThemeId;
  pulseTrigger?: number;
  lastAnswerCorrect?: boolean | null;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
}

function checkWebGLSupport(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    const gl =
      canvas.getContext('webgl', { powerPreference: 'low-power' }) ||
      canvas.getContext('experimental-webgl', { powerPreference: 'low-power' });
    return !!gl;
  } catch {
    return false;
  }
}

export const NeonBrain3D: React.FC<NeonBrain3DProps> = ({
  themeId,
  pulseTrigger = 0,
  lastAnswerCorrect = null,
  size = 'md',
  interactive = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [webGlAvailable, setWebGlAvailable] = useState<boolean>(() => checkWebGLSupport());
  const [is3DReady, setIs3DReady] = useState<boolean>(false);

  const activeTheme = THEMES[themeId] || THEMES.violet;

  const heightClass =
    size === 'sm'
      ? 'h-36 w-36'
      : size === 'lg'
      ? 'h-60 sm:h-72 w-full max-w-sm'
      : 'h-44 sm:h-56 w-full max-w-xs';

  const sceneRef = useRef<{
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    brainGroup: THREE.Group;
    nodesMesh: THREE.Points;
    linesMesh: THREE.LineSegments;
    ringMesh: THREE.Points;
    nodesMaterial: THREE.PointsMaterial;
    linesMaterial: THREE.LineBasicMaterial;
    ringMaterial: THREE.PointsMaterial;
    animFrameId: number;
    pulseFactor: number;
    targetScale: number;
    mouse: { x: number; y: number };
  } | null>(null);

  useEffect(() => {
    if (!webGlAvailable) return;
    const container = containerRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer | null = null;
    let animId = 0;

    try {
      const width = container.clientWidth || 280;
      const height = container.clientHeight || 180;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
      camera.position.z = 4.2;

      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: 'low-power',
        failIfMajorPerformanceCaveat: false,
      });

      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
      container.innerHTML = '';
      container.appendChild(renderer.domElement);

      const brainGroup = new THREE.Group();
      scene.add(brainGroup);

      const nodeCount = 180;
      const nodePositions = new Float32Array(nodeCount * 3);
      const nodeColors = new Float32Array(nodeCount * 3);
      const primaryColor = new THREE.Color(activeTheme.brainColor);
      const secondaryColor = new THREE.Color(activeTheme.brainWireColor);

      const pointsList: THREE.Vector3[] = [];

      for (let i = 0; i < nodeCount; i++) {
        const hemisphere = i % 2 === 0 ? 1 : -1;
        const u = Math.random();
        const v = Math.random();
        const theta = u * 2.0 * Math.PI;
        const phi = Math.acos(2.0 * v - 1.0);

        const r = 1.0 + Math.sin(theta * 3) * 0.15 + Math.cos(phi * 2) * 0.1;
        let x = r * Math.sin(phi) * Math.cos(theta);
        let y = r * Math.sin(phi) * Math.sin(theta) * 0.85;
        let z = r * Math.cos(phi) * 1.15;

        x = x * 0.75 + hemisphere * 0.28;
        if (z > 0) y *= 1.1;
        else y *= 0.85;

        nodePositions[i * 3] = x;
        nodePositions[i * 3 + 1] = y;
        nodePositions[i * 3 + 2] = z;

        pointsList.push(new THREE.Vector3(x, y, z));

        const mixed = primaryColor.clone().lerp(secondaryColor, Math.random());
        nodeColors[i * 3] = mixed.r;
        nodeColors[i * 3 + 1] = mixed.g;
        nodeColors[i * 3 + 2] = mixed.b;
      }

      const nodeGeometry = new THREE.BufferGeometry();
      nodeGeometry.setAttribute('position', new THREE.BufferAttribute(nodePositions, 3));
      nodeGeometry.setAttribute('color', new THREE.BufferAttribute(nodeColors, 3));

      const nodesMaterial = new THREE.PointsMaterial({
        size: 0.08,
        vertexColors: true,
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending,
      });
      const nodesMesh = new THREE.Points(nodeGeometry, nodesMaterial);
      brainGroup.add(nodesMesh);

      const lineIndices: number[] = [];
      const maxDist = 0.52;
      for (let i = 0; i < pointsList.length; i++) {
        let connections = 0;
        for (let j = i + 1; j < pointsList.length; j++) {
          const dist = pointsList[i].distanceTo(pointsList[j]);
          if (dist < maxDist && connections < 4) {
            lineIndices.push(i, j);
            connections++;
          }
        }
      }

      const lineGeometry = new THREE.BufferGeometry();
      lineGeometry.setAttribute('position', new THREE.BufferAttribute(nodePositions, 3));
      lineGeometry.setIndex(lineIndices);

      const linesMaterial = new THREE.LineBasicMaterial({
        color: activeTheme.brainWireColor,
        transparent: true,
        opacity: 0.45,
        blending: THREE.AdditiveBlending,
      });
      const linesMesh = new THREE.LineSegments(lineGeometry, linesMaterial);
      brainGroup.add(linesMesh);

      const ringCount = 60;
      const ringPositions = new Float32Array(ringCount * 3);
      for (let i = 0; i < ringCount; i++) {
        const angle = (i / ringCount) * Math.PI * 2;
        const radius = 1.6 + (Math.random() - 0.5) * 0.15;
        ringPositions[i * 3] = Math.cos(angle) * radius;
        ringPositions[i * 3 + 1] = (Math.random() - 0.5) * 0.2;
        ringPositions[i * 3 + 2] = Math.sin(angle) * radius;
      }
      const ringGeometry = new THREE.BufferGeometry();
      ringGeometry.setAttribute('position', new THREE.BufferAttribute(ringPositions, 3));
      const ringMaterial = new THREE.PointsMaterial({
        size: 0.045,
        color: activeTheme.brainWireColor,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending,
      });
      const ringMesh = new THREE.Points(ringGeometry, ringMaterial);
      ringMesh.rotation.x = Math.PI * 0.2;
      brainGroup.add(ringMesh);

      const mouse = { x: 0, y: 0 };
      const handlePointerMove = (e: MouseEvent | TouchEvent) => {
        if (!interactive) return;
        const rect = container.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -(((clientY - rect.top) / rect.height) * 2 - 1);
      };

      window.addEventListener('mousemove', handlePointerMove, { passive: true });

      const resizeObserver = new ResizeObserver(() => {
        if (!container || !renderer) return;
        const newW = container.clientWidth || 280;
        const newH = container.clientHeight || 180;
        camera.aspect = newW / newH;
        camera.updateProjectionMatrix();
        renderer.setSize(newW, newH);
      });
      resizeObserver.observe(container);

      let pulseFactor = 0;
      let targetScale = 1;

      const animate = () => {
        animId = requestAnimationFrame(animate);
        brainGroup.rotation.y += 0.008;
        brainGroup.rotation.x = THREE.MathUtils.lerp(brainGroup.rotation.x, mouse.y * 0.4 + 0.1, 0.05);
        brainGroup.rotation.z = THREE.MathUtils.lerp(brainGroup.rotation.z, -mouse.x * 0.3, 0.05);
        ringMesh.rotation.y -= 0.012;

        if (pulseFactor > 0.01) {
          pulseFactor *= 0.92;
          nodesMaterial.size = 0.08 + pulseFactor * 0.08;
          linesMaterial.opacity = 0.45 + pulseFactor * 0.45;
        } else {
          nodesMaterial.size = 0.08;
          linesMaterial.opacity = 0.45;
        }

        brainGroup.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
        if (targetScale !== 1) {
          targetScale = THREE.MathUtils.lerp(targetScale, 1, 0.1);
        }

        if (renderer) {
          renderer.render(scene, camera);
        }
      };

      animId = requestAnimationFrame(animate);
      setIs3DReady(true);

      sceneRef.current = {
        renderer,
        scene,
        camera,
        brainGroup,
        nodesMesh,
        linesMesh,
        ringMesh,
        nodesMaterial,
        linesMaterial,
        ringMaterial,
        animFrameId: animId,
        pulseFactor,
        targetScale,
        mouse,
      };

      return () => {
        cancelAnimationFrame(animId);
        window.removeEventListener('mousemove', handlePointerMove);
        resizeObserver.disconnect();
        try {
          renderer?.dispose();
          nodeGeometry.dispose();
          lineGeometry.dispose();
          ringGeometry.dispose();
          nodesMaterial.dispose();
          linesMaterial.dispose();
          ringMaterial.dispose();
          if (container && renderer && container.contains(renderer.domElement)) {
            container.removeChild(renderer.domElement);
          }
        } catch {}
        sceneRef.current = null;
      };
    } catch {
      setWebGlAvailable(false);
      setIs3DReady(false);
    }
  }, [interactive, webGlAvailable]);

  // Handle theme updates
  useEffect(() => {
    if (!sceneRef.current) return;
    try {
      sceneRef.current.linesMaterial.color.setHex(activeTheme.brainWireColor);
      sceneRef.current.ringMaterial.color.setHex(activeTheme.brainWireColor);
    } catch {}
  }, [activeTheme]);

  // Handle answer pulse
  useEffect(() => {
    if (!sceneRef.current || pulseTrigger === 0) return;
    if (lastAnswerCorrect === true) {
      sceneRef.current.pulseFactor = 1.0;
      sceneRef.current.targetScale = 1.15;
    } else if (lastAnswerCorrect === false) {
      sceneRef.current.pulseFactor = 0.4;
      sceneRef.current.targetScale = 0.9;
    }
  }, [pulseTrigger, lastAnswerCorrect]);

  return (
    <div
      className={`relative mx-auto flex items-center justify-center pointer-events-auto ${heightClass}`}
      data-testid="neon-brain-container"
    >
      {/* 3D Canvas Container */}
      <div
        ref={containerRef}
        className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
          is3DReady ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* 2D Fallback Neon SVG Brain (Always active when WebGL is unavailable or 3D is initializing) */}
      {(!webGlAvailable || !is3DReady) && (
        <NeonBrain2DFallback
          theme={activeTheme}
          pulseTrigger={pulseTrigger}
          lastAnswerCorrect={lastAnswerCorrect}
          size={size}
        />
      )}
    </div>
  );
};

// High-fidelity 2D Cyber SVG Brain Fallback with animated neural ripples
interface FallbackProps {
  theme: typeof THEMES.violet;
  pulseTrigger: number;
  lastAnswerCorrect: boolean | null;
  size: 'sm' | 'md' | 'lg';
}

const NeonBrain2DFallback: React.FC<FallbackProps> = ({
  theme,
  pulseTrigger,
  lastAnswerCorrect,
  size,
}) => {
  const [pulseClass, setPulseClass] = useState<string>('');

  useEffect(() => {
    if (pulseTrigger === 0) return;
    if (lastAnswerCorrect === true) {
      setPulseClass('scale-110 drop-shadow-[0_0_30px_rgba(6,182,212,0.9)]');
    } else if (lastAnswerCorrect === false) {
      setPulseClass('scale-95 drop-shadow-[0_0_20px_rgba(239,68,68,0.8)]');
    }
    const t = setTimeout(() => setPulseClass(''), 300);
    return () => clearTimeout(t);
  }, [pulseTrigger, lastAnswerCorrect]);

  const svgSize = size === 'sm' ? 120 : size === 'lg' ? 220 : 170;

  return (
    <div
      className={`relative flex items-center justify-center transition-all duration-300 ${pulseClass}`}
      style={{ width: svgSize, height: svgSize }}
    >
      {/* Ambient Radial Aura */}
      <div
        className="absolute inset-0 rounded-full blur-2xl opacity-40 animate-pulse pointer-events-none"
        style={{ backgroundColor: theme.accent }}
      />

      {/* Futuristic Cyber Brain SVG */}
      <svg
        viewBox="0 0 200 200"
        className="w-full h-full relative z-10 drop-shadow-[0_0_15px_currentColor]"
        style={{ color: theme.accent }}
      >
        <defs>
          <linearGradient id="brainGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={theme.accent} />
            <stop offset="100%" stopColor={theme.accentSecondary} />
          </linearGradient>
          <filter id="neonGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Orbit Ring */}
        <ellipse
          cx="100"
          cy="100"
          rx="88"
          ry="32"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeDasharray="4 6"
          opacity="0.45"
          transform="rotate(-20 100 100)"
          className="animate-[spin_12s_linear_infinite]"
        />

        {/* Left Cerebral Hemisphere */}
        <path
          d="M 94 36 C 68 36 44 52 42 78 C 40 92 46 102 44 116 C 42 134 56 156 76 160 C 86 162 92 152 94 140 Z"
          fill="none"
          stroke="url(#brainGrad)"
          strokeWidth="2.5"
          strokeLinecap="round"
          filter="url(#neonGlow)"
        />

        {/* Right Cerebral Hemisphere */}
        <path
          d="M 106 36 C 132 36 156 52 158 78 C 160 92 154 102 156 116 C 158 134 144 156 124 160 C 114 162 108 152 106 140 Z"
          fill="none"
          stroke="url(#brainGrad)"
          strokeWidth="2.5"
          strokeLinecap="round"
          filter="url(#neonGlow)"
        />

        {/* Central Fissure */}
        <line
          x1="100"
          y1="40"
          x2="100"
          y2="155"
          stroke={theme.accentSecondary}
          strokeWidth="1.8"
          strokeDasharray="3 3"
          opacity="0.6"
        />

        {/* Internal Neural Synapses (Left) */}
        <path
          d="M 60 70 Q 75 85 92 80 M 52 105 Q 70 110 92 115 M 68 135 Q 80 125 94 135"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          opacity="0.7"
        />

        {/* Internal Neural Synapses (Right) */}
        <path
          d="M 140 70 Q 125 85 108 80 M 148 105 Q 130 110 108 115 M 132 135 Q 120 125 106 135"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          opacity="0.7"
        />

        {/* Glowing Neural Nodes */}
        <circle cx="60" cy="70" r="3" fill="#ffffff" filter="url(#neonGlow)" />
        <circle cx="92" cy="80" r="3.5" fill="#ffffff" filter="url(#neonGlow)" />
        <circle cx="52" cy="105" r="2.8" fill="#ffffff" filter="url(#neonGlow)" />
        <circle cx="92" cy="115" r="3.2" fill="#ffffff" filter="url(#neonGlow)" />
        <circle cx="68" cy="135" r="3" fill="#ffffff" filter="url(#neonGlow)" />

        <circle cx="140" cy="70" r="3" fill="#ffffff" filter="url(#neonGlow)" />
        <circle cx="108" cy="80" r="3.5" fill="#ffffff" filter="url(#neonGlow)" />
        <circle cx="148" cy="105" r="2.8" fill="#ffffff" filter="url(#neonGlow)" />
        <circle cx="108" cy="115" r="3.2" fill="#ffffff" filter="url(#neonGlow)" />
        <circle cx="132" cy="135" r="3" fill="#ffffff" filter="url(#neonGlow)" />

        <circle cx="100" cy="48" r="3" fill={theme.accentSecondary} />
        <circle cx="100" cy="148" r="3" fill={theme.accentSecondary} />
      </svg>
    </div>
  );
};
