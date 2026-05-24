"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

import type {
  RunnerState,
  RunnerWorldTheme,
  PowerUpKind,
  ObstacleKind,
  RunnerObstacle
} from "../engine/runner-engine";
import { getCurrentTheme } from "../engine/runner-engine";
import { tickParticles, spawnBurst } from "../../../shared/render/particle-system";
import type { FxParticle } from "../../../shared/render/particle-system";
import {
  createCameraShake,
  triggerShake,
  tickShake,
  type CameraShakeState
} from "../../../shared/render/camera-shake";

type RunnerSceneProps = {
  state: RunnerState;
  onFrame: (deltaSeconds: number) => void;
  onStart: () => void;
};

type Building = {
  mesh: THREE.Mesh<THREE.BoxGeometry, THREE.MeshStandardMaterial>;
  windows: THREE.Points;
  side: -1 | 1;
  speedOffset: number;
};

type MetroWorld = {
  rails: THREE.Group;
  sleepers: THREE.Mesh[];
  tunnelLights: THREE.PointLight[];
  billboards: THREE.Group[];
};

type ObstacleMeshEntry = {
  group: THREE.Group;
  kind: ObstacleKind;
  geometry: THREE.BufferGeometry;
  material: THREE.MeshStandardMaterial;
};

type CharacterRig = {
  group: THREE.Group;
  leftArm: THREE.Object3D;
  rightArm: THREE.Object3D;
  leftLeg: THREE.Object3D;
  rightLeg: THREE.Object3D;
  head: THREE.Object3D;
};

const LANE_WIDTH = 2.6;
const PARTICLE_COUNT = 180;

type ThemeConfig = {
  fogColor: number;
  fogNear: number;
  fogFar: number;
  roadColor: number;
  accentColor: number;
  buildingColor1: number;
  buildingColor2: number;
  windowColor1: number;
  windowColor2: number;
  ambientColor: number;
  ambientIntensity: number;
};

