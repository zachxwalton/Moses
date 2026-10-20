"""Moses API: receipt extraction through the receipt-ocr LLM pipeline."""

from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from starlette.concurrency import run_in_threadpool

from app.scanner import EngineNotConfigured, scan

# Repo-root .env first, then a backend-local .env if one exists.
load_dotenv(Path(__file__).resolve().parents[2] / ".env")
load_dotenv()

MAX_IMAGE_BYTES = 5 * 1024 * 1024

app = FastAPI(
    title="Moses API",
    description="Backend API for Moses receipt splitting",
    version="0.1.0",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"message": "Moses API is running"}


@app.get("/health")
def health():
    return {"status": "healthy"}


@app.post("/ocr/")
async def ocr_receipt(file: UploadFile = File(...)) -> dict[str, object]:
    """Extract structured receipt data from an uploaded image."""
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Uploaded file is not an image.")

    data = await file.read()
    if not data:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")
    if len(data) > MAX_IMAGE_BYTES:
        raise HTTPException(status_code=413, detail="Image exceeds the 5 MB limit.")

    try:
        # The provider call is blocking network I/O; keep the loop free.
        result = await run_in_threadpool(scan, data)
    except EngineNotConfigured as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=502, detail=f"Receipt extraction failed: {exc}"
        ) from exc

    return {"receipt": result.receipt, "model": result.model}
