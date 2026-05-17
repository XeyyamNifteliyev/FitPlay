"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

import type { RunnerState } from "../engine/runner-engine";

type RunnerSceneProps = {
  state: RunnerState;
  onFrame: (deltaSeconds: number) => void;
  onStart: () => void;
};

type Particle = {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  life: number;
  maxLife: number;
};

type Building = {
  mesh: THREE.Mesh<THREE.BoxGeometry, THREE.MeshStandardMaterial>;
  windows: THREE.Points;
  side: -1 | 1;
  speedOffset: number;
};

const LANE_WIDTH = 2.6;
const PARTICLE_COUNT = 180;

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
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x06111f);
    scene.fog = new THREE.Fog(0x07111f, 18, 72);

    const camera = new THREE.PerspectiveCamera(
      56,
      mount.clientWidth / mount.clientHeight,
      0.1,
      160
    );
    camera.position.set(0, 5.2, -9);
    camera.lookAt(0, 1, 16);

    const ambient = new THREE.AmbientLight(0x9ecfff, 0.58);
    scene.add(ambient);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.65);
    keyLight.position.set(-6, 10, -5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.camera.near = 1;
    keyLight.shadow.camera.far = 45;
    scene.add(keyLight);

    const rimLight = new THREE.PointLight(0x38bdf8, 1.3, 24);
    rimLight.position.set(0, 3.2, 4);
    scene.add(rimLight);

    const roadMaterial = new THREE.MeshStandardMaterial({
      color: 0x111827,
      roughness: 0.58,
      metalness: 0.18
    });
    const road = new THREE.Mesh(new THREE.BoxGeometry(8.8, 0.18, 110), roadMaterial);
    road.position.set(0, -0.12, 31);
    road.receiveShadow = true;
    scene.add(road);

    const laneLines = [-3.9, -1.3, 1.3, 3.9].map((x, index) => {
      const material = new THREE.MeshStandardMaterial({
        color: index === 0 || index === 3 ? 0x22c55e : 0xf8fafc,
        emissive: index === 0 || index === 3 ? 0x22c55e : 0x2563eb,
        emissiveIntensity: 0.42
      });
      const line = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.05, 110), material);
      line.position.set(x, 0.03, 31);
      scene.add(line);
      return line;
    });

    const laneLights = [-4.4, 4.4].map((x) => {
      const light = new THREE.PointLight(0x38bdf8, 0.8, 13);
      light.position.set(x, 0.7, 6);
      scene.add(light);
      return light;
    });

    const starGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(600 * 3);
    for (let i = 0; i < 600; i += 1) {
      starPositions[i * 3] = (Math.random() - 0.5) * 120;
      starPositions[i * 3 + 1] = 12 + Math.random() * 45;
      starPositions[i * 3 + 2] = -20 + Math.random() * 130;
    }
    starGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    const stars = new THREE.Points(
      starGeometry,
      new THREE.PointsMaterial({
        color: 0xc7f9ff,
        size: 0.065,
        transparent: true,
        opacity: 0.86
      })
    );
    scene.add(stars);

    const buildings = createBuildings(scene);
    const player = createPlayer();
    scene.add(player);

    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(PARTICLE_COUNT * 3);
    const particles = Array.from({ length: PARTICLE_COUNT }, () => ({
      position: new THREE.Vector3(0, -20, 0),
      velocity: new THREE.Vector3(),
      life: 0,
      maxLife: 1
    }));
    particleGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(particlePositions, 3)
    );
    const particleSystem = new THREE.Points(
      particleGeometry,
      new THREE.PointsMaterial({
        color: 0x7dd3fc,
        size: 0.09,
        transparent: true,
        opacity: 0.78,
        depthWrite: false
      })
    );
    scene.add(particleSystem);

    const obstacleMeshes = stateRef.current.obstacles.map((obstacle) => {
      const group = new THREE.Group();
      const color =
        obstacle.kind === "barrier"
          ? 0xef4444
          : obstacle.kind === "lowGate"
            ? 0x38bdf8
            : 0xfacc15;
      const geometry =
        obstacle.kind === "coin"
          ? new THREE.TorusGeometry(0.42, 0.12, 12, 32)
          : new THREE.BoxGeometry(1.25, obstacle.kind === "lowGate" ? 1.8 : 1.05, 0.5);
      const material = new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: obstacle.kind === "coin" ? 0.8 : 0.22,
        roughness: 0.38,
        metalness: obstacle.kind === "coin" ? 0.35 : 0.05
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.castShadow = true;
      group.add(mesh);

      if (obstacle.kind !== "coin") {
        const edges = new THREE.LineSegments(
          new THREE.EdgesGeometry(geometry),
          new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.58 })
        );
        group.add(edges);
      }

      scene.add(group);
      return { group, mesh, geometry, material };
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
    let stepTimer = 0;
    let lastStatus = stateRef.current.status;
    let shakeTimer = 0;
    let shakeIntensity = 0;

    const spawnParticle = (
      position: THREE.Vector3,
      velocity: THREE.Vector3,
      life = 0.7
    ) => {
      const particle = particles.find((item) => item.life <= 0);
      if (!particle) return;
      particle.position.copy(position);
      particle.velocity.copy(velocity);
      particle.life = life;
      particle.maxLife = life;
    };

    const spawnBurst = (position: THREE.Vector3, count: number, color?: number) => {
      if (color) {
        (particleSystem.material as THREE.PointsMaterial).color.setHex(color);
      }

      for (let i = 0; i < count; i += 1) {
        spawnParticle(
          position,
          new THREE.Vector3(
            (Math.random() - 0.5) * 4,
            Math.random() * 3.2,
            (Math.random() - 0.5) * 4
          ),
          0.45 + Math.random() * 0.45
        );
      }
    };

    function render() {
      const delta = Math.min(clock.getDelta(), 0.05);
      frameRef.current(delta);

      const current = stateRef.current;
      const laneX = current.playerLane * LANE_WIDTH;
      const targetY =
        current.movement === "jumping" ? 2.35 : current.movement === "sliding" ? 0.58 : 0.92;

      if (lastStatus !== "gameOver" && current.status === "gameOver") {
        shakeTimer = 0.35;
        shakeIntensity = 0.28;
        spawnBurst(player.position, 90, 0xef4444);
      }
      lastStatus = current.status;

      player.position.x += (laneX - player.position.x) * 0.22;
      player.position.y += (targetY - player.position.y) * 0.18;
      player.scale.y += ((current.movement === "sliding" ? 0.58 : 1) - player.scale.y) * 0.2;
      player.rotation.z = (laneX - player.position.x) * -0.08;

      if (current.status === "running") {
        stepTimer += delta;
        if (stepTimer > 0.11) {
          stepTimer = 0;
          spawnParticle(
            new THREE.Vector3(player.position.x, 0.08, -0.4),
            new THREE.Vector3((Math.random() - 0.5) * 0.6, 0.5, -2.5),
            0.5
          );
        }
      }

      current.obstacles.forEach((obstacle, index) => {
        const entry = obstacleMeshes[index];
        entry.group.position.set(
          obstacle.lane * LANE_WIDTH,
          obstacle.kind === "coin" ? 1.35 : 0.55,
          obstacle.z
        );
        entry.group.rotation.y += obstacle.kind === "coin" ? delta * 3 : 0;
        entry.material.emissiveIntensity =
          obstacle.kind === "coin"
            ? 0.55 + Math.sin(current.elapsed * 8 + index) * 0.28
            : 0.2 + Math.sin(current.elapsed * 4 + index) * 0.08;
      });

      laneLines.forEach((line, index) => {
        line.position.z = 31 + Math.sin(current.elapsed * 2 + index) * 0.35;
        line.material.emissiveIntensity =
          0.28 + current.speed * 0.025 + Math.sin(current.elapsed * 5 + index) * 0.1;
      });

      laneLights.forEach((light, index) => {
        light.intensity = 0.65 + Math.sin(current.elapsed * 3 + index) * 0.18;
      });

      recycleBuildings(buildings, current.speed * delta);
      stars.rotation.y = current.elapsed * 0.02;
      scene.fog = new THREE.Fog(0x07111f, current.speed > 14 ? 12 : 18, 72);

      tickParticles(particles, particlePositions, delta);
      particleGeometry.attributes.position.needsUpdate = true;

      const shake =
        shakeTimer > 0
          ? new THREE.Vector3(
              (Math.random() - 0.5) * shakeIntensity,
              (Math.random() - 0.5) * shakeIntensity,
              0
            )
          : new THREE.Vector3();
      shakeTimer = Math.max(0, shakeTimer - delta);

      camera.position.set(shake.x, 5.2 + shake.y, -9);
      camera.lookAt(player.position.x * 0.25, 1.1, 16);

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
      starGeometry.dispose();
      (stars.material as THREE.Material).dispose();
      particleGeometry.dispose();
      (particleSystem.material as THREE.Material).dispose();
      laneLines.forEach((line) => {
        line.geometry.dispose();
        line.material.dispose();
      });
      buildings.forEach((building) => {
        building.mesh.geometry.dispose();
        building.mesh.material.dispose();
        building.windows.geometry.dispose();
        (building.windows.material as THREE.Material).dispose();
      });
      player.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          if (Array.isArray(object.material)) {
            object.material.forEach((material) => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
      obstacleMeshes.forEach((entry) => {
        entry.geometry.dispose();
        entry.material.dispose();
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

function createPlayer() {
  const group = new THREE.Group();
  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: 0x22c55e,
    emissive: 0x052e16,
    roughness: 0.35,
    metalness: 0.12
  });
  const headMaterial = new THREE.MeshStandardMaterial({
    color: 0x7dd3fc,
    emissive: 0x082f49,
    roughness: 0.28
  });

  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.5, 1.1, 18), bodyMaterial);
  body.position.y = 0.72;
  body.castShadow = true;
  group.add(body);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.34, 18, 18), headMaterial);
  head.position.y = 1.5;
  head.castShadow = true;
  group.add(head);

  [-1, 1].forEach((side) => {
    const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.09, 0.62, 6, 10), bodyMaterial);
    arm.position.set(side * 0.55, 0.86, 0);
    arm.rotation.z = side * 0.38;
    arm.castShadow = true;
    group.add(arm);
  });

  group.position.set(0, 0.92, 0);
  return group;
}