const THEME_CONFIGS: Record<RunnerWorldTheme, ThemeConfig> = {
  bakuMetro: {
    fogColor: 0x06111f,
    fogNear: 18,
    fogFar: 72,
    roadColor: 0x111827,
    accentColor: 0x38bdf8,
    buildingColor1: 0x0f172a,
    buildingColor2: 0x172033,
    windowColor1: 0xfacc15,
    windowColor2: 0x7dd3fc,
    ambientColor: 0x9ecfff,
    ambientIntensity: 0.58
  },
  icherisheher: {
    fogColor: 0x1a0f05,
    fogNear: 15,
    fogFar: 65,
    roadColor: 0x2a1a0a,
    accentColor: 0xd4a017,
    buildingColor1: 0x3d2b1f,
    buildingColor2: 0x4a3728,
    windowColor1: 0xffa500,
    windowColor2: 0xffd700,
    ambientColor: 0xffd4a0,
    ambientIntensity: 0.62
  },
  bulvar: {
    fogColor: 0x0a1520,
    fogNear: 20,
    fogFar: 78,
    roadColor: 0x1a2a1a,
    accentColor: 0x34d399,
    buildingColor1: 0x0f2a1a,
    buildingColor2: 0x1a3328,
    windowColor1: 0x34d399,
    windowColor2: 0x7dd3fc,
    ambientColor: 0xa0ffd4,
    ambientIntensity: 0.55
  },
  neonNight: {
    fogColor: 0x0a0015,
    fogNear: 14,
    fogFar: 60,
    roadColor: 0x0a0018,
    accentColor: 0xf472b6,
    buildingColor1: 0x150025,
    buildingColor2: 0x200035,
    windowColor1: 0xf472b6,
    windowColor2: 0xa855f7,
    ambientColor: 0xffa0d0,
    ambientIntensity: 0.52
  }
};

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
    const road = new THREE.Mesh(
      new THREE.BoxGeometry(8.8, 0.18, 110),
      roadMaterial
    );
    road.position.set(0, -0.12, 31);
    road.receiveShadow = true;
    scene.add(road);

    const metroWorld = createMetroWorld(scene);

    const laneLines = [-3.9, -1.3, 1.3, 3.9].map((x, index) => {
      const material = new THREE.MeshStandardMaterial({
        color: index === 0 || index === 3 ? 0x22c55e : 0xf8fafc,
        emissive: index === 0 || index === 3 ? 0x22c55e : 0x2563eb,
        emissiveIntensity: 0.42
      });
      const line = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 0.05, 110),
        material
      );
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
    starGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(starPositions, 3)
    );
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
    scene.add(player.group);
    const chaser = createChaser();
    scene.add(chaser.group);

    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(PARTICLE_COUNT * 3);
    const particles = Array.from({ length: PARTICLE_COUNT }, () => ({
      position: new THREE.Vector3(0, -20, 0),
      velocity: new THREE.Vector3(),
      life: 0,
      maxLife: 1,
      size: 0.09,
      color: new THREE.Color(0x7dd3fc)
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

    const shieldSphere = new THREE.Mesh(
      new THREE.SphereGeometry(1.2, 16, 16),
      new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0,
        roughness: 0.1,
        metalness: 0.8
      })
    );
    shieldSphere.position.set(0, 0.9, 0);
    scene.add(shieldSphere);

    const hoverboard = createHoverboard();
    scene.add(hoverboard);

    const obstacleMeshes: ObstacleMeshEntry[] = stateRef.current.obstacles.map((obstacle) =>
      createObstacleMesh(obstacle, scene)
    );

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
    let lastThemeIndex = 0;
    let shakeState: CameraShakeState = createCameraShake();

    function render() {
      const delta = Math.min(clock.getDelta(), 0.05);
      frameRef.current(delta);

      const current = stateRef.current;
      const theme = getCurrentTheme(current);
      const config = THEME_CONFIGS[theme];

      if (lastThemeIndex !== current.themeIndex) {
        lastThemeIndex = current.themeIndex;
        scene.background = new THREE.Color(config.fogColor);
        roadMaterial.color.setHex(config.roadColor);
        ambient.color.setHex(config.ambientColor);
        ambient.intensity = config.ambientIntensity;
        rimLight.color.setHex(config.accentColor);
      }

      const laneX = current.playerLane * LANE_WIDTH;
      const targetY =
        current.movement === "jumping"
          ? 2.35
          : current.movement === "sliding"
            ? 0.58
            : 0.92;

      if (lastStatus !== "gameOver" && current.status === "gameOver") {
        shakeState = triggerShake(shakeState, 0.28, 0.35);
        spawnBurst(
          particles,
          player.group.position.clone(),
          0xef4444,
          90,
          4
        );
      }
      lastStatus = current.status;

      player.group.position.x += (laneX - player.group.position.x) * 0.22;
      player.group.position.y += (targetY - player.group.position.y) * 0.18;
      player.group.scale.y +=
        ((current.movement === "sliding" ? 0.58 : 1) - player.group.scale.y) * 0.2;
      player.group.rotation.z = (laneX - player.group.position.x) * -0.08;

      const runCycle = current.elapsed * (7.5 + current.speed * 0.18);
      const stride = current.status === "running" ? Math.sin(runCycle) : 0;
      const counterStride = current.status === "running" ? Math.cos(runCycle) : 0;
      player.leftArm.rotation.x = stride * 0.72;
      player.rightArm.rotation.x = -stride * 0.72;
      player.leftLeg.rotation.x = -stride * 0.78;
      player.rightLeg.rotation.x = stride * 0.78;
      player.head.rotation.y = Math.sin(current.elapsed * 4) * 0.05;

      const chaserZ = -Math.max(4.5, current.chaser.distance * 0.22);
      chaser.group.position.x +=
        (player.group.position.x * 0.72 - chaser.group.position.x) * 0.08;
      chaser.group.position.y = 0.8 + Math.sin(current.elapsed * 10) * 0.04;
      chaser.group.position.z += (chaserZ - chaser.group.position.z) * 0.12;
      chaser.group.rotation.y = Math.sin(current.elapsed * 6) * 0.08;
      chaser.group.visible = current.status !== "ready";
      chaser.leftArm.rotation.x = -stride * 0.82;
      chaser.rightArm.rotation.x = stride * 0.82;
      chaser.leftLeg.rotation.x = stride * 0.88;
      chaser.rightLeg.rotation.x = -stride * 0.88;
      chaser.head.rotation.z = counterStride * 0.025;

      if (current.powerUp === "shield" || current.powerUp === "hoverboard") {
        shieldSphere.position.copy(player.group.position);
        shieldSphere.scale.setScalar(current.powerUp === "hoverboard" ? 1.22 : 1);
        shieldSphere.material.opacity =
          0.18 + Math.sin(current.elapsed * 4) * 0.08;
      } else {
        shieldSphere.material.opacity = 0;
      }

      hoverboard.visible = current.powerUp === "hoverboard";
      hoverboard.position.set(player.group.position.x, 0.18, player.group.position.z - 0.12);
      hoverboard.rotation.z = Math.sin(current.elapsed * 8) * 0.08;

      if (current.status === "running") {
        stepTimer += delta;
        if (stepTimer > 0.11) {
          stepTimer = 0;
          const p = particles.find((item) => item.life <= 0);
          if (p) {
            p.position.set(player.group.position.x, 0.08, -0.4);
            p.velocity.set(
              (Math.random() - 0.5) * 0.6,
              0.5,
              -2.5
            );
            p.life = 0.5;
            p.maxLife = 0.5;
          }
        }
      }

      current.obstacles.forEach((obstacle, index) => {
        if (index >= obstacleMeshes.length) return;
        let entry = obstacleMeshes[index];
        if (entry.kind !== obstacle.kind) {
          disposeObstacleEntry(entry, scene);
          entry = createObstacleMesh(obstacle, scene);
          obstacleMeshes[index] = entry;
        }
        entry.group.position.set(
          obstacle.lane * LANE_WIDTH,
          obstacle.kind === "coin"
            ? 1.35
            : obstacle.kind === "powerUp"
              ? 1.2
              : obstacle.kind === "gap"
                ? 0.02
                : obstacle.kind === "train" || obstacle.kind === "parkedTrain"
                  ? 0.72
                  : 0.55,
          obstacle.z
        );
        entry.group.visible = !obstacle.collected;

        if (obstacle.kind === "coin" || obstacle.kind === "powerUp") {
          entry.group.rotation.y += delta * 3;
          entry.group.position.y += Math.sin(current.elapsed * 6 + index) * 0.005;
        }

        if (obstacle.kind === "train" || obstacle.kind === "parkedTrain") {
          entry.group.rotation.x = Math.sin(current.elapsed * 8 + index) * 0.01;
        }

        entry.material.emissiveIntensity =
          obstacle.kind === "coin"
            ? 0.55 + Math.sin(current.elapsed * 8 + index) * 0.28
            : obstacle.kind === "powerUp"
              ? 0.7 + Math.sin(current.elapsed * 6 + index) * 0.3
              : 0.2 + Math.sin(current.elapsed * 4 + index) * 0.08;
      });

      laneLines.forEach((line, index) => {
        line.position.z = 31 + Math.sin(current.elapsed * 2 + index) * 0.35;
        line.material.emissiveIntensity =
          0.28 + current.speed * 0.025 + Math.sin(current.elapsed * 5 + index) * 0.1;
      });

      laneLights.forEach((light, index) => {
        light.intensity = 0.65 + Math.sin(current.elapsed * 3 + index) * 0.18;
        light.color.setHex(config.accentColor);
      });

      recycleBuildings(buildings, current.speed * delta);
      recycleMetroWorld(metroWorld, current.speed * delta, current.elapsed, config);
      stars.rotation.y = current.elapsed * 0.02;

      const speedFactor = current.speed > 14 ? 0.67 : 1;
      scene.fog = new THREE.Fog(
        config.fogColor,
        config.fogNear * speedFactor,
        config.fogFar
      );

      tickParticles(particles, particlePositions, delta);
      particleGeometry.attributes.position.needsUpdate = true;

      const shakeResult = tickShake(shakeState, delta);
      shakeState = shakeResult.state;

      camera.position.set(
        shakeResult.offset.x,
        5.2 + shakeResult.offset.y,
        -9
      );
      camera.lookAt(player.group.position.x * 0.25, 1.1, 16);

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
      shieldSphere.geometry.dispose();
      (shieldSphere.material as THREE.Material).dispose();
      hoverboard.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          object.material.dispose();
        }
      });
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
      disposeMetroWorld(metroWorld);
      player.group.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          if (Array.isArray(object.material)) {
            object.material.forEach((material) => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
      chaser.group.traverse((object) => {
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
        disposeObstacleEntry(entry, scene);
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

const POWER_UP_COLORS: Record<string, number> = {
  magnet: 0xa855f7,
  shield: 0x38bdf8,
  boost: 0xf97316,
  hoverboard: 0xfacc15
};

function createObstacleMesh(
  obstacle: RunnerObstacle,
  scene: THREE.Scene
): ObstacleMeshEntry {
  const group = new THREE.Group();
  const isPowerUp = obstacle.kind === "powerUp";
  const isCoin = obstacle.kind === "coin";

  const color = isPowerUp
    ? POWER_UP_COLORS[obstacle.powerUpKind ?? "magnet"] ?? 0xa855f7
    : getObstacleColor(obstacle.kind);

  const geometry = createObstacleGeometry(obstacle.kind, isPowerUp);

  const material = new THREE.MeshStandardMaterial({
    color,
    emissive: color,
    emissiveIntensity: isCoin || isPowerUp ? 0.8 : 0.22,
    roughness: 0.38,
    metalness: isCoin || isPowerUp ? 0.35 : 0.05
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  group.add(mesh);

  if (obstacle.kind === "train" || obstacle.kind === "parkedTrain") {
    addTrainDetails(group, color, obstacle.kind === "train");
  }

  if (obstacle.kind === "gap") {
    addGapDetails(group);
  }

  if (!isCoin && !isPowerUp && obstacle.kind !== "gap") {
    const edges = new THREE.LineSegments(
      new THREE.EdgesGeometry(geometry),
      new THREE.LineBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.58
      })
    );
    group.add(edges);
  }

  scene.add(group);
  return { group, kind: obstacle.kind, geometry, material };
}

function getObstacleColor(kind: ObstacleKind) {
  if (kind === "barrier") return 0xef4444;
  if (kind === "lowGate") return 0x38bdf8;
  if (kind === "train") return 0xe5e7eb;
  if (kind === "parkedTrain") return 0x94a3b8;
  if (kind === "gap") return 0x020617;
  return 0xfacc15;
}

function createObstacleGeometry(kind: ObstacleKind, isPowerUp: boolean) {
  if (kind === "coin") return new THREE.TorusGeometry(0.42, 0.12, 12, 32);
  if (isPowerUp) return new THREE.OctahedronGeometry(0.5, 0);
  if (kind === "train" || kind === "parkedTrain") {
    return new THREE.BoxGeometry(1.95, 1.55, 5.4);
  }
  if (kind === "gap") return new THREE.BoxGeometry(2.15, 0.08, 2.2);
  return new THREE.BoxGeometry(1.25, kind === "lowGate" ? 1.8 : 1.05, 0.5);
}

function addTrainDetails(group: THREE.Group, color: number, moving: boolean) {
  const glassMaterial = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    emissive: moving ? 0x38bdf8 : 0x1e293b,
    emissiveIntensity: moving ? 0.55 : 0.22,
    roughness: 0.25,
    metalness: 0.2
  });

  [-0.52, 0.52].forEach((x) => {
    const window = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.36, 0.05), glassMaterial);
    window.position.set(x, 0.32, -2.73);
    group.add(window);
  });

  [-0.58, 0.58].forEach((x) => {
    const headlight = new THREE.PointLight(moving ? 0xfff7ad : color, 0.85, 7);
    headlight.position.set(x, -0.18, -2.95);
    group.add(headlight);

    const bulb = new THREE.Mesh(
      new THREE.SphereGeometry(0.12, 10, 10),
      new THREE.MeshStandardMaterial({
        color: 0xfff7ad,
        emissive: 0xfff7ad,
        emissiveIntensity: 1.2
      })
    );
    bulb.position.copy(headlight.position);
    group.add(bulb);
  });
}

