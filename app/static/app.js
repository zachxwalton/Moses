const camera = document.getElementById("camera");
const startBtn = document.getElementById("start");
const captureBtn = document.getElementById("capture");
const uploadBtn = document.getElementById("upload");
const fileInput = document.getElementById("file");
const output = document.getElementById("output");
const MAX_DIMENSION = 1080;

let stream = null;

startBtn.addEventListener("click", startCamera);
captureBtn.addEventListener("click", capture);
uploadBtn.addEventListener("click", () => fileInput.click());
fileInput.addEventListener("change", upload);
window.addEventListener("pagehide", stopCamera);

async function startCamera() {
  startBtn.disabled = true;
  output.textContent = "";

  try {
    stopCamera();
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment", width: { ideal: 1920 }, height: { ideal: 1080 } },
      audio: false,
    });
    camera.srcObject = stream;
    await camera.play();
    captureBtn.disabled = false;
    startBtn.textContent = "Restart camera";
  } catch (err) {
    stopCamera();
    camera.srcObject = null;
    captureBtn.disabled = true;
    startBtn.textContent = "Start camera";
    output.textContent = JSON.stringify(
      {
        error: `Camera unavailable: ${err.message}`,
        name: err.name,
        hint:
          err.name === "NotReadableError"
            ? "Another tab or app is using the camera. Close it, then press Start camera."
            : undefined,
      },
      null,
      2,
    );
  } finally {
    startBtn.disabled = false;
  }
}

function stopCamera() {
  if (!stream) return;
  for (const track of stream.getTracks()) track.stop();
  stream = null;
}

async function capture() {
  if (!stream) return;
  captureBtn.disabled = true;
  output.textContent = "";

  try {
    await send(await toJpeg(camera), "capture.jpg");
  } catch (err) {
    output.textContent = JSON.stringify({ error: err.message }, null, 2);
  } finally {
    captureBtn.disabled = !stream;
  }
}

async function upload() {
  const [file] = fileInput.files;
  fileInput.value = ""; // so re-picking the same file scans again
  if (!file) return;

  uploadBtn.disabled = true;
  output.textContent = "";

  try {
    await send(await prepareUpload(file), file.name);
  } catch (err) {
    output.textContent = JSON.stringify({ error: err.message }, null, 2);
  } finally {
    uploadBtn.disabled = false;
  }
}

async function send(blob, name) {
  const body = new FormData();
  body.append("file", blob, name);
  const response = await fetch("/ocr/", { method: "POST", body });
  const text = await response.text();

  try {
    output.textContent = JSON.stringify(JSON.parse(text), null, 2);
  } catch {
    output.textContent = JSON.stringify({ status: response.status, body: text }, null, 2);
  }
}

// Downscale oversized photos; the server rejects uploads over 5 MB.
async function prepareUpload(file) {
  const bitmap = await createImageBitmap(file);
  const { width, height } = bitmap;
  if (Math.max(width, height) <= MAX_DIMENSION) {
    bitmap.close();
    return file;
  }

  const scale = MAX_DIMENSION / Math.max(width, height);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);
  canvas.getContext("2d").drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return toJpeg(canvas);
}

function toJpeg(source) {
  const canvas = document.createElement("canvas");
  canvas.width = source.videoWidth ?? source.width;
  canvas.height = source.videoHeight ?? source.height;
  canvas.getContext("2d").drawImage(source, 0, 0);
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("could not encode the image"))),
      "image/jpeg",
      0.92,
    );
  });
}