function createBuildings(scene: THREE.Scene): Building[] {
  const buildings: Building[] = [];

  for (let i = 0; i < 18; i += 1) {
    const side = i % 2 === 0 ? -1 : 1;
    const height = 4 + Math.random() * 10;
    const width = 1.2 + Math.random() * 1.6;
    const depth = 2 + Math.random() * 2.6;
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(width, height, depth),
      new THREE.MeshStandardMaterial({
        color: i % 3 === 0 ? 0x0f172a : 0x172033,
        roughness: 0.6,
        metalness: 0.25
      })
    );
    mesh.position.set(side * (6.5 + Math.random() * 6), height / 2 - 0.1, i * 7);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);

    const windowGeometry = new THREE.BufferGeometry();
    const windowPositions = new Float32Array(30 * 3);
    for (let w = 0; w < 30; w += 1) {
      windowPositions[w * 3] = mesh.position.x + (Math.random() - 0.5) * width * 0.8;
      windowPositions[w * 3 + 1] = 0.8 + Math.random() * (height - 1);
      windowPositions[w * 3 + 2] = mesh.position.z - depth / 2 - 0.03;
    }
    windowGeometry.setAttribute("position", new THREE.BufferAttribute(windowPositions, 3));
    const windows = new THREE.Points(
      windowGeometry,
      new THREE.PointsMaterial({
        color: i % 2 === 0 ? 0xfacc15 : 0x7dd3fc,
        size: 0.08,
        transparent: true,
        opacity: 0.85
      })
    );
    scene.add(windows);
    buildings.push({ mesh, windows, side, speedOffset: 0.8 + Math.random() * 0.45 });
  }

  return buildings;
}

