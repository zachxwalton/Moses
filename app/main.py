from pathlib import Path
from dotenv import load_dotenv
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from starlette.concurrency import run_in_threadpool
from app.scanner import EngineNotConfigured, scan

load_dotenv()

STATIC_DIR = Path(__file__).parent / "static"
MAX_IMAGE_BYTES = 5 * 1024 * 1024

app = FastAPI(
    title="Receipt Scanner",
    description="Read a receipt from a webcam frame using the receipt-ocr LLM pipeline",
    version="2.0.0",
)
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")


@app.middleware("http")
async def disable_caching(request, call_next):
    response = await call_next(request)
    response.headers["Cache-Control"] = "no-store"
    return response


@app.get("/", include_in_schema=False)
async def index() -> FileResponse:
    return FileResponse(STATIC_DIR / "index.html")


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok", "service": "receipt-scanner"}


@app.post("/ocr/")
async def ocr_receipt(file: UploadFile = File(...)) -> dict[str, object]:
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Uploaded file is not an image.")

    data = await file.read()
    if not data:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")
    if len(data) > MAX_IMAGE_BYTES:
        raise HTTPException(status_code=413, detail="Image exceeds the 5 MB limit.")

    try:
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
