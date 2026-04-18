# Product Finder — Dynamic Questionnaire & Recommendation System

A full-stack MERN application that presents users with a dynamic multi-step questionnaire, evaluates responses with branching logic, and recommends relevant products based on their answers.

## Tech Stack (MERN)

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React 19 + Vite 8 | Dynamic questionnaire rendering, cart UI, state management |
| Backend | Node.js + Express 5 | REST APIs for questions, evaluation logic, products, auth |
| Database | MongoDB + Mongoose 9 | Store questions, products, carts, users |
| Styling | Tailwind CSS 4 | Clean and responsive UI |
| State | Redux Toolkit | Questionnaire state and cart management |
| Animations | Framer Motion | Smooth transitions and micro-interactions |

## Features

- Dynamic questionnaire loaded from the backend (not hardcoded)
- Branching logic — answers lead to different question paths
- Conditional rejection — ineligible users are stopped with a message
- Tag-based product recommendation engine
- Shopping cart with add, update quantity, remove, and total calculation
- JWT authentication with role-based access (user / super_admin)
- Admin panel to manage questions and products with tag autocomplete
- Responsive design for mobile and desktop

## Prerequisites

- Node.js >= 18
- MongoDB (Atlas or local)
- npm

## Getting Started

### 1. Clone and install

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Configure environment

Create a `.env` file in the `server/` directory:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/your_db
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d
```

### 3. Seed the database

```bash
cd server
npm run seed
```

This populates MongoDB with sample questions (5) and products (8).

### 4. Start the application

```bash
# Terminal 1 — Start backend
cd server
npm run dev
# Server runs on http://localhost:5000

# Terminal 2 — Start frontend
cd client
npm run dev
# Client runs on http://localhost:3000
```

The Vite dev server automatically proxies `/api` requests to the backend.

### 5. Create an admin account

After seeding, an admin account is created:

```
Email: admin@gmail.com
Password: 1234567890
```

Use this to access the admin panel at `/admin`.

## Project Structure

```
client/                      # React frontend
├── src/
│   ├── components/          # Navbar, RouteGuard, TagInput
│   ├── pages/
│   │   ├── LandingPage      # Public hero page
│   │   ├── AuthPage         # Login / Register
│   │   ├── QuestionnairePage # Multi-step assessment
│   │   ├── RecommendationsPage # Product results
│   │   ├── CartPage         # Shopping cart
│   │   └── admin/
│   │       ├── OverviewPage  # Admin dashboard
│   │       ├── QuestionsPage # Question CRUD + branching
│   │       └── ProductsPage  # Product CRUD + tag picker
│   ├── store/slices/        # Redux slices (auth, questionnaire, cart)
│   ├── services/            # Axios API client
│   └── hooks/               # Custom hooks
└── vite.config.js           # Proxy /api to backend

server/                      # Express backend
├── src/
│   ├── models/              # Mongoose schemas (User, Question, Product, Cart)
│   ├── controllers/         # Route handlers
│   ├── routes/              # Express route definitions
│   ├── middleware/           # JWT auth, admin guard
│   └── config/              # DB connection
├── scripts/
│   └── seed.js              # Database seeder
└── .env                     # Environment variables
```

## API Endpoints

### Public

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and get JWT token |
| GET | `/api/questions` | Fetch first question |
| GET | `/api/questions/:id` | Fetch a specific question |
| POST | `/api/questions/evaluate` | Submit answer, get next question / rejection / recommendation signal |
| GET | `/api/products` | Fetch product catalog (optional `?tags=` filter) |
| POST | `/api/recommendations` | Submit all answers, get ranked product recommendations |

### Protected (requires JWT)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/auth/profile` | Get current user profile |
| GET | `/api/cart` | Get user's cart |
| POST | `/api/cart/items` | Add item to cart |
| PUT | `/api/cart/items/:productId` | Update item quantity |
| DELETE | `/api/cart/items/:productId` | Remove item from cart |
| DELETE | `/api/cart` | Clear entire cart |

### Admin (requires JWT + super_admin role)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/admin/tags` | Get all unique tags in the system |
| GET | `/api/admin/questions` | List all questions |
| POST | `/api/admin/questions` | Create a question |
| PUT | `/api/admin/questions/:id` | Update a question |
| DELETE | `/api/admin/questions/:id` | Delete a question |
| GET | `/api/admin/products` | List all products |
| POST | `/api/admin/products` | Create a product |
| PUT | `/api/admin/products/:id` | Update a product |
| DELETE | `/api/admin/products/:id` | Delete a product |

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed explanation of the questionnaire model, branching logic, and recommendation engine.
