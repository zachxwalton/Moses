# cheap-shop
Split the bill, convert it into USD, and send the payment requests to your friends.

in the root directory, run:
```bash
uv sync
cp .env.example .env     # then put your OPENAI_API_KEY in it
uv run python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

Open <http://127.0.0.1:8000>. Press **Start camera** and allow camera access,
then press **Capture** — or press **Upload image** to scan a photo. The page
shows the raw JSON response. Camera captures run at the camera's maximum
resolution and the full frame is sent.

- Any OpenAI-compatible provider works. `OPENAI_API_KEY` is required; set `OPENAI_BASE_URL` and `OPENAI_MODEL` as needed.
