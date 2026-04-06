# Finance Dashboard API

Production-grade Node.js, Express, TypeScript, and Mongoose backend for finance dashboard workflows.

## Features

- **Authentication**: JWT-based user registration and login with 1-day token expiry
- **Role-Based Access Control**: Viewer, Analyst, and Admin roles with granular permissions
- **Financial Records Management**: Create, read, update, and soft-delete financial records (income/expense)
- **Advanced Filtering**: Filter records by type, category, and date range with pagination
- **Dashboard Analytics**: Aggregation-based summary endpoints using MongoDB pipelines
  - Total income, expenses, and net balance
  - Category-wise breakdowns
  - Recent activity with user information
  - Monthly trends and analytics
- **Soft Delete**: Records are marked as deleted rather than permanently removed
- **Rate Limiting**: Global rate limiting (100 requests per 15 minutes)
- **Input Validation**: Strict TypeScript typing and runtime validation before database operations
- **Centralized Error Handling**: Consistent error responses with appropriate HTTP status codes
- **Test Suite**: Jest-based unit tests for validation and error handling

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript (strict mode)
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (jsonwebtoken) & bcryptjs
- **Testing**: Jest with ts-jest
- **Additional**: CORS, dotenv, body-parser

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- MongoDB instance (Atlas or local)

## Setup

### 1. Clone and Install

```bash
git clone <repository-url>
cd Finance Dashboard
npm install
```

### 2. Environment Configuration

Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

Edit `.env`:

```env
# MongoDB Connection String
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/financedb?retryWrites=true&w=majority

# JWT Secret (use a long random string in production)
JWT_SECRET=your-super-secret-key-at-least-32-chars

# Server Port
PORT=5000
```

#### MongoDB Atlas Setup

1. Create an account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster and database
3. Set up a user with read/write permissions
4. Whitelist your IP address
5. Get the connection string and replace `<username>`, `<password>`, and `<cluster>`

#### Local MongoDB Setup

```env
MONGO_URI=mongodb://localhost:27017/financedb
JWT_SECRET=local-dev-secret-key
PORT=5000
```

### 3. Run the Application

**Development mode with auto-reload:**

```bash
npm run dev
```

**Build for production:**

```bash
npm run build
```

**Run production build:**

```bash
npm start
```

**Run tests:**

```bash
npm test
```

**Run tests in watch mode:**

```bash
npm run test:watch
```

## Project Structure

```
src/
├── config/
│   └── db.ts                 # MongoDB connection
├── controllers/
│   ├── authController.ts     # Register, login, me endpoints
│   ├── userController.ts     # User CRUD (admin only)
│   ├── recordController.ts   # Record CRUD with filtering
│   └── dashboardController.ts # Dashboard analytics & aggregations
├── middlewares/
│   ├── auth.ts              # JWT verification
│   ├── rbac.ts              # Role-based access control
│   ├── errorHandler.ts      # Global error middleware
│   ├── rateLimit.ts         # Rate limiting
│   ├── notFound.ts          # 404 handler
│   └── validateObjectId.ts  # ObjectId validation
├── models/
│   ├── User.ts              # User schema with roles
│   └── Record.ts            # Financial record schema
├── routes/
│   ├── authRoutes.ts        # Auth endpoints
│   ├── userRoutes.ts        # User management endpoints
│   ├── recordRoutes.ts      # Record CRUD endpoints
│   └── dashboardRoutes.ts   # Dashboard analytics endpoints
├── types/
│   ├── domain.ts            # Domain types and constants
│   ├── auth.ts              # JWT and auth types
│   └── express/
│       └── index.d.ts       # Express augmentation for authenticated requests
├── utils/
│   ├── errors.ts            # Error classes and factories
│   ├── asyncHandler.ts      # Async middleware wrapper
│   └── validation.ts        # Input validation helpers
├── __tests__/               # Jest unit tests
└── server.ts                # Express app setup

.env.example                 # Example environment variables
jest.config.js              # Jest configuration
tsconfig.json               # TypeScript configuration
package.json                # Dependencies and scripts
```

## API Overview

### Authentication

- **POST** `/api/auth/register` — Create a new user account
- **POST** `/api/auth/login` — Authenticate and receive JWT token
- **GET** `/api/auth/me` — Get current authenticated user profile

### User Management (Admin only)

- **POST** `/api/users` — Create a user with specific role
- **GET** `/api/users` — List all users
- **GET** `/api/users/:id` — Get user by ID
- **PATCH** `/api/users/:id` — Update user (name, role, status, password)
- **DELETE** `/api/users/:id` — Delete user (hard delete)

