# TrackR - Full-Stack Task Tracker

A full-stack task management application built with React, Node.js, and PostgreSQL, containerized with Docker. This project serves as a practical application of the software development lifecycle, covering everything from planning and schema design to testing, documentation, and deployment.

The scope is intentionally small, as the core focus of this project is to understand how professional teams work in an agile environment.

Every feature implemented was created in it's appropriate sprint, as a user-story that has it's own set of subtasks, each has it's own estimation.

Every PR was reviewed by one of the mentors, and any issues were handled via appropriate communication channel.

## Core Features

- **User Authentication**: Secure signup and login functionality using JWT for session management and protected API routes
- **Task Management (CRUD)**: A complete set of endpoints and UI components for creating, reading, updating, and deleting tasks
- **Automatic Time Tracking**: When a task's status is set to "Done", its `total_duration` is automatically calculated based on its creation timestamp, providing a simple time tracking mechanism

## Tech Stack

| Category | Technology |
|----------|------------|
| Frontend | React, React Router, React Bootstrap |
| Backend | Node.js, Express.js |
| Database | PostgreSQL |
| Testing | Jest, Supertest (Backend), React Testing Library (Frontend) |
| Infrastructure | Docker, Docker Compose |
| Documentation & Logging | Swagger (API Docs), Winston & Morgan (Logging) |
| Code Quality | ESLint, Prettier, Husky (Pre-commit hooks) |

## Project Structure

```
.
├── backend/
│   ├── Dockerfile
│   ├── __tests__/
│   ├── migrations/
│   └── src/
│       ├── api/
│       ├── config/
│       └── models/
├── frontend/
│   ├── Dockerfile
│   ├── nginx.conf
│   └── src/
│       ├── components/
│       └── pages/
├── docker-compose.yml
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- Docker & Docker Compose
- Git

### Local Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/MohanedElDeebGitHub/task-tracker-silicon-mind-intern-2025
   cd task-tracker-silicon-mind-intern-2025
   ```

2. **Create the root environment file:**
   
   Create a `.env` file in the project's root directory and populate it with your database credentials and a JWT secret. This file will be used by Docker Compose.
   
   ```bash
   # .env (in the root directory)
   DB_NAME=task_tracker_db
   DB_USER=postgres
   DB_PASS=your_secret_password
   JWT_SECRET=your_super_secret_key_that_is_long_and_random
   ```

3. **Create the backend environment file:**
   
   Copy the root `.env` file into the `backend/` directory. This is used for running migrations and tests outside of Docker.
   
   ```bash
   cp .env backend/.env
   ```

4. **Run Database Migrations:**
   
   Before starting the services, set up the database schema.
   
   ```bash
   cd backend
   npm install
   npm run migrate:up
   cd ..
   ```

5. **Build and Run with Docker Compose:**
   
   From the root directory, run:
   
   ```bash
   docker-compose up --build
   ```
   
   - The frontend will be available at http://localhost:3000
   - The backend API will be available at http://localhost:3001

## Available Scripts

### Backend (`/backend`)

- `npm start`: Starts the Node.js server
- `npm test`: Runs all backend integration and unit tests with Jest
- `npm run migrate:up`: Applies all pending database migrations

### Frontend (`/frontend`)

- `npm start`: Starts the React development server
- `npm test`: Runs all frontend component tests
- `npm run build`: Creates a production-ready build of the React app

## API Documentation

The API is documented using Swagger. Once the backend service is running, you can view the interactive documentation at:

http://localhost:3001/api-docs

## Schema Note

This implementation deviates slightly from the initial project description's schema for simplicity and robustness:

- The `estimate_hours` column was removed
- The `total_duration` column is now an `INTERVAL` type that is automatically calculated by the backend when a task's status is updated to 'done'. This ensures data integrity and simplifies the frontend logic