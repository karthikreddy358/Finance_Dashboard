# Finance Dashboard Backend

Backend API for finance records, role-based access control, and dashboard analytics.

## Stack

- Node.js + Express
- MongoDB + Mongoose
- JWT auth (cookie + bearer support)
- express-validator

## Run Locally

1. Install packages

```bash
cd backend
npm install
```

2. Create/update `.env`

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/finance-dashboard
JWT_SECRET=your_secret_here
JWT_EXPIRE=7d
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

3. Start server

```bash
npm run dev
```

## API Base URL

`http://localhost:5000/api`

## Main Endpoints

- Auth: `POST /auth/register`, `POST /auth/login`, `GET /auth/profile`, `POST /auth/logout`
- Dashboard: `GET /dashboard/stats`, `GET /dashboard/categories`, `GET /dashboard/trends`
- Transactions: `GET /transactions`, `GET /transactions/:id`, `POST /transactions`, `PUT /transactions/:id`, `DELETE /transactions/:id`
- Users (admin): `GET /users`, `GET /users/:id`, `POST /users`, `PUT /users/:id`, `PATCH /users/:id/status`, `DELETE /users/:id`

## Roles (Backend)

- `admin`: full transaction and user management
- `analyst`: create/update transactions, no delete
- `viewer`: read-only role

## Validation and Error Handling

- Request validation via `express-validator`
- Centralized errors via `middleware/errorHandler.js`
- Standard error response:

```json
{
   "success": false,
   "message": "Error message"
}
```

## Notes

- Public registration defaults to viewer unless explicit role is passed in non-production mode.
- MongoDB is required.
