 RaffleHub - Complete Platform Documentation

📋 Table of Contents

Project Overview
What is RaffleHub?
Key Features
Technology Stack
Folder Structure
Architecture
User Roles
How It Works
Revenue Model
Database Schema
API Endpoints
Getting Started


📝 Project Overview
RaffleHub is a sophisticated, full-stack raffle and lottery platform built with modern web technologies. It allows users to participate in transparent, fair raffles, win prizes, and earn raffle points through various tasks. The platform also includes a comprehensive admin dashboard for managing raffles, items, users, and transactions.
Location: Nigeria (initially)
Currency: Nigerian Naira (₦)
Status: In Development (Phases 1-4 Frontend Complete, Backend in Progress)

🎯 What is RaffleHub?
Core Concept
RaffleHub is a digital raffle platform where:

Users buy raffle tickets for chance to win valuable items
Users can earn free raffle points by completing tasks (watching ads, referrals, etc.)
Platform ensures transparent and fair raffle selection
Winners are announced in real-time with verification
Users have full wallet management with deposits and withdrawals

Key Differentiators
✅ Fair & Transparent: Provably fair raffle algorithm
✅ Free to Earn: Users can earn points without spending money
✅ Task-Based Earnings: Multiple ways to earn (ads, referrals, surveys)
✅ Mobile-First: Designed for mobile users in Nigeria
✅ Secure: Industry-standard authentication & payment processing
✅ Community-Driven: Real winner verification and leaderboards

🌟 Key Features
For Regular Users
FeatureDescriptionUser AccountsCreate account with email, get unique User NumberWallet SystemDeposit funds, withdraw earnings, track balanceRaffle TicketsBuy tickets for items, limited to 1 ticket per itemEarn PointsWatch ads, share referrals, complete surveys, daily loginFree ParticipationUse earned points to buy tickets without spending moneyTicket HistoryTrack all tickets, see past wins/lossesRaffle Points1,000 points = ₦100 value, not withdrawable, spend-onlyWinners BoardSee recent winners and their prizes
For Admins
FeatureDescriptionItem ManagementUpload items, set prices, manage rafflesRaffle SchedulingSet raffle dates, auto-start optionsUser ManagementView users, suspend accounts, track activityRevenue TrackingMonitor deposits, sales, payoutsAnalyticsReal-time stats, charts, reportsTransaction MonitoringView all transactions, dispute handlingWinner ManagementVerify winners, contact info, audit trailPayout ProcessingProcess withdrawals, manage payouts
For The Platform
FeatureDescriptionAd RevenueEarn from ads users watchCommissionSmall percentage from ticket salesItem SalesRevenue from items sold on raffleFeatured ListingsPremium placement options (future)

🛠 Technology Stack
Frontend (raffle-app/)
Framework:        Next.js 16 (App Router)
Language:         TypeScript
Styling:          Tailwind CSS v4
State Management: Zustand
Form Handling:    React Hook Form
Validation:       Zod
Icons:            Lucide React
HTTP Client:      Fetch API
Backend (raffle-backend/)
Runtime:          Node.js
Framework:        Express.js
Language:         TypeScript
Database ORM:     Prisma
Database:         PostgreSQL (Neon)
Authentication:   JWT + NextAuth compatible
Password Hashing: bcryptjs
File Upload:      Multer
Database
Provider:         Neon (PostgreSQL)
Type:             Relational
ORM:              Prisma
Connection:       PostgreSQL native
Models:           User, Transaction, Ticket, Item, etc.
Payment Processing
Gateway:          Paystack
Currencies:       NGN (Nigerian Naira)
Webhook Support:  Yes
Payment Methods:  Card, Bank Transfer, Mobile Money
Email Service
Provider:         Brevo (formerly Sendinblue)
Use Cases:        Welcome emails, confirmations, notifications
Template Support: Yes
Authentication
Strategy:         JWT (JSON Web Tokens)
Signing:          HS256
Libraries:        jsonwebtoken, bcryptjs
Session Duration: Configurable (default: 24 hours)
Refresh Tokens:   Yes
DevOps & Deployment (Future)
Frontend:         Vercel (recommended for Next.js)
Backend:          Railway, Render, or DigitalOcean
Database:         Neon (serverless PostgreSQL)
Email:            Brevo SMTP
Monitoring:       TBD
Package Manager
Primary:          pnpm (fast, efficient)
Frontend:         pnpm
Backend:          pnpm

