# RaffleHub — Architecture & Technical Reference

> **Reference:** [myraffle.md](file:///c:/Users/Administrator/Documents/ROWLAND/raffle-project/doc/myraffle.md)  
> **Last Updated:** February 10, 2026

---

## System Architecture

```mermaid
graph TB
    subgraph Frontend["Frontend — raffle-app (Next.js 16)"]
        LP[Landing Page]
        AUTH[Auth Pages]
        DASH[User Dashboard]
        ADMIN[Admin Dashboard]
        PUB[Public Pages]
    end

    subgraph Backend["Backend — raffle-backend (Express.js)"]
        API[REST API Routes]
        MW[Middleware Layer]
        CTRL[Controllers]
        SVC[Services]
    end

    subgraph External["External Services"]
        PS[Paystack - Payments]
        BR[Brevo - Email]
        NEON[Neon - PostgreSQL]
    end

    Frontend -->|HTTP + JWT| API
    API --> MW
    MW --> CTRL
    CTRL --> SVC
    SVC --> PS
    SVC --> BR
    SVC --> NEON
```

---

## Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 16 (App Router) | SSR, routing, React framework |
| **Language** | TypeScript | Type safety across entire stack |
| **Styling** | Tailwind CSS v4 | Utility-first CSS |
| **State** | Zustand | Lightweight client-side state |
| **Forms** | React Hook Form + Zod | Form handling + validation |
| **Icons** | Lucide React | Consistent icon library |
| **Backend** | Express.js | REST API server |
| **ORM** | Prisma | Type-safe database access |
| **Database** | PostgreSQL (Neon) | Serverless relational database |
| **Auth** | JWT (HS256) | Stateless authentication |
| **Payments** | Paystack | Nigerian payment processing |
| **Email** | Brevo | Transactional emails |
| **Pkg Manager** | Bun (frontend), pnpm (backend) | Dependency management |

---

## Database Entity Relationships

```mermaid
erDiagram
    User ||--o{ Ticket : purchases
    User ||--o{ Transaction : has
    User ||--o{ Withdrawal : requests
    User ||--o{ UserTask : completes
    Item ||--|| Raffle : "raffled as"
    Raffle ||--o{ Ticket : "has tickets"
    Raffle ||--o| User : "won by"
    Task ||--o{ UserTask : "completed by"

    User {
        string id PK
        string userNumber UK
        string email UK
        string password
        string name
        string phone
        float walletBalance
        int rafflePoints
        enum role
        enum status
    }

    Item {
        string id PK
        string name
        string description
        string imageUrl
        float value
        string category
        enum status
    }

    Raffle {
        string id PK
        string itemId FK
        float ticketPrice
        int ticketsTotal
        int ticketsSold
        datetime raffleDate
        string winnerUserId FK
        enum status
    }

    Ticket {
        string id PK
        string userId FK
        string raffleId FK
        string ticketNumber UK
        enum status
    }

    Transaction {
        string id PK
        string userId FK
        enum type
        float amount
        enum status
        string reference
    }
```

---

## API Architecture

### Authentication Flow

```mermaid
sequenceDiagram
    participant U as User
    participant FE as Frontend
    participant BE as Backend
    participant DB as Database

    U->>FE: Enter credentials
    FE->>FE: Validate with Zod
    FE->>BE: POST /api/auth/login
    BE->>DB: Find user by email
    BE->>BE: Verify password (bcrypt)
    BE->>BE: Generate JWT (access + refresh)
    BE-->>FE: Return tokens + user data
    FE->>FE: Store tokens (httpOnly cookie)
    FE-->>U: Redirect to dashboard
```

### Payment Flow

```mermaid
sequenceDiagram
    participant U as User
    participant FE as Frontend
    participant BE as Backend
    participant PS as Paystack
    participant DB as Database

    U->>FE: Click "Add Funds"
    FE->>BE: POST /api/wallet/deposit
    BE->>PS: Initialize transaction
    PS-->>BE: Return checkout URL
    BE-->>FE: Return URL
    FE->>PS: Redirect to Paystack
    U->>PS: Complete payment
    PS->>BE: POST /api/payments/webhook
    BE->>DB: Credit wallet balance
    BE->>DB: Log transaction
    PS-->>FE: Redirect back
    FE-->>U: Show updated balance
```

### Raffle Flow

```mermaid
sequenceDiagram
    participant A as Admin
    participant BE as Backend
    participant DB as Database
    participant EM as Brevo Email

    A->>BE: POST /api/raffles/:id/start
    BE->>DB: Get all tickets for raffle
    BE->>BE: crypto.randomInt() selection
    BE->>DB: Update raffle with winnerId
    BE->>DB: Update ticket statuses
    BE->>DB: Credit winner wallet
    BE->>EM: Send winner notification
    BE->>EM: Send admin notification
    BE-->>A: Return winner details
```

---

## Security Considerations

| Area | Implementation |
|------|---------------|
| **Passwords** | bcrypt with salt rounds (10+) |
| **Tokens** | JWT HS256, 24h access / 7d refresh |
| **Input** | Zod validation on frontend + backend |
| **CORS** | Whitelist frontend domain only |
| **Payments** | Paystack webhook signature verification |
| **Admin** | Role-based middleware guard |
| **SQL** | Prisma ORM (parameterized queries) |
| **Secrets** | Environment variables, never committed |

---

## Deployment Architecture

```mermaid
graph LR
    subgraph Production
        V[Vercel] -->|API Calls| R[Railway / Render]
        R -->|SQL| N[Neon PostgreSQL]
        R -->|SMTP| B[Brevo]
        R -->|HTTP| P[Paystack]
    end

    subgraph Dev
        FE[localhost:3000] -->|API| BE[localhost:5000]
        BE -->|SQL| ND[Neon Dev DB]
    end
```

| Service | Provider | Tier |
|---------|----------|------|
| Frontend | Vercel | Free / Pro |
| Backend | Railway or Render | Starter |
| Database | Neon | Free (0.5GB) / Pro |
| Email | Brevo | Free (300/day) |
| Payments | Paystack | Standard |
