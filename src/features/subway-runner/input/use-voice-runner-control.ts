"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { parseVoiceCommand, type VoiceCommand } from "./pose-gesture";

type VoiceControlHandlers = {
  onCamera: () => void | Promise<void>;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onCalibrate: () => void;
  onRestart: () => void;
  onBackToGames: () => void;
  onSelectSubway: () => void;
  onStop: () => void;
};

type VoiceStatus = "idle" | "listening" | "unsupported" | "error";

type BrowserSpeechRecognition = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((event: SpeechRecognitionResultEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechRecognitionConstructor = new () => BrowserSpeechRecognition;

type SpeechRecognitionResultEvent = {
  results: ArrayLike<{
    isFinal: boolean;
    length: number;
    0: {
      transcript: string;
    };
    [index: number]: {
      transcript: string;
    };
  }>;
};

type SpeechRecognitionErrorEvent = {
  error: string;
};

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

export function useVoiceRunnerControl(handlers: VoiceControlHandlers) {
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);
  const [status, setStatus] = useState<VoiceStatus>("idle");
  const [message, setMessage] = useState("Ses komandasi sondurulub");
  const [lastTranscript, setLastTranscript] = useState("");

  const speak = useCallback((text: string) => {
    if (!("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "tr-TR";
    utterance.rate = 1;
    window.speechSynthesis.speak(utterance);
  }, []);

  const runCommand = useCallback(
    async (command: VoiceCommand) => {
      if (command === "camera") {
        speak("Kamera acilir");
        await handlers.onCamera();
        return;
      }

      if (command === "start") {
        speak("Oyun baslayir");
        handlers.onStart();
        return;
      }

      if (command === "pause") {
        speak("Pauza");
        handlers.onPause();
        return;
      }

      if (command === "resume") {
        speak("Davam edir");
        handlers.onResume();
        return;
      }

      if (command === "calibrate") {
        speak("Kalibrasiya edilir");
        handlers.onCalibrate();
        return;
      }

      if (command === "restart") {
        speak("Oyun yeniden baslayir");
        handlers.onRestart();
        return;
      }

      if (command === "backToGames") {
        speak("Oyunlara qayidir");
        handlers.onBackToGames();
        return;
      }

      if (command === "selectSubway") {
        speak("Subway Runner secildi");
        handlers.onSelectSubway();
        return;
      }

      speak("Kamera dayandirildi");
      handlers.onStop();
    },
    [handlers, speak]
  );

  const startListening = useCallback(() => {
    const SpeechRecognition =
      window.SpeechRecognition ?? window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setStatus("unsupported");
      setMessage("Bu browser ses komandalarini desteklemir");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "tr-TR";
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.maxAlternatives = 5;
    recognition.onresult = (event) => {
      const result = event.results[event.results.length - 1];
      const alternatives = Array.from(
        { length: result?.length ?? 0 },
        (_, index) => result?.[index]?.transcript ?? ""
      ).filter(Boolean);
      const transcript = alternatives[0] ?? "";
      const command = alternatives
        .map((alternative) => parseVoiceCommand(alternative))
        .find(Boolean);

      setLastTranscript(transcript.trim());

      if (!command) {
        setMessage(`Esitdim: ${transcript.trim() || "anlasilmadi"}`);
        return;
      }

      setMessage(`Komanda: ${command}`);
      void runCommand(command);
    };
    recognition.onerror = (event) => {
      setStatus("error");
      setMessage(`Ses xetasi: ${event.error}`);
    };
    recognition.onend = () => {
      setStatus((current) => {
        if (current !== "listening") return current;

        try {
          recognition.start();
        } catch {
          return "idle";
        }

        return current;
      });
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
      setStatus("listening");
      setMessage("Dinleyirem: basla, pauza, davam et, oyunlara qayit");
      speak("Ses komandasi aktivdir");
    } catch {
      setStatus("error");
      setMessage("Ses komandasi baslamadi");
    }
  }, [runCommand, speak]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setStatus("idle");
    setMessage("Ses komandasi sondurulub");
  }, []);

  useEffect(() => stopListening, [stopListening]);

  return {
    status,
    message,
    lastTranscript,
    startListening,
    stopListening
  };
}