function addGapDetails(group: THREE.Group) {
  const warningMaterial = new THREE.MeshStandardMaterial({
    color: 0xfacc15,
    emissive: 0xfacc15,
    emissiveIntensity: 0.65
  });
  [-0.8, 0.8].forEach((x) => {
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.06, 2.25), warningMaterial);
    stripe.position.set(x, 0.08, 0);
    stripe.rotation.z = x > 0 ? 0.2 : -0.2;
    group.add(stripe);
  });
}

function disposeObstacleEntry(entry: ObstacleMeshEntry, scene: THREE.Scene) {
  scene.remove(entry.group);
  entry.group.traverse((object) => {
    if (object instanceof THREE.Mesh || object instanceof THREE.LineSegments) {
      object.geometry.dispose();
      const material = object.material;
      if (Array.isArray(material)) {
        material.forEach((item) => item.dispose());
      } else {
        material.dispose();
      }
    }
  });
}

function createPlayer(): CharacterRig {
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

  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(0.42, 0.5, 1.1, 18),
    bodyMaterial
  );
  body.position.y = 0.72;
  body.castShadow = true;
  group.add(body);

  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.34, 18, 18),
    headMaterial
  );
  head.position.y = 1.5;
  head.castShadow = true;
  group.add(head);

  const leftArm = createLimb(bodyMaterial, 0.09, 0.62);
  leftArm.position.set(-0.55, 0.92, 0);
  leftArm.rotation.z = -0.38;
  group.add(leftArm);

  const rightArm = createLimb(bodyMaterial, 0.09, 0.62);
  rightArm.position.set(0.55, 0.92, 0);
  rightArm.rotation.z = 0.38;
  group.add(rightArm);

  const leftLeg = createLimb(bodyMaterial, 0.12, 0.72);
  leftLeg.position.set(-0.22, 0.18, 0);
  group.add(leftLeg);

  const rightLeg = createLimb(bodyMaterial, 0.12, 0.72);
  rightLeg.position.set(0.22, 0.18, 0);
  group.add(rightLeg);

  group.position.set(0, 0.92, 0);
  return { group, leftArm, rightArm, leftLeg, rightLeg, head };
}

