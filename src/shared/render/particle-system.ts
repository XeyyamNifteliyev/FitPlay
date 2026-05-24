import * as THREE from "three";

export type FxParticle = {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  life: number;
  maxLife: number;
  size: number;
  color: THREE.Color;
};

export function createParticlePool(count: number): FxParticle[] {
  return Array.from({ length: count }, () => ({
    position: new THREE.Vector3(0, -20, 0),
    velocity: new THREE.Vector3(),
    life: 0,
    maxLife: 1,
    size: 0.09,
    color: new THREE.Color(0x7dd3fc)
  }));
}

export function spawnBurst(
  pool: FxParticle[],
  origin: THREE.Vector3,
  color: THREE.ColorRepresentation,
  count: number,
  power = 3
) {
  for (let i = 0; i < count; i += 1) {
    const p = pool[i % pool.length];
    p.position.copy(origin);
    p.velocity.set(
      (Math.random() - 0.5) * power,
      Math.random() * power,
      (Math.random() - 0.5) * power
    );
    p.life = p.maxLife = 0.45 + Math.random() * 0.55;
    p.color.set(color);
  }
}

export function tickParticles(
  particles: FxParticle[],
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
