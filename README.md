# SkillBridge — Peer Skill Swap Platform

A full-stack web app where students trade skill sessions.
Built with: React.js + Vite + Tailwind (frontend) | Node.js + Express + MongoDB + Socket.io (backend)

---

## Folder Structure

```
skillbridge/
├── backend/
│   ├── src/
│   │   ├── index.js              ← Server entry point
│   │   ├── models/               ← MongoDB schemas
│   │   │   ├── User.js
│   │   │   ├── Session.js
│   │   │   └── Rating.js
│   │   ├── routes/               ← API endpoints
│   │   │   ├── auth.js
│   │   │   ├── users.js
│   │   │   ├── matches.js
│   │   │   ├── sessions.js
│   │   │   └── ratings.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   └── matchController.js
│   │   ├── middleware/
│   │   │   └── auth.js           ← JWT middleware
│   │   └── utils/
│   │       └── socketHandler.js  ← Socket.io events + WebRTC signalling
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── main.jsx
    │   ├── App.jsx               ← Router + providers
    │   ├── api/axios.js          ← Axios instance with JWT
    │   ├── context/
    │   │   ├── AuthContext.jsx   ← Login/logout state
    │   │   └── SocketContext.jsx ← Socket.io connection
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── Matches.jsx       ← Smart matching page
    │   │   ├── Sessions.jsx      ← Session management
    │   │   ├── Profile.jsx       ← Skills editor
    │   │   └── VideoRoom.jsx     ← WebRTC video call
    │   └── components/
    │       ├── Navbar.jsx
    │       ├── SessionRequestModal.jsx
    │       └── RatingModal.jsx
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    └── package.json
```

---

## Setup Instructions (Windows)

### Step 1 — MongoDB Atlas (free cloud database)
1. Go to https://mongodb.com/atlas and create a free account
2. Create a free cluster (M0 Sandbox)
3. Under "Database Access" → add a user with password
4. Under "Network Access" → add IP: 0.0.0.0/0 (allow all)
5. Click "Connect" → "Connect your application" → copy the URI

### Step 2 — Backend setup
```bash
cd skillbridge/backend
copy .env.example .env
```
Open `.env` and paste your MongoDB URI, then:
```bash
npm install
npm run dev
```
Backend runs at: http://localhost:5000

### Step 3 — Frontend setup
Open a NEW terminal window:
```bash
cd skillbridge/frontend
npm install
npm run dev
```
Frontend runs at: http://localhost:5173

---

## API Routes

| Method | Endpoint                  | Description               |
|--------|---------------------------|---------------------------|
| POST   | /api/auth/register        | Register new user         |
| POST   | /api/auth/login           | Login + get JWT           |
| GET    | /api/auth/me              | Get logged-in user        |
| GET    | /api/users/profile        | Get my profile            |
| PUT    | /api/users/profile        | Update profile + skills   |
| GET    | /api/matches              | Get scored matches        |
| POST   | /api/sessions             | Create session request    |
| GET    | /api/sessions/my          | Get my sessions           |
| PATCH  | /api/sessions/:id/status  | Accept/reject/complete    |
| POST   | /api/ratings              | Submit a rating           |

---

## How the Matching Algorithm Works

Score = (skills I can teach them + skills they can teach me) / total skill gaps × 100

Example:
- I know: React, Node.js
- I want: DSA, Python
- They know: DSA, Java
- They want: React, MongoDB

iTeachThem  = [React] → 1
theyTeachMe = [DSA]   → 1
total       = 4 (2 wants each)
Score       = (1+1)/4 × 100 = 50%

---

## WebRTC Flow
1. User A clicks "Join Room" → gets camera/mic access → creates a SimplePeer offer
2. Offer sent to backend via Socket.io → forwarded to User B
3. User B answers → answer sent back → peer connection established
4. Direct P2P video stream between browsers (no relay needed)

---

## Deployment (free)
- Backend  → Railway.app or Render.com
- Frontend → Vercel.com (connect your GitHub repo)
- Database → MongoDB Atlas (already cloud-hosted)
