# Team Task Manager

A full-stack team task manager app with role-based access control, project and task management, authentication, and analytics.

## Features

- Signup / login with JWT authentication
- Admin and Member roles
- Project creation and team assignment
- Task creation, assignment, status tracking, and overdue detection
- Dashboard with project/task summaries

## Tech stack

- Backend: Node.js, Express, Sequelize, SQLite / PostgreSQL
- Frontend: React, Vite

## Run locally

### Backend

1. `cd backend`
2. `npm install`
3. Create a `.env` file with:
   - `JWT_SECRET=your-secret`
   - `DATABASE_URL=sqlite:database.sqlite`
   - `PORT=4000`
4. `npm run dev`

### Frontend

1. `cd frontend`
2. `npm install`
3. Create a `.env` file with:
   - `VITE_API_URL=http://localhost:4000/api`
4. `npm run dev`

## Deployment

This project is ready for Railway deployment. Use `backend/Procfile` and set `DATABASE_URL` as a Railway Postgres database URL.

## Notes

The app includes role-based authorization and validations for secure team management.
