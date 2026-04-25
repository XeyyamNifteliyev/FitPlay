"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PoseLandmarker } from "@mediapipe/tasks-vision";

import type { RunnerCommand } from "../engine/runner-engine";
import type { RunnerInputHandler } from "./runner-input";
import {
  classifyPoseGesture,
  createCalibrationFromLandmarks,
  getPoseSensitivityConfig,
  shouldEmitPoseCommand,
  type PoseCalibration,
  type PoseLandmark,
  type PoseSensitivityMode,
  type PoseTrackingMode
} from "./pose-gesture";

type PoseInputStatus = "idle" | "loading" | "camera" | "calibrated" | "error";

type PoseInputState = {
  status: PoseInputStatus;
  message: string;
  gestureLabel: string;
  isCalibrated: boolean;
  fps: number;
  latencyMs: number;
};

const WASM_URL =
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.34/wasm";
const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/latest/pose_landmarker_lite.task";

export function usePoseRunnerInput(onInput: RunnerInputHandler) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const landmarkerRef = useRef<PoseLandmarker | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number | null>(null);
  const lastLandmarksRef = useRef<PoseLandmark[] | null>(null);
  const calibrationRef = useRef<PoseCalibration | null>(null);
  const lastCommandRef = useRef<RunnerCommand | null>(null);
  const lastCommandAtRef = useRef(0);
  const lastUiUpdateAtRef = useRef(0);
  const lastFrameAtRef = useRef(0);
  const [trackingMode, setTrackingModeState] =
    useState<PoseTrackingMode>("fullBody");
  const [sensitivityMode, setSensitivityModeState] =
    useState<PoseSensitivityMode>("fast");

  const [state, setState] = useState<PoseInputState>({
    status: "idle",
    message: "Kamera sondurulub",
    gestureLabel: "Neytral",
    isCalibrated: false,
    fps: 0,
    latencyMs: 0
  });

  const stop = useCallback(() => {
    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    landmarkerRef.current?.close();
    landmarkerRef.current = null;

    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    calibrationRef.current = null;
    lastLandmarksRef.current = null;
    lastCommandRef.current = null;
    lastCommandAtRef.current = 0;

    setState({
      status: "idle",
      message: "Kamera sondurulub",
      gestureLabel: "Neytral",
      isCalibrated: false,
      fps: 0,
      latencyMs: 0
    });
  }, []);

  const start = useCallback(async () => {
    if (!videoRef.current || landmarkerRef.current) {
      return;
    }

    try {
      setState((current) => ({
        ...current,
        status: "loading",
        message: "MediaPipe ve kamera hazirlanir..."
      }));

      const config = getPoseSensitivityConfig(sensitivityMode);
      const [{ FilesetResolver, PoseLandmarker }, stream] = await Promise.all([
        import("@mediapipe/tasks-vision"),
        navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: { ideal: config.videoWidth },
            height: { ideal: config.videoHeight },
            frameRate: { ideal: 60, min: 30 }
          },
          audio: false
        })
      ]);

      const vision = await FilesetResolver.forVisionTasks(WASM_URL);
      const landmarker = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: MODEL_URL,
          delegate: "GPU"
        },
        runningMode: "VIDEO",
        numPoses: 1
      });

      streamRef.current = stream;
      landmarkerRef.current = landmarker;

      videoRef.current.srcObject = stream;
      await videoRef.current.play();

      setState({
        status: "camera",
        message: "TV rejimi ucun basdan ayaga gorun ve kalibrasiya et",
        gestureLabel: "Neytral",
        isCalibrated: false,
        fps: 0,
        latencyMs: 0
      });

      const loop = () => {
        const video = videoRef.current;
        const detector = landmarkerRef.current;

        if (!video || !detector || video.readyState < 2) {
          animationRef.current = requestAnimationFrame(loop);
          return;
        }

        const detectStartedAt = performance.now();
        const result = detector.detectForVideo(video, detectStartedAt);
        const detectEndedAt = performance.now();
        const frameDelta = lastFrameAtRef.current
          ? detectEndedAt - lastFrameAtRef.current
          : 0;
        lastFrameAtRef.current = detectEndedAt;
        const landmarks = result.landmarks[0] as PoseLandmark[] | undefined;
        lastLandmarksRef.current = landmarks ?? null;

        if (!landmarks) {
          setState((current) => ({
            ...current,
            message: "Beden kamerada gorunmur",
            gestureLabel: "Neytral"
          }));
          animationRef.current = requestAnimationFrame(loop);
          return;
        }

        const gesture = classifyPoseGesture(
          landmarks,
          calibrationRef.current,
          trackingMode,
          sensitivityMode
        );
        const now = detectEndedAt;
        const command = gesture.command;

        if (!command) {
          lastCommandRef.current = null;
          lastCommandAtRef.current = 0;
        }

        if (
          command &&
          shouldEmitPoseCommand(
            lastCommandRef.current,
            command,
            now,
            config.cooldownMs,
            lastCommandAtRef.current
          )
        ) {
          lastCommandRef.current = command;
          lastCommandAtRef.current = now;
          onInput({ command, source: "mediapipe", at: now });
        }

        if (now - lastUiUpdateAtRef.current >= config.uiUpdateMs) {
          lastUiUpdateAtRef.current = now;
          setState((current) => ({
            ...current,
            message: calibrationRef.current
              ? "Kamera ile idare aktivdir"
              : trackingMode === "fullBody"
                ? "TV rejimi: bas, ciyin, bel ve ayaqlar gorunmelidir"
                : "Laptop test: bas, ciyin ve bel gorunurse kalibrasiya et",
            gestureLabel: gesture.label,
            isCalibrated: Boolean(calibrationRef.current),
            fps: frameDelta > 0 ? Math.round(1000 / frameDelta) : current.fps,
            latencyMs: Math.round(detectEndedAt - detectStartedAt)
          }));
        }

        animationRef.current = requestAnimationFrame(loop);
      };

      animationRef.current = requestAnimationFrame(loop);
    } catch (error) {
      stop();
      setState({
        status: "error",
        message:
          error instanceof Error
            ? `Kamera acilmadi: ${error.message}`
            : "Kamera acilmadi",
        gestureLabel: "Neytral",
        isCalibrated: false,
        fps: 0,
        latencyMs: 0
      });
    }
  }, [onInput, stop, trackingMode, sensitivityMode]);

  const calibrate = useCallback(() => {
    const landmarks = lastLandmarksRef.current;
    const calibration = landmarks
      ? createCalibrationFromLandmarks(landmarks, trackingMode)
      : null;

    if (!calibration) {
      setState((current) => ({
        ...current,
        message:
          trackingMode === "fullBody"
            ? "TV tam beden ucun basdan ayaga qeder gorunmelisen"
            : "Kalibrasiya ucun bas, ciyin ve bel gorunmelidir"
      }));
      return;
    }

    calibrationRef.current = calibration;
    lastCommandRef.current = null;
    lastCommandAtRef.current = 0;

    setState((current) => ({
      ...current,
      status: "calibrated",
      message: "Kalibrasiya tamamdir. Hereketle oyna!",
      isCalibrated: true
    }));
  }, [trackingMode]);

  const setTrackingMode = useCallback((mode: PoseTrackingMode) => {
    setTrackingModeState(mode);
    calibrationRef.current = null;
    lastCommandRef.current = null;
    lastCommandAtRef.current = 0;
    setState((current) => ({
      ...current,
      status: current.status === "calibrated" ? "camera" : current.status,
      message:
        mode === "fullBody"
          ? "TV tam beden rejimi aktivdir"
          : "Laptop test rejimi aktivdir",
      isCalibrated: false,
      gestureLabel: "Neytral"
    }));
  }, []);

  const setSensitivityMode = useCallback((mode: PoseSensitivityMode) => {
    setSensitivityModeState(mode);
    lastCommandRef.current = null;
    lastCommandAtRef.current = 0;
    setState((current) => ({
      ...current,
      message:
        mode === "fast"
          ? "Fast rejim: daha tez reaksiya, daha az filtr"
          : "Normal rejim: daha stabil, biraz gecikmeli",
      gestureLabel: "Neytral"
    }));
  }, []);

  useEffect(() => stop, [stop]);

  return {
    videoRef,
    start,
    stop,
    calibrate,
    trackingMode,
    setTrackingMode,
    sensitivityMode,
    setSensitivityMode,
    ...state
  };
}
