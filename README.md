# Lab Tracker — Setup Guide

## Project Structure
```
lab-tracker/
├── client/     → React frontend (Vite)
└── server/     → Node.js + Express backend
```

---

## 1. Backend Setup

```bash
cd server
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
node index.js
```

### Create Teacher Account (run once)
After the server is running, use any REST client (Postman, Thunder Client, or curl):

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"teacher","password":"yourpassword"}'
```

> After this, the /register endpoint is still open — you can comment it out in routes/auth.js once the account is created.

---

## 2. Frontend Setup

```bash
cd client
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

---

## 3. MongoDB Atlas (Free Cloud Database)

1. Go to https://cloud.mongodb.com
2. Create a free cluster
3. Create a database user
4. Get the connection string
5. Paste it into server/.env as MONGO_URI

---

## How It Works

1. Teacher logs in with username + password
2. Selects Sem (auto = 6), Section, Batch, Subject
3. Subject Code auto-fills based on subject
4. Experiment list loads (or resumes from last saved state)
5. Teacher edits Date, Time, Remark, toggles Completed per row
6. Clicks "Save Changes" → saved to MongoDB
7. Clicks "Download PDF" → exports full record as PDF

---

## Subjects & Experiments

To add more subjects, edit `client/src/data/experiments.js`:
- Add to the `SUBJECTS` array
- Add experiments under `EXPERIMENTS` keyed by subject code

---

## Tech Stack
- Frontend: React 18 + Vite + CSS Variables
- Backend: Node.js + Express
- Database: MongoDB + Mongoose
- Auth: JWT + bcrypt
- PDF: jsPDF + jsPDF-AutoTable
