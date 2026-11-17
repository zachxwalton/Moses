"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSplit } from "@/context/SplitContext";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

export default function Home() {
  const router = useRouter();
  const { resetSplit } = useSplit();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [cameraOpen, setCameraOpen] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (
      cameraOpen &&
      videoRef.current &&
      streamRef.current
    ) {
      videoRef.current.srcObject = streamRef.current;

      videoRef.current.play().catch(() => {
        setError("Could not start the camera preview.");
      });
    }
  }, [cameraOpen]);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current
          .getTracks()
          .forEach((track) => track.stop());
      }
    };
  }, []);

  async function startCamera() {
    setError("");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
        },
      });

      streamRef.current = stream;
      setCameraOpen(true);
    } catch {
      setError(
        "Camera access was denied or is not available."
      );
    }
  }

  function stopCamera() {
    if (streamRef.current) {
      streamRef.current
        .getTracks()
        .forEach((track) => track.stop());

      streamRef.current = null;
    }

    setCameraOpen(false);
  }

  async function captureReceipt() {
    if (!videoRef.current) return;

    const video = videoRef.current;

    if (!video.videoWidth || !video.videoHeight) {
      setError("Camera is not ready yet.");
      return;
    }

    const canvas = document.createElement("canvas");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");

    if (!context) {
      setError("Could not capture the receipt.");
      return;
    }

    context.drawImage(
      video,
      0,
      0,
      canvas.width,
      canvas.height
    );

    canvas.toBlob(
      async (blob) => {
        if (!blob) {
          setError("Could not capture the receipt.");
          return;
        }

        const file = new File(
          [blob],
          "receipt-camera.jpg",
          {
            type: "image/jpeg",
          }
        );

        stopCamera();

        await scanReceipt(file);
      },
      "image/jpeg",
      0.9
    );
  }

  async function handleFileUpload(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    await scanReceipt(file);

    event.target.value = "";
  }

  async function scanReceipt(file: File) {
    setScanning(true);
    setError("");

    try {
      const formData = new FormData();

      formData.append("file", file);

      const response = await fetch(`${API_URL}/ocr/`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("OCR request failed.");
      }

      const data = await response.json();

      sessionStorage.setItem(
        "mosesScanResult",
        JSON.stringify(data)
      );

      router.push("/review");
    } catch {
      setError(
        "The OCR service is currently unavailable. You can still try the presentation demo below."
      );
    } finally {
      setScanning(false);
    }
  }

  function useDemoReceipt() {
  setError("");
  resetSplit();
  router.push("/review");
}

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-10 text-zinc-900">
      <div className="mx-auto max-w-lg">
        {/* Brand */}
        <div className="mb-10 text-center">
          <div className="mb-4 inline-flex items-center rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium shadow-sm">
            Moses
          </div>

          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Split the bill.
            <br />
            Not the friendship.
          </h1>

          <p className="mx-auto mt-4 max-w-md text-zinc-500">
            Scan a receipt, assign each item, and instantly
            see what everyone owes.
          </p>
        </div>

        {/* Scanner Card */}
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-xl font-semibold">
              Scan your receipt
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
              Take a photo or upload an existing receipt.
            </p>
          </div>

          {cameraOpen ? (
            <div>
              <div className="overflow-hidden rounded-2xl bg-black">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="aspect-[3/4] w-full object-cover"
                />
              </div>

              <button
                type="button"
                onClick={captureReceipt}
                disabled={scanning}
                className="mt-4 w-full rounded-2xl bg-black px-5 py-4 font-semibold text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
              >
                {scanning
                  ? "Scanning..."
                  : "Capture Receipt"}
              </button>

              <button
                type="button"
                onClick={stopCamera}
                className="mt-3 w-full rounded-2xl border border-zinc-300 px-5 py-4 font-semibold hover:bg-zinc-100"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <button
                type="button"
                onClick={startCamera}
                disabled={scanning}
                className="w-full rounded-2xl bg-black px-5 py-4 font-semibold text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
              >
                📷 Take Photo
              </button>

              <button
                type="button"
                onClick={() =>
                  fileInputRef.current?.click()
                }
                disabled={scanning}
                className="w-full rounded-2xl border border-zinc-300 bg-white px-5 py-4 font-semibold hover:bg-zinc-100 disabled:cursor-not-allowed disabled:text-zinc-400"
              >
                {scanning
                  ? "Scanning..."
                  : "Upload Receipt"}
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          )}

          {error && (
            <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
        </div>

        {/* Demo */}
        <div className="mt-6 rounded-3xl border border-dashed border-zinc-300 bg-white p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="inline-flex rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-zinc-600">
                Demo Mode
              </div>

              <h2 className="mt-3 text-lg font-semibold">
                Try Moses without a receipt
              </h2>

              <p className="mt-1 text-sm text-zinc-500">
                Use a sample Dishoom receipt to walk through
                the complete splitting experience.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={useDemoReceipt}
            className="mt-5 w-full rounded-2xl bg-zinc-900 px-5 py-4 font-semibold text-white hover:bg-zinc-700"
          >
            Use Demo Receipt →
          </button>
        </div>

        {/* How It Works */}
        <div className="mt-10">
          <p className="mb-4 text-center text-sm font-semibold uppercase tracking-wide text-zinc-400">
            How it works
          </p>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-white font-bold shadow-sm">
                1
              </div>

              <p className="mt-2 text-sm font-medium">
                Scan
              </p>
            </div>

            <div>
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-white font-bold shadow-sm">
                2
              </div>

              <p className="mt-2 text-sm font-medium">
                Assign
              </p>
            </div>

            <div>
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-white font-bold shadow-sm">
                3
              </div>

              <p className="mt-2 text-sm font-medium">
                Split
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}