function createLimb(
  material: THREE.MeshStandardMaterial,
  radius: number,
  length: number
) {
  const limb = new THREE.Group();
  const mesh = new THREE.Mesh(
    new THREE.CapsuleGeometry(radius, length, 6, 10),
    material
  );
  mesh.position.y = -length / 2;
  mesh.castShadow = true;
  limb.add(mesh);
  return limb;
}

function createHoverboard() {
  const group = new THREE.Group();
  const board = new THREE.Mesh(
    new THREE.BoxGeometry(1.15, 0.12, 0.52),
    new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.75,
      roughness: 0.22,
      metalness: 0.35
    })
  );
  group.add(board);

  [-0.48, 0.48].forEach((x) => {
    const light = new THREE.Mesh(
      new THREE.SphereGeometry(0.1, 10, 10),
      new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x38bdf8,
        emissiveIntensity: 1.1
      })
    );
    light.position.set(x, -0.02, -0.16);
    group.add(light);
  });

  group.visible = false;
  return group;
}

function createChaser(): CharacterRig {
  const group = new THREE.Group();
  const uniformMaterial = new THREE.MeshStandardMaterial({
    color: 0x1d4ed8,
    emissive: 0x0f172a,
    roughness: 0.35,
    metalness: 0.08
  });
  const vestMaterial = new THREE.MeshStandardMaterial({
    color: 0xfacc15,
    emissive: 0x713f12,
    roughness: 0.28,
    metalness: 0.08
  });
  const skinMaterial = new THREE.MeshStandardMaterial({
    color: 0xf8b27a,
    roughness: 0.35
  });

  const body = new THREE.Mesh(new THREE.BoxGeometry(0.72, 1.05, 0.42), uniformMaterial);
  body.position.y = 0.86;
  body.castShadow = true;
  group.add(body);

  const vest = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.36, 0.46), vestMaterial);
  vest.position.y = 1.05;
  group.add(vest);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.28, 16, 16), skinMaterial);
  head.position.y = 1.55;
  head.castShadow = true;
  group.add(head);

  const cap = new THREE.Mesh(
    new THREE.CylinderGeometry(0.3, 0.34, 0.16, 16),
    uniformMaterial
  );
  cap.position.y = 1.78;
  group.add(cap);

  const leftArm = createLimb(uniformMaterial, 0.08, 0.58);
  leftArm.position.set(-0.48, 0.95, 0);
  leftArm.rotation.z = 0.52;
  group.add(leftArm);

  const rightArm = createLimb(uniformMaterial, 0.08, 0.58);
  rightArm.position.set(0.48, 0.95, 0);
  rightArm.rotation.z = -0.52;
  group.add(rightArm);

  const leftLeg = createLimb(uniformMaterial, 0.1, 0.62);
  leftLeg.position.set(-0.19, 0.35, 0);
  leftLeg.rotation.z = -0.18;
  group.add(leftLeg);

  const rightLeg = createLimb(uniformMaterial, 0.1, 0.62);
  rightLeg.position.set(0.19, 0.35, 0);
  rightLeg.rotation.z = 0.18;
  group.add(rightLeg);

  group.position.set(0, 0.8, -5.8);
  group.scale.setScalar(0.9);
  return { group, leftArm, rightArm, leftLeg, rightLeg, head };
}

