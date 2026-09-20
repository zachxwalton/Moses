from fastapi import FastAPI

app = FastAPI(
    title="Moses API",
    description="Backend API for Moses receipt splitting",
    version="0.1.0",
)


@app.get("/")
def root():
    return {"message": "Moses API is running"}


@app.get("/health")
def health():
    return {"status": "healthy"}