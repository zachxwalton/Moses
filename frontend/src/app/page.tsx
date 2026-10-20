"use client";

import { type ChangeEvent, useCallback, useEffect, useRef, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";
const MAX_DIMENSION = 1080;

type ErrorPayload = {
  error: string;
  name?: string;
  hint?: string;
};

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [output, setOutput] = useState("");
  const [cameraReady, setCameraReady] = useState(false);
  const [captureDisabled, setCaptureDisabled] = useState(true);
  const [uploading, setUploading] = useState(false);

  const stopCamera = useCallback(() => {
    const stream = streamRef.current;
    if (!stream) return;
    for (const track of stream.getTracks()) track.stop();
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraReady(false);
    setCaptureDisabled(true);
  }, []);

  useEffect(() => {
    window.addEventListener("pagehide", stopCamera);
    return () => {
      window.removeEventListener("pagehide", stopCamera);
      stopCamera();
    };
  }, [stopCamera]);

  async function startCamera() {
    setOutput("");
    if (!navigator.mediaDevices?.getUserMedia) {
      setOutput(
        JSON.stringify(
          {
            error: "Camera API is unavailable.",
            hint: "Open the app at http://localhost:3000 or over HTTPS; camera access is blocked on plain HTTP network addresses.",
          },
          null,
          2,
        ),
      );
      return;
    }

    try {
      stopCamera();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });
      const video = videoRef.current;
      if (!video) {
        for (const track of stream.getTracks()) track.stop();
        throw new Error("Video element is missing.");
      }
      streamRef.current = stream;
      video.srcObject = stream;
      await video.play();
      setCameraReady(true);
      setCaptureDisabled(false);
    } catch (err) {
      stopCamera();
      setOutput(JSON.stringify(cameraError(err), null, 2));
    }
  }

  async function capture() {
    const video = videoRef.current;
    if (!video || !streamRef.current) return;

    setCaptureDisabled(true);
    setOutput("");
    try {
      await send(await videoToJpeg(video), "capture.jpg");
    } catch (err) {
      setOutput(JSON.stringify(errorPayload(err), null, 2));
    } finally {
      setCaptureDisabled(!streamRef.current);
    }
  }

  async function upload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setUploading(true);
    setOutput("");
    try {
      await send(await prepareUpload(file), file.name);
    } catch (err) {
      setOutput(JSON.stringify(errorPayload(err), null, 2));
    } finally {
      setUploading(false);
    }
  }

  async function send(blob: Blob, name: string) {
    const body = new FormData();
    body.append("file", blob, name);
    const response = await fetch(`${API_URL}/ocr/`, { method: "POST", body });
    const text = await response.text();

    try {
      setOutput(JSON.stringify(JSON.parse(text), null, 2));
    } catch {
      setOutput(JSON.stringify({ status: response.status, body: text }, null, 2));
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-4 p-6">
      <h1 className="text-xl font-semibold">Moses receipt scanner</h1>

      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full max-w-xl bg-black"
      />

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={startCamera}
          className="rounded border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
        >
          {cameraReady ? "Restart camera" : "Start camera"}
        </button>
        <button
          type="button"
          onClick={capture}
          disabled={captureDisabled}
          className="rounded border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-100 disabled:opacity-40 dark:border-zinc-700 dark:hover:bg-zinc-800"
        >
          Capture
        </button>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="rounded border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-100 disabled:opacity-40 dark:border-zinc-700 dark:hover:bg-zinc-800"
        >
          Upload image
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={upload}
        />
      </div>

      <pre className="min-h-48 overflow-auto rounded border border-zinc-300 bg-zinc-50 p-4 text-sm dark:border-zinc-700 dark:bg-zinc-900">
        {output}
      </pre>
    </main>
  );
}

function cameraError(err: unknown): ErrorPayload {
  if (err instanceof DOMException) {
    const hints: Record<string, string> = {
      NotAllowedError:
        "Camera permission is blocked for this site. Allow camera access in the address bar, then retry.",
      NotReadableError:
        "Another tab or app is using the camera. Close it, then press Start camera.",
      NotFoundError: "No camera was detected.",
      SecurityError:
        "Camera access requires a secure context. Use http://localhost:3000 or HTTPS.",
    };
    return {
      error: `Camera unavailable: ${err.message}`,
      name: err.name,
      ...(hints[err.name] ? { hint: hints[err.name] } : {}),
    };
  }
  return errorPayload(err);
}

function errorPayload(err: unknown): ErrorPayload {
  return { error: err instanceof Error ? err.message : String(err) };
}

function videoToJpeg(video: HTMLVideoElement): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext("2d")?.drawImage(video, 0, 0);
  return canvasToJpeg(canvas);
}

async function prepareUpload(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
  if (scale === 1) {
    bitmap.close();
    return file;
  }

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvasToJpeg(canvas);
}

function canvasToJpeg(canvas: HTMLCanvasElement): Promise<Blob> {
  const { promise, resolve, reject } = Promise.withResolvers<Blob>();
  canvas.toBlob(
    (blob) => (blob ? resolve(blob) : reject(new Error("could not encode the image"))),
    "image/jpeg",
    0.92,
  );
  return promise;
}
