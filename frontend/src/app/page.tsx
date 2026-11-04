"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

export default function HomePage() {
  const router = useRouter();

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
        streamRef.current.getTracks().forEach((track) => {
          track.stop();
        });
      }
    };
  }, []);

  async function startCamera() {
    setError("");

    try {
      const stream =
        await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "environment",
          },
          audio: false,
        });

      streamRef.current = stream;

      setCameraOpen(true);
    } catch {
      setError(
        "Camera access was unavailable. You can upload a receipt instead."
      );
    }
  }

  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
    }

    streamRef.current = null;

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setCameraOpen(false);
  }

  async function captureReceipt() {
    const video = videoRef.current;

    if (!video) return;

    const canvas = document.createElement("canvas");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");

    if (!context) return;

    context.drawImage(
      video,
      0,
      0,
      canvas.width,
      canvas.height
    );

    canvas.toBlob(
      async (blob) => {
        if (!blob) return;

        stopCamera();

        await scanReceipt(blob, "receipt.jpg");
      },
      "image/jpeg",
      0.9
    );
  }

  async function handleUpload(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    setError("");

    await scanReceipt(file, file.name);

    event.target.value = "";
  }

  async function scanReceipt(
    file: Blob,
    filename: string
  ) {
    setScanning(true);
    setError("");

    try {
      const formData = new FormData();

      formData.append("file", file, filename);

      const response = await fetch(`${API_URL}/ocr/`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => null);

        throw new Error(
          errorData?.detail ??
            "Something went wrong while scanning the receipt."
        );
      }

      const data = await response.json();

      sessionStorage.setItem(
        "mosesScanResult",
        JSON.stringify(data)
      );

      router.push("/review");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to scan receipt."
      );
    } finally {
      setScanning(false);
    }
  }

  function useDemoReceipt() {
    router.push("/review");
  }

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-8 text-zinc-900">
      <div className="mx-auto flex min-h-[85vh] max-w-lg flex-col">
        {/* Logo */}
        <div>
          <p className="text-lg font-bold tracking-tight">
            Moses
          </p>
        </div>

        {/* Main Content */}
        <div className="flex flex-1 flex-col justify-center">
          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold leading-tight tracking-tight">
              Split the bill.
              <br />
              Not the friendship.
            </h1>

            <p className="mt-4 max-w-sm text-lg text-zinc-500">
              Scan your receipt and Moses will help figure out
              exactly what everyone owes.
            </p>
          </div>

          {/* Scanning State */}
          {scanning ? (
            <div className="rounded-3xl bg-white p-8 text-center shadow-sm">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-black text-2xl text-white">
                ◌
              </div>

              <h2 className="mt-5 text-xl font-semibold">
                Reading your receipt...
              </h2>

              <p className="mt-2 text-zinc-500">
                Finding items, prices, and totals.
              </p>

              <div className="mt-6 h-2 overflow-hidden rounded-full bg-zinc-200">
                <div className="h-full w-2/3 animate-pulse rounded-full bg-black" />
              </div>
            </div>
          ) : cameraOpen ? (
            /* Camera */
            <div className="overflow-hidden rounded-3xl bg-white shadow-sm">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="aspect-[3/4] w-full bg-black object-cover"
              />

              <div className="space-y-3 p-4">
                <button
                  type="button"
                  onClick={captureReceipt}
                  className="w-full rounded-2xl bg-black px-5 py-4 font-semibold text-white hover:bg-zinc-800"
                >
                  Capture Receipt
                </button>

                <button
                  type="button"
                  onClick={stopCamera}
                  className="w-full rounded-2xl border border-zinc-300 px-5 py-4 font-semibold hover:bg-zinc-100"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Upload Card */}
              <div className="rounded-3xl bg-white p-6 shadow-sm">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100 text-3xl">
                  🧾
                </div>

                <h2 className="mt-5 text-xl font-semibold">
                  Scan your receipt
                </h2>

                <p className="mt-2 text-zinc-500">
                  Take a photo or upload an existing image of
                  your receipt.
                </p>

                <div className="mt-6 space-y-3">
                  <button
                    type="button"
                    onClick={startCamera}
                    className="w-full rounded-2xl bg-black px-5 py-4 font-semibold text-white hover:bg-zinc-800"
                  >
                    Take Photo
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      fileInputRef.current?.click()
                    }
                    className="w-full rounded-2xl border border-zinc-300 bg-white px-5 py-4 font-semibold hover:bg-zinc-100"
                  >
                    Upload Receipt
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleUpload}
                  />
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4">
                  <p className="text-sm font-medium text-red-700">
                    {error}
                  </p>
                </div>
              )}

              {/* Temporary Development Option */}
              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={useDemoReceipt}
                  className="text-sm font-medium text-zinc-500 underline underline-offset-4 hover:text-black"
                >
                  Use demo receipt
                </button>

                <p className="mt-2 text-xs text-zinc-400">
                  Temporary option while scanner setup is being
                  finalized.
                </p>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-zinc-400">
          Scan. Split. Settle.
        </p>
      </div>
    </main>
  );
}