📁 Complete Folder Structure
raffle-project/                              # Root project folder
│
├── raffle-app/                             # Frontend (Next.js 16)
│   ├── 📄 package.json                     # Frontend dependencies
│   ├── 📄 tsconfig.json                    # TypeScript config
│   ├── 📄 next.config.ts                   # Next.js config
│   ├── 📄 .env.local                       # Environment variables
│   ├── 📄 README.md
│   │
│   ├── 📁 src/
│   │   ├── 📁 app/
│   │   │   ├── 📄 layout.tsx               # Root layout
│   │   │   ├── 📄 page.tsx                 # Home/landing page
│   │   │   ├── 📄 globals.css              # Global styles
│   │   │   │
│   │   │   ├── 📁 (auth)/                  # Authentication pages
│   │   │   │   ├── 📄 layout.tsx           # Auth layout
│   │   │   │   ├── 📁 login/
│   │   │   │   │   └── 📄 page.tsx        # Login page
│   │   │   │   ├── 📁 register/
│   │   │   │   │   └── 📄 page.tsx        # Register page
│   │   │   │   └── 📁 forgot-password/
│   │   │   │       └── 📄 page.tsx        # Password reset
│   │   │   │
│   │   │   ├── 📁 (public)/                # Public pages
│   │   │   │   ├── 📁 items/
│   │   │   │   │   ├── 📄 page.tsx        # Browse items
│   │   │   │   │   └── 📁 [itemId]/
│   │   │   │   │       └── 📄 page.tsx    # Item detail
│   │   │   │   ├── 📁 winners/
│   │   │   │   │   └── 📄 page.tsx        # Winners leaderboard
│   │   │   │   └── 📁 how-it-works/
│   │   │   │       └── 📄 page.tsx        # Tutorial
│   │   │   │
│   │   │   ├── 📁 dashboard/               # User Dashboard (Protected)
│   │   │   │   ├── 📄 layout.tsx           # Dashboard layout
│   │   │   │   ├── 📄 page.tsx             # Dashboard home
│   │   │   │   ├── 📁 wallet/
│   │   │   │   │   ├── 📄 page.tsx        # Wallet overview
│   │   │   │   │   ├── 📁 add-funds/
│   │   │   │   │   │   └── 📄 page.tsx    # Add funds
│   │   │   │   │   └── 📁 withdraw/
│   │   │   │   │       └── 📄 page.tsx    # Withdraw
│   │   │   │   ├── 📁 tickets/
│   │   │   │   │   └── 📄 page.tsx        # My tickets
│   │   │   │   ├── 📁 earnings/
│   │   │   │   │   └── 📄 page.tsx        # Tasks & earnings
│   │   │   │   └── 📁 settings/
│   │   │   │       └── 📄 page.tsx        # Settings
│   │   │   │
│   │   │   └── 📁 admin/                   # Admin Dashboard
│   │   │       ├── 📄 layout.tsx           # Admin layout
│   │   │       ├── 📄 page.tsx             # Admin home
│   │   │       ├── 📁 items/
│   │   │       │   └── 📄 page.tsx        # Item management
│   │   │       ├── 📁 users/
│   │   │       │   └── 📄 page.tsx        # User management
│   │   │       ├── 📁 raffles/
│   │   │       │   └── 📄 page.tsx        # Raffle management
│   │   │       ├── 📁 transactions/
│   │   │       │   └── 📄 page.tsx        # Transactions
│   │   │       ├── 📁 payouts/
│   │   │       │   └── 📄 page.tsx        # Payouts
│   │   │       ├── 📁 analytics/
│   │   │       │   └── 📄 page.tsx        # Analytics
│   │   │       └── 📁 settings/
│   │   │           └── 📄 page.tsx        # Settings
│   │   │
│   │   ├── 📁 components/                  # React Components
│   │   │   ├── 📁 auth/                   # Auth components
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   ├── RegisterForm.tsx
│   │   │   │   └── ...
│   │   │   ├── 📁 dashboard/              # Dashboard components
│   │   │   │   ├── BalanceCard.tsx
│   │   │   │   ├── WalletCard.tsx
│   │   │   │   └── ...
│   │   │   ├── 📁 admin/                  # Admin components
│   │   │   │   ├── ItemUploadForm.tsx
│   │   │   │   ├── UserManagementTable.tsx
│   │   │   │   └── ...
│   │   │   ├── 📁 navbar/                 # Navigation
│   │   │   │   ├── TopNav.tsx
│   │   │   │   ├── BottomNav.tsx
│   │   │   │   └── HamburgerMenu.tsx
│   │   │   ├── 📁 providers/              # Context/Providers
│   │   │   │   └── AuthProvider.tsx
│   │   │   └── 📁 ui/                     # Reusable UI
│   │   │       ├── Button.tsx
│   │   │       ├── Card.tsx
│   │   │       └── ...
│   │   │
│   │   ├── 📁 lib/                        # Utilities
│   │   │   ├── constants.ts               # App constants
│   │   │   ├── validation.ts              # Zod schemas
│   │   │   └── prisma.ts                  # Prisma client
│   │   │
│   │   └── 📁 types/                      # TypeScript types
│   │       ├── auth.ts
│   │       ├── items.ts
│   │       └── users.ts
│   │
│   ├── 📁 public/                         # Static assets
│   │   ├── favicon.ico
│   │   └── images/
│   │
│   └── 📄 prisma/
│       └── schema.prisma                   # Database schema
│
└── raffle-backend/                         # Backend (Node.js/Express)
    ├── 📄 package.json                     # Backend dependencies
    ├── 📄 tsconfig.json                    # TypeScript config
    ├── 📄 .env                             # Environment variables
    ├── 📄 .env.example                     # Env template
    ├── 📄 README.md
    │
    ├── 📁 src/
    │   ├── 📄 server.ts                    # Express server entry
    │   │
    │   ├── 📁 config/
    │   │   ├── database.ts                 # Prisma setup
    │   │   ├── environment.ts              # Env validation
    │   │   └── constants.ts                # Backend constants
    │   │
    │   ├── 📁 routes/                      # API routes
    │   │   ├── auth.ts                     # Authentication
    │   │   ├── users.ts                    # User management
    │   │   ├── wallet.ts                   # Wallet operations
    │   │   ├── items.ts                    # Item management
    │   │   ├── raffles.ts                  # Raffle management
    │   │   ├── tickets.ts                  # Ticket operations
    │   │   ├── tasks.ts                    # Task/earning management
    │   │   ├── payments.ts                 # Payment processing
    │   │   ├── transactions.ts             # Transaction history
    │   │   └── admin.ts                    # Admin endpoints
    │   │
    │   ├── 📁 controllers/                 # Business logic
    │   │   ├── authController.ts
    │   │   ├── userController.ts
    │   │   ├── walletController.ts
    │   │   ├── itemController.ts
    │   │   ├── raffleController.ts
    │   │   ├── paymentController.ts
    │   │   └── adminController.ts
    │   │
    │   ├── 📁 services/                    # External services
    │   │   ├── paystack.ts                 # Paystack integration
    │   │   ├── brevo.ts                    # Email service
    │   │   ├── raffle.ts                   # Raffle logic
    │   │   └── jwt.ts                      # JWT handling
    │   │
    │   ├── 📁 middleware/                  # Express middleware
    │   │   ├── auth.ts                     # JWT verification
    │   │   ├── errorHandler.ts             # Error handling
    │   │   ├── validation.ts               # Input validation
    │   │   └── cors.ts                     # CORS setup
    │   │
    │   ├── 📁 utils/                       # Utility functions
    │   │   ├── validators.ts               # Input validators
    │   │   ├── formatters.ts               # Data formatters
    │   │   ├── helpers.ts                  # Helper functions
    │   │   └── logger.ts                   # Logging
    │   │
    │   ├── 📁 types/                       # TypeScript types
    │   │   ├── auth.ts
    │   │   ├── user.ts
    │   │   ├── payment.ts
    │   │   └── api.ts
    │   │
    │   └── 📁 prisma/
    │       └── schema.prisma               # Database schema
    │
    └── 📁 dist/                            # Compiled JavaScript (generated)

