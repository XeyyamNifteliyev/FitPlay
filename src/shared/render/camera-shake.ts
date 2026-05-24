import * as THREE from "three";

export type CameraShakeState = {
  timer: number;
  intensity: number;
};

export function createCameraShake(): CameraShakeState {
  return { timer: 0, intensity: 0 };
}

export function triggerShake(
  state: CameraShakeState,
  intensity: number,
  duration = 0.35
): CameraShakeState {
  return { timer: duration, intensity };
}

export function tickShake(
  state: CameraShakeState,
  delta: number
): { offset: THREE.Vector3; state: CameraShakeState } {
  if (state.timer <= 0) {
    return { offset: new THREE.Vector3(), state: { timer: 0, intensity: 0 } };
  }

  const offset = new THREE.Vector3(
    (Math.random() - 0.5) * state.intensity,
    (Math.random() - 0.5) * state.intensity,
    0
  );

  return {
    offset,
    state: { timer: Math.max(0, state.timer - delta), intensity: state.intensity }
  };
}
