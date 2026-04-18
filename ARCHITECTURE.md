# Architecture — Product Finder

## Overview

The system is a questionnaire-driven product recommendation engine. Users answer a series of questions, the system follows branching logic based on their answers, and finally recommends products whose tags match the user's responses.

---

## 1. Question Model

Questions are stored in MongoDB with the following schema:

```js
{
  _id: "q1",                           // Custom string ID
  text: "What category interests you?", // Question text shown to user
  type: "single_choice",                // single_choice | multi_choice
  options: [
    { value: "electronics", label: "Electronics", next: "q2" },
    { value: "fashion",     label: "Fashion",     next: "q2" },
    { value: "sports",      label: "Sports",      next: "q2" }
  ],
  tags: [],                             // Informational only, not used in matching
  order: 2                              // Determines first question (lowest = first)
}
```

### Key fields

- **`options[].value`** — The tag that gets collected for product matching. Admin sets this per option (auto-generated from label or custom).
- **`options[].next`** — Determines where to go when user picks this option:
  - A question ID like `"q2"` → go to that question
  - `"DONE"` → questionnaire complete, show recommendations
  - `"REJECT"` → user is ineligible, stop with rejection message
- **`type`** — `single_choice` (pick one, auto-advances) or `multi_choice` (pick many, submit button)
- **`order`** — Number used to identify the first question and for admin reordering

---

## 2. Branching Logic

The questionnaire follows a directed graph where each option's `next` field acts as an edge.

### Flow

```
User answers question
        ↓
POST /api/questions/evaluate { questionId, answer }
        ↓
Server looks up the selected option's `next` field
        ↓
    ┌───────────────────────────────────────┐
    │ next === "REJECT"                     │ → Return rejection message
    │ next === "DONE"                       │ → Signal: fetch recommendations
    │ next === "q2" (any question ID)       │ → Return next question
    └───────────────────────────────────────┘
```

### Single-choice vs Multi-choice

- **Single-choice**: Each option has its own `next` field, allowing different paths per option.
- **Multi-choice**: All options share the same `next` action (set at question level). All selected values are collected as tags.

### Example branching tree

```
Q1: "Who are you shopping for?"
├── "For Myself"  → Q2
└── "As a Gift"   → Q2

Q2: "What category?"
├── "Electronics"  → Q3
├── "Fashion"      → Q3
├── "Home Kitchen" → Q3
└── "Sports"       → Q3

Q3: "What's your budget?"
├── "Under 500"       → Q4
├── "500 to 2000"     → Q4
├── "2000 to 5000"    → Q4
└── "Above 5000"      → Q4

Q4: "What matters most?" (multi-choice)
├── "Best Value"     → DONE
├── "Premium"        → DONE
├── "Trending"       → DONE
└── "Eco Friendly"   → DONE
```

### Conditional Rejection

If an option has `next: "REJECT"`, the server returns:

```json
{ "type": "reject", "message": "Not eligible..." }
```

The frontend stops the questionnaire and shows the rejection screen with a "Start Over" button.

---

## 3. Recommendation Engine

When the questionnaire completes (`next === "DONE"`), the recommendation engine runs.

### How it works

```
1. Collect all answer values across all questions
   Example: ["for_myself", "electronics", "budget_mid", "trending"]

2. Query products whose tags overlap with these values
   MongoDB: Product.find({ tags: { $in: userTags } })

3. Rank products by number of matching tags
   Product A has tags: ["electronics", "budget_mid", "trending", "best_value"]
   User tags:           ["for_myself", "electronics", "budget_mid", "trending"]
   Match count: 3 (electronics, budget_mid, trending)

4. Sort by match count descending
   → Product with most matching tags appears first

5. Return ranked products with match details
```

### The tag chain

```
QUESTION OPTION (admin sets tag)
        │
        │  "electronics"
        ▼
PRODUCT TAG (admin picks from system tags)
        │
        │  "electronics"
        ▼
MATCH FOUND → product appears in recommendations
```

The key design decision: **question option tags define the vocabulary, products must use those same tags.** In the admin panel, product tags can only be picked from tags that already exist in the system (from question options). This prevents tag mismatches.

### API response format

```json
{
  "products": [
    {
      "_id": "prod_1",
      "name": "Wireless Bluetooth Earbuds",
      "price": 1499,
      "tags": ["electronics", "budget_mid", "trending", "best_value"],
      "matchScore": 3,
      "matchedTags": ["electronics", "budget_mid", "trending"]
    }
  ],
  "userTags": ["for_myself", "electronics", "budget_mid", "trending"]
}
```

---

## 4. Frontend Architecture

### State Management (Redux)

Three slices manage the application state:

| Slice | State | Key Actions |
|---|---|---|
| `auth` | user, token, status | login, register, fetchProfile, logout |
| `questionnaire` | currentQuestion, answers, recommendations, userTags, completed, rejected | fetchFirstQuestion, submitAnswer, reset |
| `cart` | items, status | fetchCart, addToCart, updateQuantity, removeFromCart, clearCart |

### Questionnaire Flow (Redux Thunk)

```
fetchFirstQuestion()
        ↓
GET /api/questions → { question, totalQuestions }
        ↓
User selects an answer
        ↓
submitAnswer({ questionId, answer })
        ↓
POST /api/questions/evaluate
        ↓
If needsRecommendations:
  POST /api/recommendations with all collected answers
        ↓
Store ranked products + userTags in Redux
        ↓
Navigate to /recommendations
```

### Route Protection

| Route | Guard | Description |
|---|---|---|
| `/` | Public | Landing page |
| `/auth` | GuestRoute | Only for unauthenticated users |
| `/assessment` | ProtectedRoute | Requires login |
| `/recommendations` | ProtectedRoute | Requires login |
| `/cart` | ProtectedRoute | Requires login |
| `/admin/*` | AdminRoute | Requires login + super_admin role |

---

## 5. Authentication

JWT-based authentication with bcrypt password hashing.

- **Register**: POST `/api/auth/register` → creates user, returns token
- **Login**: POST `/api/auth/login` → validates credentials, returns token
- **Token**: Stored in localStorage, attached via Axios interceptor as `Authorization: Bearer <token>`
- **Middleware**: `protect` verifies token, attaches user to request. `adminOnly` checks `role === 'super_admin'`

---

## 6. Admin Panel

The admin panel provides full content management:

- **Questions CRUD** — Create, edit, delete, reorder questions. Configure branching per option (go to question / reject / done). Auto-generate tags from labels or set custom tags.
- **Products CRUD** — Create, edit, delete products. Tags are restricted to existing system tags (sourced from question options), ensuring consistent matching.
- **Dashboard** — Shows total question/product counts and a question flow preview.

---

## 7. API Design Philosophy

The API follows RESTful conventions with clean separation of concerns:

- **Controllers** handle request/response logic and validation
- **Models** define schemas and are the only layer that touches MongoDB
- **Routes** map HTTP methods + paths to controllers
- **Middleware** handles cross-cutting concerns (auth, admin checks)
- The evaluate endpoint returns a discriminated union response (`type: 'question' | 'reject' | 'recommendations'`) that the frontend dispatches on
