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