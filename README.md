# 🌸 Milan — मिलन | Nepali Dating App

A full-stack dating app built for Nepal — no swiping, just thoughtful connection requests and real friendship.

---

## ⚡ Quick Start (Local)

### Prerequisites
- Node.js 18+
- PostgreSQL 14+ installed and running

### 1. Create the Database

Open **pgAdmin** or **psql** and run:
```sql
CREATE DATABASE milan_db;
```

Or in terminal (if psql is in your PATH):
```bash
psql -U postgres -c "CREATE DATABASE milan_db;"
```

### 2. Backend Setup

```bash
cd backend
copy .env.example .env        # Windows
# cp .env.example .env        # Mac/Linux
```

Edit `.env` — only change the password:
```
DATABASE_URL=postgresql://postgres:YOUR_POSTGRES_PASSWORD@localhost:5432/milan_db
JWT_SECRET=milan_secret_key_change_me
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

```bash
npm install
npm run dev
# ✅ Runs on http://localhost:5000
# ✅ Auto-creates all tables on first run
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
# ✅ Runs on http://localhost:5173
```

---

## 🔌 API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/auth/register | ❌ | Register |
| POST | /api/auth/login | ❌ | Login |
| GET | /api/profile/me | ✅ | Get my profile |
| PUT | /api/profile/me | ✅ | Update profile |
| POST | /api/profile/me/photo | ✅ | Upload photo |
| GET | /api/browse | ✅ | Discover profiles |
| POST | /api/connections/request/:id | ✅ | Send request |
| PUT | /api/connections/request/:id | ✅ | Accept/Reject |
| GET | /api/connections/incoming | ✅ | Incoming requests |
| GET | /api/connections/outgoing | ✅ | Sent requests |
| GET | /api/connections/matches | ✅ | Accepted matches |
| DELETE | /api/connections/request/:id | ✅ | Cancel request |
| GET | /api/messages/:userId | ✅ | Get conversation |
| POST | /api/messages/:userId | ✅ | Send message |

---

## 🛠 Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, Vite, React Router v6 |
| Backend | Node.js, Express.js |
| Database | PostgreSQL (pg driver) |
| Auth | JWT + bcryptjs |
| Upload | Multer |
| Deploy | Railway |

---

Made with ❤️ for Nepal 🇳🇵
