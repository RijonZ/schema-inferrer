# 🧬 Schema Inferrer

Upload a messy CSV/JSON → instantly get a **clean schema** (data types, nullability, primary key candidates) plus a ready-to-run **CREATE TABLE SQL** statement.

![stack](https://img.shields.io/badge/frontend-React%20%2B%20Vite-7c5cff)
![stack](https://img.shields.io/badge/backend-Node.js%20%2B%20Express-22d3ee)
![bonus](https://img.shields.io/badge/bonus-OpenAI%20powered-10b981)

## How it works

1. **Upload** — drag & drop or pick a `.csv`/`.json` file.
2. **Inference** — the backend scans every column and determines:
   - the narrowest type that covers all observed values (`INTEGER`, `FLOAT`, `BOOLEAN`, `DATE`, `STRING`)
   - whether the column is `nullable` (contains blanks / `N/A` / `null`)
   - whether the column has **mixed types** (e.g. `"29"`, `"thirty-one"` → flagged + coerced to `STRING`)
   - the best **PRIMARY KEY** candidate (unique + non-null + name like `id`/`*_id`)
3. **DDL** — generates a valid `CREATE TABLE` SQL statement from the inferred schema.
4. **Bonus — AI Insights** — with one click, sends *only column-level statistics* (never raw data) to OpenAI and gets back: extra anomalies, normalization suggestions (1NF–3NF), and better column naming.

## Stack

- **Frontend:** React 18 + Vite + Tailwind CSS
- **Backend:** Node.js + Express + Multer (uploads) + OpenAI SDK
- **No database** — everything is computed on the fly, nothing is persisted to disk

## Setup

```bash
# Backend
cd backend
cp .env.example .env   # set OPENAI_API_KEY (optional, only needed for the AI bonus)
npm install
npm run dev             # http://localhost:4000

# Frontend (in a separate terminal)
cd frontend
npm install
npm run dev              # http://localhost:5173
```

Open [http://localhost:5173](http://localhost:5173), upload `sample-data/messy_customers.csv` (a demo file with intentional data issues) and see the result.

> Without `OPENAI_API_KEY`, the app still works fully — the "Analyze with AI" button is simply disabled.

## Project structure

```
backend/
  src/
    parse.js         # CSV/JSON -> uniform rows
    inference.js      # type detection, nullable, mixed-types, PK candidate
    ddl.js             # generates CREATE TABLE
    llm.js             # OpenAI: anomalies + normalization + naming
    server.js          # Express routes
frontend/
  src/
    components/        # UploadZone, SchemaTable, SqlBlock, InsightsPanel
    App.jsx
sample-data/
  messy_customers.csv
```

## API

| Endpoint | Description |
|---|---|
| `POST /api/infer` | multipart `file` → `{ schema, ddl, tableName }` |
| `POST /api/analyze` | `{ tableName, schema }` → AI-generated anomalies & suggestions |
