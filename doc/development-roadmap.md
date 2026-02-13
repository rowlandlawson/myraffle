# RaffleHub — Development Roadmap & Step-by-Step Guide

> **Reference:** [myraffle.md](file:///c:/Users/Administrator/Documents/ROWLAND/raffle-project/doc/myraffle.md)  
> **Last Updated:** February 10, 2026

---

## Roadmap Overview

```mermaid
gantt
    title RaffleHub Development Roadmap
    dateFormat  YYYY-MM-DD
    axisFormat  %b %d

    section Phase 1-4 (DONE)
    Landing Page + Auth UI         :done, p1, 2025-01-01, 30d
    User Dashboard + Wallet UI     :done, p2, after p1, 30d
    Items Browsing + Earnings UI   :done, p3, after p2, 30d
    Admin Dashboard UI             :done, p4, after p3, 30d

    section Phase 5 - Backend
    5A: Project Setup & DB         :active, p5a, 2026-02-11, 3d
    5B: Auth & User System         :p5b, after p5a, 5d
    5C: Wallet & Payments          :p5c, after p5b, 5d
    5D: Items & Raffles            :p5d, after p5c, 5d
    5E: Tasks & Earnings           :p5e, after p5d, 4d
    5F: Admin & Email              :p5f, after p5e, 4d

    section Phase 6 - Integration
    6A: Frontend-Backend Wiring    :p6a, after p5f, 7d
    6B: Testing                    :p6b, after p6a, 5d
    6C: Deployment                 :p6c, after p6b, 3d
    6D: Monitoring & Launch        :p6d, after p6c, 2d
```

---

## Phase 5 — Backend Development

> **Goal:** Build the complete Express.js + Prisma + PostgreSQL backend from scratch.  
> **Location:** `raffle-backend/`  
> **Estimated Duration:** 4-6 weeks

---

### Phase 5A: Project Setup & Database (Days 1-3)

> [!IMPORTANT]
> This is the foundation. Everything else depends on getting the database schema and project configuration right.

#### Step 1 — Initialize the Backend Project

1. Navigate to `raffle-backend/`
2. Run `pnpm init` (or `bun init`)
3. Install core dependencies:
   ```bash
   pnpm add express cors dotenv @prisma/client jsonwebtoken bcryptjs multer
   pnpm add -D typescript @types/express @types/cors @types/node @types/jsonwebtoken @types/bcryptjs @types/multer ts-node-dev prisma
   ```
4. Create `tsconfig.json`:
   ```json
   {
     "compilerOptions": {
       "target": "ES2020",
       "module": "commonjs",
       "lib": ["ES2020"],
       "outDir": "./dist",
       "rootDir": "./src",
       "strict": true,
       "esModuleInterop": true,
       "skipLibCheck": true,
       "resolveJsonModule": true
     },
     "include": ["src/**/*"],
     "exclude": ["node_modules", "dist"]
   }
   ```
5. Add scripts to `package.json`:
   ```json
   {
     "scripts": {
       "dev": "ts-node-dev --respawn src/server.ts",
       "build": "tsc",
       "start": "node dist/server.js",
       "prisma:generate": "prisma generate",
       "prisma:migrate": "prisma migrate dev",
       "prisma:studio": "prisma studio"
     }
   }
   ```

#### Step 2 — Set Up Neon PostgreSQL Database

1. Go to [neon.tech](https://neon.tech) and create a project
2. Copy the connection string
3. Create `.env` and `.env.example`:
   ```env
   DATABASE_URL="postgresql://user:pass@host/dbname?sslmode=require"
   JWT_SECRET="your-secret-key"
   JWT_REFRESH_SECRET="your-refresh-secret"
   PORT=5000
   FRONTEND_URL="http://localhost:3000"
   PAYSTACK_SECRET_KEY=""
   PAYSTACK_PUBLIC_KEY=""
   BREVO_API_KEY=""
   BREVO_SENDER_EMAIL=""
   ```

#### Step 3 — Create Prisma Schema

1. Run `npx prisma init`
2. Define the database schema in `prisma/schema.prisma` with these models:

| Model | Key Fields |
|-------|-----------|
| `User` | id, userNumber, email, password, name, phone, walletBalance, rafflePoints, role, status |
| `Item` | id, name, description, imageUrl, value, category, status |
| `Raffle` | id, itemId, ticketPrice, ticketsTotal, ticketsSold, raffleDate, winnerUserId, status |
| `Ticket` | id, userId, raffleId, ticketNumber, status |
| `Transaction` | id, userId, type, amount, status, reference |
| `Withdrawal` | id, userId, amount, bankCode, accountNumber, status |
| `Task` | id, type, title, description, points, status |
| `UserTask` | id, userId, taskId, completedAt, status |

3. Run migration: `npx prisma migrate dev --name init`
4. Generate Prisma client: `npx prisma generate`

#### Step 4 — Create the Express Server Entry Point

Create `src/server.ts`:
- Import Express, CORS, dotenv
- Configure middleware (JSON parsing, CORS for `http://localhost:3000`)
- Health check route: `GET /api/health`
- Mount all route modules
- Global error handler
- Start server on `PORT` (default 5000)

#### Step 5 — Create Core Config Files

| File | Purpose |
|------|---------|
| `src/config/database.ts` | Prisma client singleton |
| `src/config/environment.ts` | Validate all env vars exist |
| `src/config/constants.ts` | Point values, commission rates, etc. |

**✅ Checkpoint:** Server starts, connects to database, health endpoint works.

---

### Phase 5B: Authentication & User System (Days 4-8)

#### Step 6 — JWT Service

Create `src/services/jwt.ts`:
- `generateAccessToken(userId)` → 24h expiry
- `generateRefreshToken(userId)` → 7d expiry
- `verifyAccessToken(token)` → decoded payload
- `verifyRefreshToken(token)` → decoded payload

#### Step 7 — Auth Middleware

Create `src/middleware/auth.ts`:
- Extract Bearer token from `Authorization` header
- Verify JWT, attach `req.user = { id, role }`
- `requireAuth` — reject if no valid token
- `requireAdmin` — reject if role ≠ admin

#### Step 8 — Auth Controller & Routes

Create `src/controllers/authController.ts` and `src/routes/auth.ts`:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/register` | POST | Create user, hash password, generate userNumber, send welcome email |
| `/api/auth/login` | POST | Validate credentials, return access + refresh tokens |
| `/api/auth/refresh-token` | POST | Issue new access token from refresh token |
| `/api/auth/logout` | POST | Invalidate refresh token |
| `/api/auth/forgot-password` | POST | Send password reset email |
| `/api/auth/reset-password` | POST | Reset password with token |
| `/api/auth/me` | GET | Return current user profile (protected) |

#### Step 9 — User Controller & Routes

Create `src/controllers/userController.ts` and `src/routes/users.ts`:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/users/profile` | GET | Get own profile |
| `/api/users/profile` | PUT | Update own profile |
| `/api/users/statistics` | GET | Get user stats (tickets, wins, balance) |
| `/api/users/suspend` | PUT | Admin: suspend a user |
| `/api/users/activate` | PUT | Admin: activate a user |

#### Step 10 — Input Validation Middleware

Create `src/middleware/validation.ts`:
- Use Zod for request body validation
- Create validator middleware factory: `validate(schema)`
- Define schemas for register, login, profile update

**✅ Checkpoint:** Can register, login, get profile, and refresh tokens via Postman/Thunder Client.

---

### Phase 5C: Wallet & Payment System (Days 9-13)

#### Step 11 — Paystack Service

Create `src/services/paystack.ts`:
- `initializePayment(email, amount)` → Paystack checkout URL
- `verifyPayment(reference)` → payment status
- `createTransferRecipient(name, accountNumber, bankCode)` → recipient code
- `initiateTransfer(amount, recipientCode)` → transfer reference
- `listBanks()` → list of Nigerian banks

#### Step 12 — Wallet Controller & Routes

Create `src/controllers/walletController.ts` and `src/routes/wallet.ts`:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/wallet/balance` | GET | Get wallet balance + raffle points |
| `/api/wallet/deposit` | POST | Initialize Paystack deposit |
| `/api/wallet/withdraw` | POST | Request withdrawal (pending approval) |
| `/api/wallet/transactions` | GET | Get transaction history (paginated) |

#### Step 13 — Payment Controller & Routes

Create `src/controllers/paymentController.ts` and `src/routes/payments.ts`:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/payments/initialize` | POST | Start Paystack payment |
| `/api/payments/verify` | POST | Verify completed payment |
| `/api/payments/webhook` | POST | Paystack webhook (auto-credit wallet) |
| `/api/payments/history` | GET | Payment history |

#### Step 14 — Transaction Logging

Create `src/utils/transactions.ts`:
- `logTransaction(userId, type, amount, status, reference)` → create transaction record
- Types: `deposit`, `withdrawal`, `ticket_purchase`, `task_reward`, `raffle_win`

**✅ Checkpoint:** Can deposit via Paystack, see balance update, request withdrawal.

---

### Phase 5D: Items & Raffle Engine (Days 14-18)

#### Step 15 — File Upload Setup

Configure Multer in `src/middleware/upload.ts`:
- Accept image files (jpg, png, webp)
- Max size: 5MB
- Store to local `uploads/` or cloud storage (Cloudinary/S3 later)

#### Step 16 — Item Controller & Routes

Create `src/controllers/itemController.ts` and `src/routes/items.ts`:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/items` | GET | Get all items (with filters, pagination) |
| `/api/items/:id` | GET | Get item details |
| `/api/items` | POST | Admin: create item with image upload |
| `/api/items/:id` | PUT | Admin: update item |
| `/api/items/:id` | DELETE | Admin: delete item |

#### Step 17 — Raffle Engine Service

Create `src/services/raffle.ts` — **the core business logic**:
- `createRaffle(itemId, ticketPrice, ticketsTotal, raffleDate)` → new raffle
- `runRaffle(raffleId)` → randomly select winner from ticket holders
- `scheduleRaffle(raffleId, date)` → set up auto-trigger
- Algorithm: cryptographically random selection using `crypto.randomInt()`

#### Step 18 — Raffle Controller & Routes

Create `src/controllers/raffleController.ts` and `src/routes/raffles.ts`:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/raffles` | GET | Get all raffles |
| `/api/raffles/:id` | GET | Get raffle details |
| `/api/raffles` | POST | Admin: create raffle |
| `/api/raffles/:id` | PUT | Admin: update raffle |
| `/api/raffles/:id/start` | POST | Admin: trigger raffle draw |
| `/api/raffles/:id/winners` | GET | Get raffle winner |

#### Step 19 — Ticket Controller & Routes

Create `src/controllers/ticketController.ts` and `src/routes/tickets.ts`:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/tickets` | GET | Get user's tickets |
| `/api/tickets/:id` | GET | Get ticket details |
| `/api/tickets` | POST | Buy ticket (deduct wallet/points, enforce 1-per-user-per-item) |
| `/api/tickets/history` | GET | Full ticket history |

**✅ Checkpoint:** Can create items, create raffles, buy tickets, run raffle, and see winners.

---

### Phase 5E: Tasks & Earnings System (Days 19-22)

#### Step 20 — Task Controller & Routes

Create `src/controllers/taskController.ts` and `src/routes/tasks.ts`:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/tasks` | GET | Get available tasks |
| `/api/tasks/:id` | GET | Get task details |
| `/api/tasks/:id/complete` | POST | Mark task complete, award points |
| `/api/tasks/completed` | GET | Get user's completed tasks |

#### Step 21 — Point System Logic

In the task controller:
- Each task type awards specific points (per `myraffle.md`):
  - Watch 30s ad → 10 points
  - Watch 60s ad → 20 points
  - Share on WhatsApp → 50 points
  - Invite friend → 500 points
  - Daily login → 25 points
  - Complete survey → 100 points
- Conversion rate: **1,000 points = ₦100**
- Points are **spend-only** (not withdrawable)
- Points can only be used to buy raffle tickets

#### Step 22 — Referral System

- Generate unique referral codes per user
- Track referral signups: `referredBy` field in User model
- Award 500 points when referred user registers
- Referral dashboard data endpoint

**✅ Checkpoint:** Users can complete tasks, earn points, use points to buy tickets.

---

### Phase 5F: Admin System & Email Service (Days 23-26)

#### Step 23 — Admin Controller & Routes

Create `src/controllers/adminController.ts` and `src/routes/admin.ts`:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/admin/dashboard` | GET | Dashboard stats (users, revenue, active raffles) |
| `/api/admin/users` | GET | List all users (paginated, searchable) |
| `/api/admin/transactions` | GET | All transactions (filterable) |
| `/api/admin/analytics` | GET | Analytics (charts data, time-series) |
| `/api/admin/payouts` | POST | Process pending withdrawals |

#### Step 24 — Brevo Email Service

Create `src/services/brevo.ts`:

| Email Type | Trigger |
|------------|---------|
| Welcome Email | User registration |
| Deposit Confirmation | Successful deposit |
| Ticket Purchase Confirmation | Ticket bought |
| Raffle Winner Notification | User wins raffle |
| Withdrawal Request | Withdrawal submitted |
| Withdrawal Approved | Admin approves payout |
| Password Reset | Forgot password request |

#### Step 25 — Error Handling & Logging

Create:
- `src/middleware/errorHandler.ts` — global error handler, structured JSON errors
- `src/utils/logger.ts` — request logging, error logging
- `src/middleware/cors.ts` — CORS configuration

**✅ Checkpoint:** Full admin dashboard data, email notifications working, all error cases handled.

---

## Phase 6 — Frontend Integration, Testing & Deployment

> **Goal:** Connect frontend to backend, test everything, deploy.  
> **Estimated Duration:** 2-3 weeks

---

### Phase 6A: Frontend-Backend Integration (Days 27-33)

#### Step 26 — API Client Setup

In `raffle-app/`, create `src/lib/api.ts`:
- Base URL from `NEXT_PUBLIC_API_URL`
- Fetch wrapper with JWT attached to headers
- Auto-refresh token on 401 response
- Error parsing helper

#### Step 27 — Connect Auth Flow

| Frontend File | Connect To |
|--------------|-----------|
| `LoginForm.tsx` | `POST /api/auth/login` |
| `RegisterForm.tsx` | `POST /api/auth/register` |
| `ForgotPasswordForm.tsx` | `POST /api/auth/forgot-password` |
| `AuthProvider.tsx` | `GET /api/auth/me` + token management |

#### Step 28 — Connect Dashboard

| Frontend File | Connect To |
|--------------|-----------|
| `dashboard/page.tsx` | `GET /api/users/statistics` |
| `wallet/page.tsx` | `GET /api/wallet/balance` + `GET /api/wallet/transactions` |
| `wallet/add-funds/page.tsx` | `POST /api/wallet/deposit` → Paystack redirect |
| `wallet/withdraw/page.tsx` | `POST /api/wallet/withdraw` |
| `tickets/page.tsx` | `GET /api/tickets` |
| `earnings/page.tsx` | `GET /api/tasks` + `POST /api/tasks/:id/complete` |

#### Step 29 — Connect Public Pages

| Frontend File | Connect To |
|--------------|-----------|
| `(public)/items/page.tsx` | `GET /api/items` |
| `(public)/winners/page.tsx` | `GET /api/raffles` (completed, with winners) |

#### Step 30 — Connect Admin Pages

| Frontend File | Connect To |
|--------------|-----------|
| `admin/page.tsx` | `GET /api/admin/dashboard` |
| `admin/items/page.tsx` | `GET /api/items` + `POST /api/items` |
| `admin/users/page.tsx` | `GET /api/admin/users` |
| `admin/raffles/page.tsx` | `GET /api/raffles` + `POST /api/raffles` |
| `admin/transactions/page.tsx` | `GET /api/admin/transactions` |
| `admin/payouts/page.tsx` | `GET /api/admin/payouts` |
| `admin/analytics/page.tsx` | `GET /api/admin/analytics` |

**✅ Checkpoint:** All frontend pages show real data from the backend.

---

### Phase 6B: Testing (Days 34-38)

#### Step 31 — Backend Unit Tests

- Test auth services (JWT generation, password hashing)
- Test raffle algorithm (fairness, randomness)
- Test wallet operations (deposit, withdraw, balance checks)
- Test point calculations

#### Step 32 — API Integration Tests

- Test all API endpoints with valid and invalid data
- Test authentication guards (protected routes)
- Test admin-only routes
- Test Paystack webhook handling

#### Step 33 — Frontend E2E Tests

- Registration → Login → Dashboard flow
- Deposit → Buy Ticket → View Ticket flow
- Admin: Create Item → Create Raffle → Run Raffle flow
- Complete Task → Earn Points → Use Points flow

---

### Phase 6C: Deployment (Days 39-41)

#### Step 34 — Deploy Frontend (Vercel)

1. Connect GitHub repo to Vercel
2. Set root directory to `raffle-app/`
3. Set environment variables:
   - `NEXT_PUBLIC_API_URL` → production backend URL
4. Deploy and verify

#### Step 35 — Deploy Backend (Railway / Render)

1. Create new project on Railway or Render
2. Set root directory to `raffle-backend/`
3. Set all environment variables (`.env` values)
4. Configure the database URL to Neon
5. Run `prisma migrate deploy` on the production database
6. Deploy and verify health endpoint

#### Step 36 — Production Configuration

- Configure production CORS (only allow your Vercel domain)
- Set up Paystack production keys (switch from test mode)
- Configure Brevo production email sender
- Set proper JWT secrets (strong, random)
- Enable HTTPS-only cookies

---

### Phase 6D: Monitoring & Launch (Days 42-43)

#### Step 37 — Monitoring & Observability

- Set up error tracking (e.g., Sentry)
- Configure server health monitoring
- Set up database monitoring on Neon dashboard
- Configure alerts for server errors

#### Step 38 — Launch Checklist

- [ ] All API endpoints working in production
- [ ] Paystack payments processing correctly
- [ ] Email notifications sending
- [ ] Raffle draws executing properly
- [ ] Admin dashboard showing real data
- [ ] Mobile responsiveness verified
- [ ] Security audit complete (no exposed secrets, proper CORS)
- [ ] Database backups configured
- [ ] Load testing passed

---

## Quick Reference: File Mapping

| What To Build | File Path |
|--------------|-----------|
| Express Server | `raffle-backend/src/server.ts` |
| DB Config | `raffle-backend/src/config/database.ts` |
| Env Config | `raffle-backend/src/config/environment.ts` |
| Constants | `raffle-backend/src/config/constants.ts` |
| Auth Routes | `raffle-backend/src/routes/auth.ts` |
| User Routes | `raffle-backend/src/routes/users.ts` |
| Wallet Routes | `raffle-backend/src/routes/wallet.ts` |
| Item Routes | `raffle-backend/src/routes/items.ts` |
| Raffle Routes | `raffle-backend/src/routes/raffles.ts` |
| Ticket Routes | `raffle-backend/src/routes/tickets.ts` |
| Payment Routes | `raffle-backend/src/routes/payments.ts` |
| Task Routes | `raffle-backend/src/routes/tasks.ts` |
| Admin Routes | `raffle-backend/src/routes/admin.ts` |
| Auth Controller | `raffle-backend/src/controllers/authController.ts` |
| User Controller | `raffle-backend/src/controllers/userController.ts` |
| Wallet Controller | `raffle-backend/src/controllers/walletController.ts` |
| Item Controller | `raffle-backend/src/controllers/itemController.ts` |
| Raffle Controller | `raffle-backend/src/controllers/raffleController.ts` |
| Payment Controller | `raffle-backend/src/controllers/paymentController.ts` |
| Admin Controller | `raffle-backend/src/controllers/adminController.ts` |
| Ticket Controller | `raffle-backend/src/controllers/ticketController.ts` |
| Task Controller | `raffle-backend/src/controllers/taskController.ts` |
| JWT Service | `raffle-backend/src/services/jwt.ts` |
| Paystack Service | `raffle-backend/src/services/paystack.ts` |
| Brevo Service | `raffle-backend/src/services/brevo.ts` |
| Raffle Engine | `raffle-backend/src/services/raffle.ts` |
| Auth Middleware | `raffle-backend/src/middleware/auth.ts` |
| Validation | `raffle-backend/src/middleware/validation.ts` |
| Error Handler | `raffle-backend/src/middleware/errorHandler.ts` |
| File Upload | `raffle-backend/src/middleware/upload.ts` |
| CORS Config | `raffle-backend/src/middleware/cors.ts` |
| Prisma Schema | `raffle-backend/prisma/schema.prisma` |
| API Client (FE) | `raffle-app/src/lib/api.ts` |
