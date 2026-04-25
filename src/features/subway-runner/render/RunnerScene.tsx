"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

import type { RunnerState } from "../engine/runner-engine";

type RunnerSceneProps = {
  state: RunnerState;
  onFrame: (deltaSeconds: number) => void;
  onStart: () => void;
};

const LANE_WIDTH = 2.6;

export function RunnerScene({ state, onFrame, onStart }: RunnerSceneProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const stateRef = useRef(state);
  const frameRef = useRef(onFrame);

  stateRef.current = state;
  frameRef.current = onFrame;

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x07111f, 18, 68);

    const camera = new THREE.PerspectiveCamera(
      56,
      mount.clientWidth / mount.clientHeight,
      0.1,
      120
    );
    camera.position.set(0, 5.2, -9);
    camera.lookAt(0, 1, 16);

    const ambient = new THREE.AmbientLight(0xffffff, 0.72);
    scene.add(ambient);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.45);
    keyLight.position.set(-6, 8, -4);
    scene.add(keyLight);

    const road = new THREE.Mesh(
      new THREE.BoxGeometry(8.8, 0.18, 96),
      new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.62 })
    );
    road.position.set(0, -0.12, 26);
    scene.add(road);

    const laneLines = [-1.3, 1.3].map((x) => {
      const material = new THREE.MeshStandardMaterial({
        color: 0xf8fafc,
        emissive: 0x2563eb,
        emissiveIntensity: 0.3
      });
      const line = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 0.04, 96),
        material
      );
      line.position.set(x, 0.02, 26);
      scene.add(line);
      return line;
    });

    const player = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.45, 1.1, 8, 16),
      new THREE.MeshStandardMaterial({
        color: 0x16a34a,
        emissive: 0x052e16,
        roughness: 0.35
      })
    );
    player.position.set(0, 0.92, 0);
    scene.add(player);

    const obstacleMeshes = stateRef.current.obstacles.map((obstacle) => {
      const color =
        obstacle.kind === "barrier"
          ? 0xef4444
          : obstacle.kind === "lowGate"
            ? 0x38bdf8
            : 0xfacc15;
      const geometry =
        obstacle.kind === "coin"
          ? new THREE.TorusGeometry(0.42, 0.12, 10, 24)
          : new THREE.BoxGeometry(1.25, obstacle.kind === "lowGate" ? 1.8 : 1.05, 0.5);
      const mesh = new THREE.Mesh(
        geometry,
        new THREE.MeshStandardMaterial({
          color,
          emissive: color,
          emissiveIntensity: obstacle.kind === "coin" ? 0.5 : 0.16,
          roughness: 0.42
        })
      );
      scene.add(mesh);
      return mesh;
    });

    const resizeObserver = new ResizeObserver(() => {
      const width = mount.clientWidth;
      const height = mount.clientHeight;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    });
    resizeObserver.observe(mount);

    const clock = new THREE.Clock();
    let animationId = 0;

    function render() {
      const delta = Math.min(clock.getDelta(), 0.05);
      frameRef.current(delta);

      const current = stateRef.current;
      const laneX = current.playerLane * LANE_WIDTH;
      const targetY =
        current.movement === "jumping" ? 2.35 : current.movement === "sliding" ? 0.58 : 0.92;
      player.position.x += (laneX - player.position.x) * 0.22;
      player.position.y += (targetY - player.position.y) * 0.18;
      player.scale.y += ((current.movement === "sliding" ? 0.58 : 1) - player.scale.y) * 0.2;

      current.obstacles.forEach((obstacle, index) => {
        const mesh = obstacleMeshes[index];
        mesh.position.set(obstacle.lane * LANE_WIDTH, obstacle.kind === "coin" ? 1.35 : 0.55, obstacle.z);
        mesh.rotation.y += obstacle.kind === "coin" ? delta * 3 : 0;
      });

      laneLines.forEach((line, index) => {
        line.material.emissiveIntensity = 0.25 + Math.sin(current.elapsed * 3 + index) * 0.08;
      });

      renderer.render(scene, camera);
      animationId = requestAnimationFrame(render);
    }

    render();

    return () => {
      cancelAnimationFrame(animationId);
      resizeObserver.disconnect();
      mount.removeChild(renderer.domElement);
      renderer.dispose();
      road.geometry.dispose();
      road.material.dispose();
      player.geometry.dispose();
      player.material.dispose();
      laneLines.forEach((line) => {
        line.geometry.dispose();
        line.material.dispose();
      });
      obstacleMeshes.forEach((mesh) => {
        mesh.geometry.dispose();
        mesh.material.dispose();
      });
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="runner-canvas"
      role="button"
      tabIndex={0}
      aria-label="Subway Runner 3D sehnesi"
      onClick={onStart}
      onKeyDown={(event) => {
        if (event.key === "Enter") onStart();
      }}
    />
  );
}