function createMetroWorld(scene: THREE.Scene): MetroWorld {
  const rails = new THREE.Group();
  const railMaterial = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    roughness: 0.3,
    metalness: 0.7
  });
  const sleeperMaterial = new THREE.MeshStandardMaterial({
    color: 0x4b5563,
    roughness: 0.65,
    metalness: 0.18
  });

  [-1, 0, 1].forEach((lane) => {
    [-0.48, 0.48].forEach((offset) => {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.08, 120), railMaterial);
      rail.position.set(lane * LANE_WIDTH + offset, 0.08, 31);
      rail.receiveShadow = true;
      rails.add(rail);
    });
  });
  scene.add(rails);

  const sleepers = Array.from({ length: 34 }, (_, index) => {
    const sleeper = new THREE.Mesh(new THREE.BoxGeometry(8.2, 0.08, 0.18), sleeperMaterial);
    sleeper.position.set(0, 0.1, -10 + index * 3.6);
    sleeper.receiveShadow = true;
    scene.add(sleeper);
    return sleeper;
  });

  const tunnelLights = Array.from({ length: 16 }, (_, index) => {
    const side = index % 2 === 0 ? -1 : 1;
    const light = new THREE.PointLight(0x38bdf8, 0.75, 12);
    light.position.set(side * 4.9, 2.3, index * 7.5 - 8);
    scene.add(light);
    return light;
  });

  const billboards = Array.from({ length: 10 }, (_, index) => {
    const side = index % 2 === 0 ? -1 : 1;
    const group = new THREE.Group();
    const panel = new THREE.Mesh(
      new THREE.BoxGeometry(2.3, 0.9, 0.08),
      new THREE.MeshStandardMaterial({
        color: index % 3 === 0 ? 0x16a34a : index % 3 === 1 ? 0x2563eb : 0xdc2626,
        emissive: index % 3 === 0 ? 0x052e16 : index % 3 === 1 ? 0x082f49 : 0x450a0a,
        emissiveIntensity: 0.45,
        roughness: 0.32
      })
    );
    panel.castShadow = true;
    group.add(panel);
    group.position.set(side * 5.15, 2.1, index * 12 + 8);
    group.rotation.y = side * -0.18;
    scene.add(group);
    return group;
  });

  return { rails, sleepers, tunnelLights, billboards };
}

