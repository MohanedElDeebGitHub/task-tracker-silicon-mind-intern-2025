# TrackR Functional Requirements

## Functional Requirements

### 🔐 User Authentication
- **Mandatory Signup**: Users must create accounts using email (unique) and password (securely hashed)
- **JWT Authentication**: Successful login returns a valid JWT for session management
- **Secure Session Termination**: Logout invalidates JWT and clears frontend storage
- **Route Protection**: All task-related endpoints/UI routes require valid authentication

### 📋 Task Management
- **Task Creation**: Users can create tasks with:
  - Required fields: title, estimate (hours)
  - Optional fields: description, status (default: "todo"), initial logged time
- **Task Listing**: View all user-owned tasks showing:
  - Title, status, estimate, logged time
  - Filtered exclusively to current user's tasks
- **Task Updates**: Editable fields include:
  - Title, description, status, estimate, logged time
  - Real-time UI updates without page reloads
- **Task Deletion**: 
  - Requires confirmation dialog
  - Immediate UI removal after successful API call
  - Database deletion with user ownership validation

### ⏱️ Time Tracking
- **Time Logging**: 
  - Dedicated interface for entering time spent (hours/minutes)
  - Accumulated time stored in `total_duration` field
  - Input validation prevents negative values
- **Visual Progress Indicator**:
  - Progress bar shows ratio: `logged_time / estimate`
  - Handles edge cases (0 estimate, logged_time > estimate)
  - Displayed on task cards in real-time
- **Multi-Task Logging (P1)** ⚠️:
  - Single time log entry assignable to multiple tasks
  - Visual indicator for active multi-task sessions
  - Summary view of time distribution across tasks

---

## Non-Functional Requirements

### 🔒 Security
- **Password Security**: 
  - All passwords hashed using bcrypt (min 10 rounds)
  - No plaintext password storage
- **JWT Management**:
  - Tokens stored securely (httpOnly cookies preferred)
  - Validated with HS256 algorithm and expiration
- **Input Validation**:
  - Frontend validation with error feedback
  - Backend schema validation for all API endpoints
  - SQL injection prevention via parameterized queries

### 🧪 Code Quality
- **Static Analysis**:
  - ESLint/Prettier enforced via Husky pre-commit hooks
  - Critical errors block commits (e.g., security vulnerabilities)
- **Test Coverage**:
  - Minimum 80% test coverage for core functionality
  - CI pipeline blocks merges on coverage drops

### 📝 Documentation
- **API Documentation**:
  - Auto-generated Swagger/OpenAPI docs
  - Accessible at `/api-docs` endpoint
  - Includes request/response examples and schemas
- **System Documentation**:
  - Comprehensive README covering setup and architecture
  - Database schema documentation

### 🐳 Deployment & Containerization
- **Docker Implementation**:
  - Separate containers for frontend, backend, PostgreSQL
  - Production-ready Dockerfiles for all services
- **Environment Management**:
  - All configuration via `.env` files
  - Sensitive values excluded from version control
- **Orchestration**:
  - Single-command startup: `docker-compose up --build`
  - Service dependencies properly configured

### 📊 Logging & Monitoring
- **Request Logging**:
  - Winston/Morgan logs capturing:
    - Timestamp, HTTP method, route, status code
    - Error details for 5xx responses
  - Log rotation and retention policy
- **Monitoring**:
  - Health check endpoints for all services
  - Basic performance metrics tracking

### 💡 System Usability
- **Real-Time Updates**:
  - Optimistic UI updates for all CRUD operations
  - No full page reloads for task/time modifications
- **Intuitive Feedback**:
  - Clear progress indicators for time tracking
  - Visual confirmation for critical actions (deletion)
  - Responsive error handling

### 📈 Scalability & Maintainability
- **Scalability**:
  - Stateless backend services for horizontal scaling
  - Database connection pooling configured
- **Maintainability**:
  - Modular code structure with clear separation of concerns
  - Comprehensive test suite enabling safe refactoring
  - Versioned API endpoints for backward compatibility

> **Key Implementation Notes**  
> - Automatic time calculation triggers when status changes to "done"  
> - `total_duration` stored as PostgreSQL `INTERVAL` type  
> - Multi-task time tracking (P1) requires separate time-log entity relationship  
> - All security requirements apply to both development and production environments