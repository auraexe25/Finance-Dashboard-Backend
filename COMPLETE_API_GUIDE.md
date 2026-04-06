# Finance Dashboard API - Complete Working Guide

## Project Purpose
This API manages users, authentication, financial records, dashboard analytics, balance tracking, category management, and record export.

## Core Features
1. JWT-based authentication and role-based authorization
2. User management for Admin role
3. Financial record CRUD with soft delete
4. Dashboard analytics with aggregated summaries
5. User balance tracking with automatic updates
6. Category management for transactions
7. CSV and JSON data export
8. Centralized error handling and request rate limiting

## Tech Stack
- Node.js + Express + TypeScript
- MongoDB + Mongoose
- JWT for auth
- Bcrypt for password hashing

## Base URL and Health Check
- Base API prefix: /api
- Health endpoint: GET /
- Response: Finance Dashboard API is running...

## Roles and Permissions
- Viewer: Read-only analytics and balance summary
- Analyst: Viewer permissions + record listing and export
- Admin: Full access including user management and record mutations

## Authentication Flow
1. Register account via POST /api/auth/register
2. Login via POST /api/auth/login
3. Use returned Bearer token in Authorization header
4. Access protected endpoints

Authorization header format:
Authorization: Bearer <JWT_TOKEN>

## Endpoint Reference

### Auth Endpoints

1. POST /api/auth/register
- Access: Public
- Purpose: Create a new user account
- Main behavior:
  - Validates name, email, and password
  - Hashes password
  - Creates user with default Viewer role and Active status
  - Initializes balance fields
  - Returns JWT token and user profile

2. POST /api/auth/login
- Access: Public
- Purpose: Authenticate existing user
- Main behavior:
  - Validates email and password
  - Verifies hashed password
  - Ensures user status is Active
  - Returns JWT token and profile info

3. GET /api/auth/me
- Access: Authenticated user
- Purpose: Get current logged-in user profile
- Main behavior:
  - Reads user from token context
  - Returns current user data

### User Endpoints
Prefix: /api/users
Access model: Admin only for this route group

4. POST /api/users
- Access: Admin
- Purpose: Create user directly (admin-managed)
- Main behavior:
  - Validates input
  - Hashes password
  - Creates user with selected role/status

5. GET /api/users
- Access: Admin
- Purpose: List all users
- Main behavior:
  - Returns users sorted by createdAt desc
  - Excludes passwordHash

6. GET /api/users/:id/balance
- Access: Admin
- Purpose: Get single user balance snapshot
- Main behavior:
  - Validates ObjectId
  - Returns userId, balance, lastBalanceUpdate

7. GET /api/users/:id
- Access: Admin
- Purpose: Get one user by id
- Main behavior:
  - Validates ObjectId
  - Returns full user profile without passwordHash

8. PATCH /api/users/:id
- Access: Admin
- Purpose: Update user fields
- Main behavior:
  - Supports name, role, status, and password updates
  - Re-hashes password if updated

9. DELETE /api/users/:id
- Access: Admin
- Purpose: Delete user
- Main behavior:
  - Removes user document by id

### Record Endpoints
Prefix: /api/records

10. GET /api/records
- Access: Analyst, Admin
- Purpose: List records with filtering and pagination
- Main behavior:
  - Query params: page, limit, type, category, startDate, endDate
  - Returns paginated data and total counts
  - Excludes soft-deleted records

11. GET /api/records/:id
- Access: Analyst, Admin
- Purpose: Get one record
- Main behavior:
  - Validates ObjectId
  - Returns record if not soft-deleted

12. POST /api/records
- Access: Admin
- Purpose: Create income/expense record
- Main behavior:
  - Validates amount, type, category, date, notes
  - Creates record with isDeleted false
  - Updates user balance automatically:
    - income adds amount
    - expense subtracts amount

13. PATCH /api/records/:id
- Access: Admin
- Purpose: Update record fields
- Main behavior:
  - Supports amount, type, category, date, notes
  - Validates all provided fields

14. DELETE /api/records/:id
- Access: Admin
- Purpose: Soft-delete record
- Main behavior:
  - Sets isDeleted true and deletedAt timestamp
  - Reverses prior balance effect automatically

### Dashboard Endpoints
Prefix: /api/dashboard
Access model: Viewer, Analyst, Admin

