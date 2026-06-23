# Pipeline — Mini CRM Opportunity Tracker

A full-stack MERN web application for managing a shared sales opportunity pipeline. Built with secure JWT authentication, ownership-based authorization, and a refined editorial design system.

## Overview

Pipeline lets sales teams track leads, follow-ups, and deal stages in a shared workspace. Each team member can view the full pipeline but can only edit or delete their own opportunities. Security is enforced on the backend — the frontend only hides controls as a UX convenience.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + Vite |
| Backend | Node.js + Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcryptjs |
| Styling | CSS Modules + CSS Variables (Serif design system) |
| HTTP Client | Axios |

## Features

- **Secure auth** — JWT tokens (2h expiry), bcrypt password hashing
- **Shared pipeline** — all authenticated users view all opportunities
- **Ownership control** — only creators can edit/delete their own records
- **Backend authorization** — ownership validated server-side, not just in UI
- **Filters & sorting** — filter by stage/priority, sort by value/date/priority
- **Summary stats** — pipeline value, won value, high-priority count, my count
- **Responsive design** — works on desktop and mobile
- **Overdue detection** — follow-up dates past due are highlighted in red

## Project Structure

```
crm-app/
├── backend/
│   ├── src/
│   │   ├── config/db.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   └── opportunityController.js
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js
│   │   │   └── errorMiddleware.js
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   └── Opportunity.js
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   └── opportunityRoutes.js
│   │   └── server.js
│   ├── package.json
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   ├── OpportunityCard.jsx
    │   │   ├── OpportunityForm.jsx
    │   │   └── DeleteConfirm.jsx
    │   ├── context/AuthContext.jsx
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   └── Dashboard.jsx
    │   ├── services/api.js
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── package.json
    ├── vite.config.js
    └── .env.example
```

## Setup & Installation

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)

### Backend Setup

```bash
cd backend
npm install

# Copy and fill in environment variables
cp .env.example .env
```

Edit `backend/.env`:
```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/mini-crm?retryWrites=true&w=majority
JWT_SECRET=your_long_random_secret_here
JWT_EXPIRES_IN=2h
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

```bash
npm run dev    # development (nodemon)
npm start      # production
```

### Frontend Setup

```bash
cd frontend
npm install

# Copy and fill in environment variables
cp .env.example .env
```

Edit `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

```bash
npm run dev    # development
npm run build  # production build
```

The Vite dev server proxies `/api` requests to `http://localhost:5000` automatically.

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | Server port (default: 5000) |
| `MONGO_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | Long random string for signing JWTs |
| `JWT_EXPIRES_IN` | No | Token expiry (default: 2h) |
| `NODE_ENV` | No | `development` or `production` |
| `FRONTEND_URL` | Yes | Allowed CORS origin |

### Frontend (`frontend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | No | Backend API URL (default: `/api` via proxy) |

## API Reference

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | Public | Register new user |
| POST | `/api/auth/login` | Public | Login, returns JWT |
| GET | `/api/auth/me` | Bearer | Get current user profile |

**Register body:** `{ name, email, password }`  
**Login body:** `{ email, password }`  
**Token header:** `Authorization: Bearer <token>`

### Opportunities

| Method | Endpoint | Auth | Access Rule |
|--------|----------|------|-------------|
| GET | `/api/opportunities` | Bearer | All authenticated users |
| POST | `/api/opportunities` | Bearer | All authenticated users |
| GET | `/api/opportunities/:id` | Bearer | All authenticated users |
| PUT | `/api/opportunities/:id` | Bearer | Owner only |
| DELETE | `/api/opportunities/:id` | Bearer | Owner only |

**GET query params:** `stage`, `priority`, `sort` (`newest`, `value_desc`, `value_asc`, `priority`, `followup`)

**Create/Update body:**
```json
{
  "customerName": "Acme Corp",
  "contactName": "John Smith",
  "contactEmail": "john@acme.com",
  "contactPhone": "+91 98765 43210",
  "requirement": "Need a CRM solution for 50 users",
  "estimatedValue": 500000,
  "stage": "Qualified",
  "priority": "High",
  "nextFollowUpDate": "2026-07-15",
  "notes": "Decision maker is the VP of Sales"
}
```

> **Note:** `owner` / `user_id` are never accepted from the request body. Owner is always derived from the JWT token on the backend.

### Response format

All responses follow:
```json
{
  "success": true | false,
  "message": "...",
  "data": { ... }  // or "token" for auth
}
```

## Deployment

### Frontend — Vercel / Netlify

```bash
cd frontend
npm run build
# Deploy the dist/ folder
```

Set environment variable:
- `VITE_API_URL` = `https://your-backend.render.com/api`

### Backend — Render / Railway

1. Connect your GitHub repo
2. Set root directory to `backend`
3. Build command: `npm install`
4. Start command: `npm start`
5. Set all environment variables from `.env.example`

### Database — MongoDB Atlas

1. Create a free cluster at mongodb.com/atlas
2. Create a database user
3. Whitelist `0.0.0.0/0` (or your server's IP)
4. Copy the connection string into `MONGO_URI`

## Security Notes

- Passwords stored with bcrypt (salt rounds: 12)
- JWTs expire in 2 hours
- Ownership validated server-side before every update/delete
- `user_id` never accepted from request body
- Secrets stored in environment variables only
- CORS restricted to configured frontend URL

## Known Limitations / Future Improvements

- No pagination (filtering mitigates this at small scale)
- No email verification on registration
- No password reset flow
- No kanban board view (list/card grid only)
- No activity/follow-up history log per opportunity
- No unit/integration tests included
- No Docker setup