🏗 Architecture
Frontend Architecture
Next.js App Router
├── Server Components (Layout, Auth checks)
├── Client Components (Interactive UI)
├── API Routes (None - all backend)
└── Static Files (Public assets)
     ↓
   Tailwind CSS + TypeScript
     ↓
   Communicates with Backend API
Backend Architecture
Express.js Server
├── Routes (Handle requests)
│   ├── /api/auth/*
│   ├── /api/users/*
│   ├── /api/wallet/*
│   ├── /api/items/*
│   ├── /api/raffles/*
│   ├── /api/payments/*
│   └── /api/admin/*
│
├── Controllers (Business logic)
├── Services (External integrations)
├── Middleware (Auth, validation, error handling)
└── Database (Prisma + PostgreSQL)
     ↓
   External Services
   ├── Paystack (Payments)
   ├── Brevo (Email)
   └── Neon (Database)
Request Flow
Frontend                          Backend
────────                          ───────

User Action
    ↓
Form Submit
    ↓
Validate Input (Zod)
    ↓
POST /api/endpoint ───────→ Route Handler
with JWT Token                  ↓
                          Auth Middleware
                                ↓
                          Controller
                                ↓
                          Service Layer
                                ↓
                          Database/External
                                ↓
                          Response ←──────
    ↓
Parse Response
    ↓
Update UI
    ↓
User Sees Result

👥 User Roles
1. Anonymous User

Can view landing page
Can browse items
Can see winners leaderboard
Cannot access dashboard
Must register to participate

2. Regular User

Full account access
Wallet management (deposit/withdraw)
Can buy raffle tickets
Can complete earning tasks
Can view own tickets and history
Cannot access admin features

3. Admin User

All user features
Item upload and management
Raffle scheduling and management
User management (suspend/activate)
Transaction monitoring
Payout processing
Analytics and reporting
System settings


🔄 How It Works
User Flow - New User
1. Land on homepage
   ↓
2. Click "Get Started"
   ↓
3. Register with email, phone, password
   Backend: Hash password, create user, send welcome email
   ↓
4. Redirected to dashboard
   ↓
5. Add funds to wallet OR earn points from tasks
   ↓
6. Browse items
   ↓
7. Buy raffle ticket
   Backend: Deduct from balance, create ticket, log transaction
   ↓
8. Wait for raffle date
   ↓
9. Win or lose
   Backend: Run raffle algorithm, select winner, notify user
   ↓
10. If won: Receive prize notification
    If lost: See encouragement, suggest more raffles
Raffle Flow
Admin creates raffle:
  1. Upload item (name, description, image, value)
  2. Set ticket price (e.g., ₦5,000)
  3. Set number of tickets (e.g., 100)
  4. Set raffle date
  5. Item goes live on platform
     ↓
Users can buy tickets:
  6. Browse items
  7. Click "Buy Ticket"
  8. Pay from wallet or use raffle points
  9. Ticket assigned (max 1 per user per item)
     ↓
Raffle date arrives:
  10. Backend triggers raffle algorithm
  11. Randomly selects winner from ticket holders
  12. Sends notification to winner
  13. Sends emails to winner and admin
  14. Winner contacts admin for delivery
Earning Flow
User completes tasks:
  • Watch 30-second ad → 10 points (1,000 naira value)
  • Watch 60-second ad → 20 points (2,000 naira value)
  • Share on WhatsApp → 50 points (5,000 naira value)
  • Invite friend → 500 points (50,000 naira value)
  • Daily login → 25 points (2,500 naira value)
  • Complete survey → 100 points (10,000 naira value)
     ↓
Points accumulate in account
     ↓
User can use points to buy tickets for free
     ↓
Points are NOT withdrawable (spend-only)
     ↓
Platform makes money from ads users watch

💰 Revenue Model
Revenue Streams

Ad Revenue (Primary)

Users watch ads to earn points
Platform paid per ad impression/completion
No cost to user
Passive income stream


Commission on Ticket Sales (Secondary)

10-15% commission on each ticket sold
Example: If ticket price = ₦5,000, platform keeps ₦500-750
Direct revenue


Item Listings (Tertiary - Future)

Premium item placement
Featured listings for higher visibility
Merchants pay for promotion



Profit Breakdown Example
Item: iPhone worth ₦850,000
Ticket Price: ₦5,000
Total Tickets: 100

If all 100 tickets sold:
  Total Revenue: ₦500,000
  ├─ Item Cost (bought by platform): ₦850,000
  ├─ Ad Revenue (from users earning): ~₦50,000
  ├─ Commission (10% of sales): ₦50,000
  └─ Net: Depends on ad revenue + commission

Platform Profit: Ad revenue + Commission = ₦100,000+
Users Value: Chance to win ₦850,000 item for ₦5,000

🗄 Database Schema Overview
Main Tables
users
├── id (PK)
├── userNumber (UNIQUE)
├── email (UNIQUE)
├── password (hashed)
├── name, phone
├── walletBalance
├── rafflePoints
├── role (user/admin)
├── status (active/suspended)
└── timestamps

items
├── id (PK)
├── name, description
├── imageUrl
├── value
├── category
├── status (active/completed)
└── timestamps

raffles
├── id (PK)
├── itemId (FK)
├── ticketPrice
├── ticketsTotal
├── ticketsSold
├── raffleDate
├── winnerUserId (FK)
├── status
└── timestamps

tickets
├── id (PK)
├── userId (FK)
├── raffleId (FK)
├── status (active/won/lost)
├── ticketNumber (UNIQUE)
└── timestamps

transactions
├── id (PK)
├── userId (FK)
├── type (deposit/withdrawal/purchase/reward)
├── amount
├── status (pending/completed/failed)
└── timestamps

withdrawals
├── id (PK)
├── userId (FK)
├── amount
├── bankCode
├── accountNumber
├── status (pending/approved/completed)
└── timestamps

tasks
├── id (PK)
├── type (watch_ad/referral/survey)
├── points
├── status (available/completed)
└── timestamps

userTasks
├── id (PK)
├── userId (FK)
├── taskId (FK)
├── status (available/completed)
└── timestamps

🔌 API Endpoints Overview
Authentication Endpoints
POST   /api/auth/register          Create new account
POST   /api/auth/login             Login
POST   /api/auth/refresh-token     Refresh JWT
POST   /api/auth/logout            Logout
POST   /api/auth/forgot-password   Request password reset
POST   /api/auth/reset-password    Reset password
GET    /api/auth/me                Get current user
User Endpoints
GET    /api/users/profile          Get user profile
PUT    /api/users/profile          Update profile
GET    /api/users/statistics       Get user stats
PUT    /api/users/suspend          Admin: suspend user
PUT    /api/users/activate         Admin: activate user
Wallet Endpoints
GET    /api/wallet/balance         Get wallet info
POST   /api/wallet/deposit         Initiate deposit
POST   /api/wallet/withdraw        Request withdrawal
GET    /api/wallet/transactions    Get transaction history
Item Endpoints
GET    /api/items                  Get all items
GET    /api/items/:id              Get item details
POST   /api/items                  Admin: upload item
PUT    /api/items/:id              Admin: update item
DELETE /api/items/:id              Admin: delete item
Raffle Endpoints
GET    /api/raffles                Get all raffles
GET    /api/raffles/:id            Get raffle details
POST   /api/raffles                Admin: create raffle
PUT    /api/raffles/:id            Admin: update raffle
POST   /api/raffles/:id/start      Admin: start raffle
GET    /api/raffles/:id/winners    Get raffle winners
Ticket Endpoints
GET    /api/tickets                Get user's tickets
GET    /api/tickets/:id            Get ticket details
POST   /api/tickets                Buy ticket
GET    /api/tickets/history        Get ticket history
Payment Endpoints
POST   /api/payments/initialize    Start payment process
POST   /api/payments/verify        Verify payment
POST   /api/payments/webhook       Paystack webhook
GET    /api/payments/history       Payment history
Task Endpoints
GET    /api/tasks                  Get available tasks
GET    /api/tasks/:id              Get task details
POST   /api/tasks/:id/complete     Mark task as complete
GET    /api/tasks/completed        Get completed tasks
Admin Endpoints
GET    /api/admin/dashboard        Dashboard stats
GET    /api/admin/users            List all users
GET    /api/admin/transactions     All transactions
GET    /api/admin/analytics        Analytics data
POST   /api/admin/payouts          Process payouts

🚀 Getting Started
Frontend Setup
bash# Create parent folder
mkdir raffle-project
cd raffle-project

# Move frontend
mv /path/to/raffle-app ./

# Install dependencies
cd raffle-app
pnpm install

# Create .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:5000" > .env.local

# Run development server
pnpm dev
# Visit http://localhost:3000
Backend Setup (Coming Next)
bash# Create backend
mkdir raffle-backend
cd raffle-backend

# Initialize project
pnpm init

# Install dependencies
pnpm add express cors dotenv prisma @prisma/client jsonwebtoken bcryptjs

# Setup environment
cp .env.example .env
# Edit .env with your values

# Setup database
pnpm prisma migrate dev

# Run server
pnpm dev
# Server runs on http://localhost:5000

📊 Technology Comparison
LayerTechnologyWhy ChosenFrontendNext.js 16SSR, built-in routing, great DXStylingTailwind CSSRapid development, mobile-firstStateZustandLightweight, simple, fastValidationZodType-safe, runtime validationBackendExpress.jsLightweight, flexible, popularDatabasePostgreSQLRelational, reliable, scalableORMPrismaType-safe, auto-migrationsAuthJWTStateless, scalablePaymentsPaystackNigerian focus, reliableEmailBrevoReliable, templates, affordableHostingTBDVercel (frontend), Railway/Render (backend)

📈 Project Status
PhaseScopeStatusPhase 1Landing page + Auth UI✅ 100% CompletePhase 2User Dashboard + Wallet✅ 100% CompletePhase 3Items browsing + Earnings✅ 100% CompletePhase 4Admin Dashboard✅ 100% Complete (Frontend)Phase 5Backend Development🚧 In ProgressPhase 6Testing & Deployment⏳ Planned

🎓 Learning Resources

Next.js Documentation
Express.js Guide
Prisma Documentation
TypeScript Handbook
Tailwind CSS Docs
Paystack Integration
Brevo API Docs