function recycleBuildings(buildings: Building[], travel: number) {
  buildings.forEach((building) => {
    building.mesh.position.z -= travel * building.speedOffset;
    building.windows.position.z -= travel * building.speedOffset;

    if (building.mesh.position.z < -15) {
      building.mesh.position.z += 126;
      building.mesh.position.x = building.side * (6.5 + Math.random() * 6);
      building.windows.position.z = 0;
      const positions = building.windows.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < positions.length / 3; i += 1) {
        positions[i * 3] = building.mesh.position.x + (Math.random() - 0.5) * 1.3;
        positions[i * 3 + 2] = building.mesh.position.z - 1.2;
      }
      building.windows.geometry.attributes.position.needsUpdate = true;
    }
  });
}

function tickParticles(
  particles: Particle[],
  positions: Float32Array,
  deltaSeconds: number
) {
  particles.forEach((particle, index) => {
    if (particle.life > 0) {
      particle.life = Math.max(0, particle.life - deltaSeconds);
      particle.velocity.y -= deltaSeconds * 2.2;
      particle.position.addScaledVector(particle.velocity, deltaSeconds);
    } else {
      particle.position.set(0, -20, 0);
    }

    positions[index * 3] = particle.position.x;
    positions[index * 3 + 1] = particle.position.y;
    positions[index * 3 + 2] = particle.position.z;
  });
}
