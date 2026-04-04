# Finance Dashboard Frontend

React + Vite frontend for finance dashboard views and role-based screens.

## Run Locally

1. Install packages

```bash
cd frontend
npm install
```

2. Configure API URL (optional)

Create `.env` from `.env.example`:

```env
VITE_API_URL=http://localhost:5000/api
```

3. Start frontend

```bash
npm run dev
```

Frontend default URL: `http://localhost:5173`

## Role-Based UI

- `admin`: dashboard + records + transaction entry controls
- `analyst`: dashboard + records
- `viewer`: dashboard summary view only

## Notes

- Currency display is INR.
- Frontend expects backend to be running on port 5000.