function recycleMetroWorld(
  world: MetroWorld,
  travel: number,
  elapsed: number,
  config: ThemeConfig
) {
  world.sleepers.forEach((sleeper) => {
    sleeper.position.z -= travel;
    if (sleeper.position.z < -16) {
      sleeper.position.z += 122.4;
    }
  });

  world.tunnelLights.forEach((light, index) => {
    light.position.z -= travel;
    light.color.setHex(config.accentColor);
    light.intensity = 0.6 + Math.sin(elapsed * 5 + index) * 0.2;
    if (light.position.z < -18) {
      light.position.z += 120;
    }
  });

  world.billboards.forEach((billboard, index) => {
    billboard.position.z -= travel * 0.92;
    billboard.scale.setScalar(1 + Math.sin(elapsed * 2 + index) * 0.04);
    if (billboard.position.z < -18) {
      billboard.position.z += 120;
    }
  });
}

function disposeMetroWorld(world: MetroWorld) {
  world.rails.traverse((object) => {
    if (object instanceof THREE.Mesh) {
      object.geometry.dispose();
      disposeMaterial(object.material);
    }
  });
  world.sleepers.forEach((sleeper) => {
    sleeper.geometry.dispose();
    disposeMaterial(sleeper.material);
  });
  world.billboards.forEach((billboard) => {
    billboard.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.geometry.dispose();
        disposeMaterial(object.material);
      }
    });
  });
}

