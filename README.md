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

# User Stories, Scope & Prioritization

## 🟥 Priority P0

### User Onboarding & Account Creation
**As a** new user  
**I want to** sign up with my email and password  
**So that** I can start using the app  

- **Scope**: User onboarding and secure account creation  
- **Acceptance Criteria**:
  - Form requires email and password fields
  - Email validation ensures uniqueness
  - Passwords are securely hashed (bcrypt) before storage
  - Successful signup returns a valid JWT
  - JWT is stored securely in frontend (httpOnly cookie or localStorage)

### User Authentication
**As a** registered user  
**I want to** log in with my credentials  
**So that** I can access my tasks  

- **Scope**: Session management and credential-based access  
- **Acceptance Criteria**:
  - Login form accepts valid email/password combinations
  - Invalid credentials display clear error messages
  - Protected routes (tasks, profile) require valid JWT
  - Token expiration handled with appropriate error responses

### Task Creation
**As a** logged-in user  
**I want to** create tasks with details  
**So that** I can track my work  

- **Scope**: Task creation and persistence  
- **Acceptance Criteria**:
  - Title and estimate fields are required
  - Tasks are stored in DB with user association
  - UI updates immediately via optimistic rendering
  - API endpoint validates input before persistence

### Task Listing
**As a** logged-in user  
**I want to** view all my tasks in a list  
**So that** I can see my work overview  

- **Scope**: Task overview and data retrieval  
- **Acceptance Criteria**:
  - Only displays tasks belonging to current user
  - Shows title, status, estimate, and logged time
  - Data retrieved via authenticated API call
  - Loading states handled during API requests

### Task Updates
**As a** logged-in user  
**I want to** update task details  
**So that** I can maintain accurate task information  

- **Scope**: Task maintenance and real-time updates  
- **Acceptance Criteria**:
  - Editable fields: title, description, status, estimate, logged time
  - Changes persist to database immediately
  - UI reflects updates without full page reload
  - Validation prevents invalid status transitions

### Time Logging
**As a** logged-in user  
**I want to** log time spent on tasks  
**So that** I can track my progress  

- **Scope**: Time tracking and task effort monitoring  
- **Acceptance Criteria**:
  - Dedicated time logging interface (hours/minutes input)
  - Logged time accumulates in task's total_duration
  - Real-time UI updates after successful API call
  - Input validation prevents negative time entries

---

## 🟧 Priority P1

### Session Termination
**As a** logged-in user  
**I want to** log out of the application  
**So that** I can secure my account  

- **Scope**: Session termination and user security  
- **Acceptance Criteria**:
  - JWT is securely removed from storage
  - User redirected to login page after logout
  - All protected routes become inaccessible
  - Logout endpoint invalidates token on server-side

### Task Deletion
**As a** logged-in user  
**I want to** delete unneeded tasks  
**So that** I can keep my task list clean  

- **Scope**: Task lifecycle management and cleanup  
- **Acceptance Criteria**:
  - Delete operation removes task from database
  - UI updates immediately via optimistic deletion
  - Confirmation dialog prevents accidental deletion
  - Only allows deletion of user-owned tasks

### Visual Progress Tracking
**As a** logged-in user  
**I want to** see visual progress indicators  
**So that** I can understand task completion status  

- **Scope**: Visual feedback on task progress  
- **Acceptance Criteria**:
  - Progress bar shows ratio: `logged_time / estimate`
  - Visual indicator displayed on task cards
  - Handles edge cases (0 estimate, logged_time > estimate)
  - Updates dynamically when time is logged

### Containerization
**As a** developer  
**I want** Docker containers for all services  
**So that** deployment is consistent and reproducible  

- **Scope**: Development environment setup and service orchestration  
- **Acceptance Criteria**:
  - Single `docker-compose up` starts full stack
  - Separate Dockerfiles for frontend, backend, and DB
  - Environment variables injected via `.env` file
  - Production-ready configuration for all services

### Multi-Task Time Tracking
**As a** logged-in user  
**I want** to track time across multiple tasks  
**So that** I can monitor multi-tasking efforts  

- **Scope**: Multi-tasking and complex time tracking  
- **Acceptance Criteria**:
  - Interface allows simultaneous tracking of multiple tasks
  - Visual indicator shows currently active task(s)
  - Time log entries can be associated with multiple tasks
  - Summary view shows distribution of time across tasks

---

## 🟨 Priority P2

### Request Logging
**As a** developer  
**I want** comprehensive request logs  
**So that** I can debug and monitor application behavior  

- **Scope**: Application observability and debugging  
- **Acceptance Criteria**:
  - All requests logged using Winston/Morgan
  - Logs include: timestamp, HTTP method, route, status code
  - Error details captured for 5xx responses
  - Log rotation and retention policy implemented

### Code Quality Enforcement
**As a** developer  
**I want** automated code analysis  
**So that** I can maintain high code quality standards  

- **Scope**: Code quality assurance and security enforcement  
- **Acceptance Criteria**:
  - Pre-commit hooks run ESLint and Prettier
  - Critical errors block commits (Husky integration)
  - Security scans included in CI pipeline
  - Code coverage thresholds enforced for tests

### API Documentation
**As a** developer  
**I want** comprehensive API documentation  
**So that** frontend and backend teams can collaborate effectively  

- **Scope**: API contract visibility and developer collaboration  
- **Acceptance Criteria**:
  - Auto-generated documentation via Swagger/OpenAPI
  - Accessible at `/api-docs` endpoint
  - Includes request/response examples and schemas
  - Documentation updated automatically with code changes