### Financial Records

- **POST** `/api/records` — Create a new record (admin only)
- **GET** `/api/records` — List records with filtering & pagination (analyst/admin)
- **GET** `/api/records/:id` — Get record by ID (analyst/admin)
- **PATCH** `/api/records/:id` — Update record (admin only)
- **DELETE** `/api/records/:id` — Soft-delete record (admin only)

### Dashboard Analytics

All endpoints allow Viewer, Analyst, and Admin roles.

- **GET** `/api/dashboard/summary` — Total income, expenses, net balance
- **GET** `/api/dashboard/categories` — Category-wise breakdown
- **GET** `/api/dashboard/recent` — Recent 10 records with user info
- **GET** `/api/dashboard/trends/monthly` — Monthly income/expense trends

Query parameters support date filtering:
- `startDate` — ISO date (e.g., `2026-01-01`)
- `endDate` — ISO date (e.g., `2026-04-06`)

For detailed API documentation, see [API_DOCS.md](API_DOCS.md).

## Role-Based Access Control

| Role | Permissions |
|------|-----------|
| **Viewer** | Read dashboard summaries, categories, trends, recent activity |
| **Analyst** | Viewer permissions + read records and record details |
| **Admin** | Full access: create/update/delete records, manage users, all dashboard views |

## Authentication

All protected endpoints require a Bearer token in the Authorization header:

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" http://localhost:5000/api/auth/me
```

## Error Handling

All error responses follow a consistent format:

```json
{
  "message": "Description of the error",
  "details": null
}
```

**HTTP Status Codes:**
- `400 Bad Request` — Validation failed or invalid input
- `401 Unauthorized` — Missing, invalid, or expired token
- `403 Forbidden` — Insufficient permissions or inactive user
- `404 Not Found` — Resource does not exist
- `429 Too Many Requests` — Rate limit exceeded
- `500 Internal Server Error` — Unexpected server error

## Rate Limiting

Global rate limit: **100 requests per 15 minutes** per IP address.

Example error when limit exceeded:
```json
{
  "message": "Too many requests. Retry after 300 seconds",
  "details": null
}
```

## Testing

Unit tests are included for validation and error handling utilities.

```bash
npm test                # Run all tests
npm run test:watch    # Watch mode
```

Test coverage includes:
- Input validation functions
- Error creation and handling
- Type assertions for domain entities

## Key Design Decisions

1. **Soft Deletes**: Records are marked as deleted (`isDeleted=true`, `deletedAt=timestamp`) rather than permanently removed for audit trail and recovery capability.

2. **Aggregation Pipelines**: Dashboard analytics queries use MongoDB aggregation pipelines for efficient server-side computations instead of fetching documents into memory.

3. **Async Error Handling**: A custom async wrapper allows middleware to throw errors directly, which are caught and passed to the centralized error handler.

4. **Strict TypeScript**: All request parameters, responses, and database operations use strict typing. No `any` types are used.

5. **Token Expiry**: JWT tokens expire after 1 day. Users must re-authenticate for new tokens.

6. **Rate Limiting**: In-memory rate limiting for development; production deployments should use Redis-based rate limiting.

7. **Password Hashing**: Passwords are hashed with bcrypt (cost factor 12) before storage.

## Production Considerations

- **Rate Limiting**: Replace in-memory store with Redis for distributed deployments
- **Secrets Management**: Use a secrets manager (e.g., AWS Secrets Manager, HashiCorp Vault)
- **HTTPS**: Always use HTTPS in production
- **Database Indexes**: Add indexes on frequently queried fields (userId, date, isDeleted)
- **Monitoring**: Add logging and monitoring for error tracking and performance
- **CORS**: Restrict CORS origins to known frontend domains
- **Request Validation**: Consider using zod or joi for schema-based validation

## Example Workflow

```bash
# 1. Register a user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123"
  }'

# 2. Login
RESPONSE=$(curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123"
  }')
TOKEN=$(echo $RESPONSE | jq -r '.token')

# 3. Get current user
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:5000/api/auth/me

# 4. View dashboard summary (as Viewer)
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:5000/api/dashboard/summary?startDate=2026-01-01&endDate=2026-04-06"
```

## Troubleshooting

**MongoDB Connection Error**: Ensure `MONGO_URI` is correct and your IP is whitelisted (Atlas).

**JWT Secret Not Set**: Verify `JWT_SECRET` is defined in `.env`.

**Port Already in Use**: Change `PORT` in `.env` or kill the process using the port.

**Rate Limit Errors**: Wait for the rate limit window to reset, or restart the application.


