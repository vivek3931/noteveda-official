'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useRef, useMemo, useLayoutEffect, useEffect } from 'react';
import { Color, Mesh, ShaderMaterial } from 'three';

interface SilkProps {
    speed?: number;
    scale?: number;
    color?: string;
    noiseIntensity?: number;
    rotation?: number;
}

const hexToNormalizedRGB = (hex: string): [number, number, number] => {
    hex = hex.replace('#', '');
    if (hex.length === 3) {
        hex = hex.split('').map((char) => char + char).join('');
    }
    return [
        parseInt(hex.slice(0, 2), 16) / 255,
        parseInt(hex.slice(2, 4), 16) / 255,
        parseInt(hex.slice(4, 6), 16) / 255,
    ];
};

const vertexShader = `
varying vec2 vUv;
varying vec3 vPosition;

void main() {
  vPosition = position;
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
varying vec2 vUv;
varying vec3 vPosition;

uniform float uTime;
uniform vec3  uColor;
uniform float uSpeed;
uniform float uScale;
uniform float uRotation;
uniform float uNoiseIntensity;

const float e = 2.71828182845904523536;

float noise(vec2 texCoord) {
  float G = e;
  vec2  r = (G * sin(G * texCoord));
  return fract(r.x * r.y * (1.0 + texCoord.x));
}

vec2 rotateUvs(vec2 uv, float angle) {
  float c = cos(angle);
  float s = sin(angle);
  mat2  rot = mat2(c, -s, s, c);
  return rot * uv;
}

void main() {
  float rnd        = noise(gl_FragCoord.xy);
  vec2  uv         = rotateUvs(vUv * uScale, uRotation);
  vec2  tex        = uv * uScale;
  float tOffset    = uSpeed * uTime;

  tex.y += 0.03 * sin(8.0 * tex.x - tOffset);

  float pattern = 0.6 +
                  0.4 * sin(5.0 * (tex.x + tex.y +
                                   cos(3.0 * tex.x + 5.0 * tex.y) +
                                   0.02 * tOffset) +
                           sin(20.0 * (tex.x + tex.y - 0.1 * tOffset)));

  vec4 col = vec4(uColor, 1.0) * vec4(pattern) - rnd / 15.0 * uNoiseIntensity;
  col.a = 1.0;
  gl_FragColor = col;
}
`;

interface SilkPlaneProps extends SilkProps { }

const SilkPlane: React.FC<SilkPlaneProps> = ({
    speed = 0.5,
    scale = 1,
    color = '#7B7481',
    noiseIntensity = 0.2,
    rotation = 0
}) => {
    const meshRef = useRef<Mesh>(null!);
    const { viewport } = useThree();

    // Initialize scale and handle resize safely
    useLayoutEffect(() => {
        if (meshRef.current && viewport.width > 0 && viewport.height > 0) {
            meshRef.current.scale.set(viewport.width, viewport.height, 1);
        }
    }, [viewport.width, viewport.height]);

    // Initial uniforms
    const uniforms = useMemo(
        () => ({
            uSpeed: { value: speed },
            uScale: { value: scale },
            uNoiseIntensity: { value: noiseIntensity },
            uColor: { value: new Color(...hexToNormalizedRGB(color)) },
            uRotation: { value: rotation },
            uTime: { value: 0 },
        }),
        [] // Initialize once
    );

    // Update dynamic props (Color, etc.) 
    // We use useEffect here to update uniforms when props change, distinct from the per-frame update
    useEffect(() => {
        if (meshRef.current) {
            const material = meshRef.current.material as ShaderMaterial;
            if (material.uniforms) {
                material.uniforms.uSpeed.value = speed;
                material.uniforms.uScale.value = scale;
                material.uniforms.uNoiseIntensity.value = noiseIntensity;
                material.uniforms.uColor.value.setRGB(...hexToNormalizedRGB(color));
                material.uniforms.uRotation.value = rotation;
            }
        }
    }, [speed, scale, noiseIntensity, color, rotation]);

    useFrame((_, delta) => {
        if (meshRef.current) {
            const material = meshRef.current.material as ShaderMaterial;
            if (material.uniforms) {
                // Only update time per frame
                material.uniforms.uTime.value += 0.1 * delta;
            }
        }
    });

    return (
        <mesh ref={meshRef}>
            <planeGeometry args={[1, 1, 1, 1]} />
            <shaderMaterial
                uniforms={uniforms}
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                transparent={true}
            />
        </mesh>
    );
};

const Silk: React.FC<SilkProps> = (props) => {
    return (
        <div style={{ width: '100%', height: '100%' }}>
            <Canvas
                dpr={[1, 2]}
                gl={{
                    antialias: true,
                    alpha: true,
                }}
                resize={{ debounce: 0 }} // Responsive resize
                style={{ background: 'transparent', width: '100%', height: '100%' }}
            >
                <SilkPlane {...props} />
            </Canvas>
        </div>
    );
};

export default Silk;
