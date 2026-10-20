# Moses

Moses is a receipt-splitting application that scans receipts, extracts individual items, lets users assign items to people, converts currencies, and calculates how much each person owes.

## MVP Features

- User login
- Receipt upload
- Receipt scanning with OCR
- Review and correct scanned items
- Add people to a split
- Assign receipt items to individual people
- Split shared items between multiple people
- Convert GBP amounts to USD
- Display a final breakdown of what each person owes
- Share the final breakdown

## Run locally

Copy `.env.example` to `.env` at the repo root and set `OPENAI_API_KEY`.

From the repo root, start both services with one command:

```bash
./dev
```

It runs the backend on port 8000 and the frontend on port 3000. `Ctrl+C`
stops the services it started; an already-running backend on port 8000 is
reused. To run them separately instead:

Backend:

```bash
cd backend
uv sync
uv run uvicorn app.main:app --host 127.0.0.1 --port 8000
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Open <http://localhost:3000>. The page offers **Start camera**, **Capture** and
**Upload image**; results are shown as raw JSON. `POST /ocr/` accepts an image
and returns `{"receipt": {...}, "model": "..."}`.

`receipt-ocr` is an editable path dependency (`../../../receipt-ocr`), so engine
changes take effect without reinstalling.

The frontend calls `http://127.0.0.1:8000` by default. To use another backend,
set `NEXT_PUBLIC_API_URL` in `frontend/.env.local`.

## Tech Stack

### Frontend

- Next.js
- TypeScript
- Tailwind CSS

### Backend

- Python
- FastAPI
- uv

### Planned Services

- Supabase for authentication and database
- receipt-ocr for receipt scanning and item extraction
- Currency conversion API for GBP to USD conversion

## Team

- Imran — Frontend
- Zach — Backend
- Niyoo — Fullstack / Integration

## Project Structure

```text
Moses/
├── frontend/
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── ...
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── routes/
│   │   └── services/
│   ├── tests/
│   ├── pyproject.toml
│   └── uv.lock
│
├── .env.example
├── .gitignore
└── README.md