function disposeMaterial(material: THREE.Material | THREE.Material[]) {
  if (Array.isArray(material)) {
    material.forEach((item) => item.dispose());
    return;
  }

  material.dispose();
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
      windowPositions[w * 3] =
        mesh.position.x + (Math.random() - 0.5) * width * 0.8;
      windowPositions[w * 3 + 1] = 0.8 + Math.random() * (height - 1);
      windowPositions[w * 3 + 2] = mesh.position.z - depth / 2 - 0.03;
    }
    windowGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(windowPositions, 3)
    );
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
    buildings.push({
      mesh,
      windows,
      side,
      speedOffset: 0.8 + Math.random() * 0.45
    });
  }

  return buildings;
}

function recycleBuildings(buildings: Building[], travel: number) {
  buildings.forEach((building) => {
    building.mesh.position.z -= travel * building.speedOffset;
    building.windows.position.z -= travel * building.speedOffset;

    if (building.mesh.position.z < -15) {
      building.mesh.position.z += 126;
      building.mesh.position.x =
        building.side * (6.5 + Math.random() * 6);
      building.windows.position.z = 0;
      const positions = building.windows.geometry.attributes.position
        .array as Float32Array;
      for (let i = 0; i < positions.length / 3; i += 1) {
        positions[i * 3] =
          building.mesh.position.x + (Math.random() - 0.5) * 1.3;
        positions[i * 3 + 2] = building.mesh.position.z - 1.2;
      }
      building.windows.geometry.attributes.position.needsUpdate = true;
    }
  });
}