15. GET /api/dashboard/summary
- Access: Viewer, Analyst, Admin
- Purpose: Overall financial summary
- Main behavior:
  - Aggregates total income, total expenses, net balance

16. GET /api/dashboard/categories
- Access: Viewer, Analyst, Admin
- Purpose: Category breakdown
- Main behavior:
  - Aggregates totals grouped by category

17. GET /api/dashboard/recent
- Access: Viewer, Analyst, Admin
- Purpose: Recent financial activity
- Main behavior:
  - Returns latest records for quick visibility

18. GET /api/dashboard/trends/monthly
- Access: Viewer, Analyst, Admin
- Purpose: Monthly trend analytics
- Main behavior:
  - Aggregates by month/year for trend charts

### Category Endpoints
Prefix: /api/categories
Access model: Authenticated users

19. POST /api/categories
- Access: Any authenticated user
- Purpose: Create custom category
- Main behavior:
  - Validates category fields
  - Stores owner in createdBy
  - Prevents duplicate names per user

20. GET /api/categories
- Access: Any authenticated user
- Purpose: List categories
- Main behavior:
  - Returns user categories and system categories

21. GET /api/categories/:id
- Access: Any authenticated user
- Purpose: Get category by id
- Main behavior:
  - Validates ObjectId
  - Enforces ownership/system visibility rules

22. PATCH /api/categories/:id
- Access: Any authenticated user
- Purpose: Update category
- Main behavior:
  - Updates provided fields
  - Prevents editing immutable system categories

23. DELETE /api/categories/:id
- Access: Any authenticated user
- Purpose: Delete category
- Main behavior:
  - Deletes user-owned category
  - Prevents deleting system categories

### Export Endpoints
Prefix: /api/export
Access model: Analyst, Admin

24. GET /api/export/csv
- Access: Analyst, Admin
- Purpose: Export records as downloadable CSV
- Main behavior:
  - Optional date range via startDate and endDate
  - Uses proper CSV escaping
  - Returns file download headers

25. GET /api/export/json
- Access: Analyst, Admin
- Purpose: Export records as downloadable JSON
- Main behavior:
  - Optional date range via startDate and endDate
  - Returns metadata + record payload
  - Returns file download headers

### Balance Endpoints
Prefix: /api/balance

26. GET /api/balance/summary
- Access: Viewer, Analyst, Admin
- Purpose: Dashboard + user balance overview
- Main behavior:
  - Combines finance summary and user balance stats

27. GET /api/balance/users/report
- Access: Admin only
- Purpose: Detailed balance distribution report
- Main behavior:
  - Provides per-user balances and grouped distribution insights

## Total Endpoint Count
- Public endpoints: 2
- Protected endpoints: 25
- Overall endpoints: 27

## Request Validation and Error Behavior
- Validation happens before database operations
- Invalid payloads return 400
- Missing/invalid token returns 401
- Forbidden role returns 403
- Missing resource returns 404
- Unhandled server errors return 500

## Data and Security Behavior
- Passwords are hashed with bcrypt
- JWT tokens are signed using JWT_SECRET
- Rate limiting is enabled
- CORS is enabled
- Soft delete is used for records to preserve audit history

## Environment Variables
- MONGO_URI
- JWT_SECRET
- PORT

## Run Commands
- Development: npm run dev
- Typecheck: npx tsc --noEmit
- Build: npm run build
- Start production: npm start

## Route Mount Map
- /api/auth -> authRoutes
- /api/users -> userRoutes
- /api/records -> recordRoutes
- /api/dashboard -> dashboardRoutes
- /api/categories -> categoryRoutes
- /api/export -> exportRoutes
- /api/balance -> balanceRoutes

## File Pointers
- Main server entry: src/server.ts
- Auth routes: src/routes/authRoutes.ts
- User routes: src/routes/userRoutes.ts
- Record routes: src/routes/recordRoutes.ts
- Dashboard routes: src/routes/dashboardRoutes.ts
- Category routes: src/routes/categoryRoutes.ts
- Export routes: src/routes/exportRoutes.ts
- Balance routes: src/routes/balanceRoutes.ts

## Notes
- This guide reflects currently mounted and working routes from the source files.
- If additional routes are added later, update this file alongside the route modules.
