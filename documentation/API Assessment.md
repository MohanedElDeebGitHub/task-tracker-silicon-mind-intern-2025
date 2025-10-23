# TrackR REST API Documentation

This API provides endpoints for user authentication and task management. All task-related endpoints require JWT-based authentication.

---

## 🛡️ Authentication Endpoints

### 🔐 Register User
`POST /api/auth/register`

Registers a new user account.

**Request Body**
```json
{
  "username": "johndoe",
  "email": "johndoe@example.com",
  "password": "pass1234"
}
```

**Validation Rules**
| Field     | Requirements                          |
|-----------|---------------------------------------|
| username  | 3-20 characters (letters, numbers, _) |
| email     | Valid email format                    |
| password  | Min 6 chars (letters + numbers)       |

**Response Codes**
| Code | Description                          | Example Response                                  |
|------|--------------------------------------|---------------------------------------------------|
| 201  | Created                              | `{ "message": "User created successfully" }`      |
| 400  | Bad Request (invalid/missing fields) | `{ "error": "Password must contain letters" }`    |
| 409  | Conflict (duplicate username/email)  | `{ "error": "Email already registered" }`         |
| 500  | Internal Server Error                | `{ "error": "Database connection failed" }`       |

---

### 🔐 Login
`POST /api/auth/login`

Authenticates user and returns JWT.

**Request Body**
```json
{
  "email": "johndoe@example.com",
  "password": "pass1234"
}
```

**Response Codes**
| Code | Description                     | Example Response                                                                 |
|------|---------------------------------|--------------------------------------------------------------------------------|
| 200  | OK                              | `{ "message": "Login successful", "username": "johndoe", "token": "JWT_TOKEN" }` |
| 400  | Bad Request                     | `{ "error": "Email is required" }`                                             |
| 401  | Unauthorized (invalid credentials) | `{ "error": "Invalid email or password" }`                                     |
| 500  | Internal Server Error           | `{ "error": "Authentication service unavailable" }`                            |

---

## ✅ Task Management Endpoints  
*All require valid JWT in Authorization header*

### 🔑 Authentication Requirement
```http
Authorization: Bearer YOUR_JWT_TOKEN
```

> ⚠️ **Important**: All task endpoints validate that:
> - Token is valid and not expired
> - User owns the requested resource
> - Invalid tokens return `401 Unauthorized`

---

### 📄 Get All Tasks
`GET /api/tasks`

Returns all tasks belonging to the authenticated user.

**Response Codes**
| Code | Description                     | Example Response                                                                 |
|------|---------------------------------|--------------------------------------------------------------------------------|
| 200  | OK                              | `[{"id":1, "title":"Task", "status":"pending", ...}]`                          |
| 401  | Unauthorized                    | `{ "error": "Missing or invalid token" }`                                      |
| 500  | Internal Server Error           | `{ "error": "Database query failed" }`                                         |

---

### ➕ Create Task
`POST /api/tasks`

Creates a new task for the authenticated user.

**Request Body**
```json
{
  "title": "Write API docs",
  "description": "Finish Swagger section",
  "status": "pending"
}
```

**Validation Rules**
- `title`: Required (min 3 characters)
- `status`: Optional (allowed values: `pending`, `in-progress`, `completed`)

**Response Codes**
| Code | Description                     | Example Response                                  |
|------|---------------------------------|---------------------------------------------------|
| 201  | Created                         | `{ "id": 5, "title": "Write API docs", ... }`     |
| 400  | Bad Request                     | `{ "error": "Title is required" }`                |
| 401  | Unauthorized                    | `{ "error": "Invalid token" }`                    |
| 500  | Internal Server Error           | `{ "error": "Task creation failed" }`             |

---

### 🔍 Get Task by ID
`GET /api/tasks/:id`

Retrieves a specific task by ID.

**URL Parameters**
| Parameter | Description     |
|-----------|-----------------|
| id        | Task ID (number)|

**Response Codes**
| Code | Description                     | Example Response                                  |
|------|---------------------------------|---------------------------------------------------|
| 200  | OK                              | `{ "id": 3, "title": "Meeting", ... }`            |
| 403  | Forbidden (wrong user)          | `{ "error": "You don't own this task" }`          |
| 404  | Not Found                       | `{ "error": "Task not found" }`                   |
| 500  | Internal Server Error           | `{ "error": "Database error" }`                   |

---

### 📝 Update Task
`PUT /api/tasks/:id`

Updates an existing task.

**URL Parameters**
| Parameter | Description     |
|-----------|-----------------|
| id        | Task ID (number)|

**Request Body** (partial updates allowed)
```json
{
  "title": "New Title",
  "status": "completed"
}
```

**Response Codes**
| Code | Description                     | Example Response                                  |
|------|---------------------------------|---------------------------------------------------|
| 200  | OK                              | `{ "id": 2, "title": "New Title", ... }`          |
| 403  | Forbidden                       | `{ "error": "Access denied" }`                    |
| 404  | Not Found                       | `{ "error": "Task not found" }`                   |
| 500  | Internal Server Error           | `{ "error": "Update failed" }`                    |

---

### ❌ Delete Task
`DELETE /api/tasks/:id`

Deletes a task permanently.

**URL Parameters**
| Parameter | Description     |
|-----------|-----------------|
| id        | Task ID (number)|

**Response Codes**
| Code | Description                     | Example Response                                  |
|------|---------------------------------|---------------------------------------------------|
| 200  | OK                              | `{ "message": "Task deleted" }`                   |
| 403  | Forbidden                       | `{ "error": "You can't delete others' tasks" }`   |
| 404  | Not Found                       | `{ "error": "Task not found" }`                   |
| 500  | Internal Server Error           | `{ "error": "Deletion failed" }`                  |

---

## 🔁 Example Authentication Flow

1. **Register**  
   `POST /api/auth/register` → Create new account

2. **Login**  
   `POST /api/auth/login` → Get JWT token  
   ```json
   { "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." }
   ```

3. **Access Protected Endpoints**  
   ```http
   GET /api/tasks
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

4. **Perform Task Operations**  
   - Create task → `POST /api/tasks`
   - Update task → `PUT /api/tasks/5`
   - Delete task → `DELETE /api/tasks/5`

---

## 📌 Key Implementation Notes

1. **Token Security**
   - JWTs expire after 24 hours
   - Tokens stored in httpOnly cookies in production
   - Refresh token mechanism implemented for extended sessions

2. **Data Validation**
   - All inputs validated on both frontend and backend
   - SQL injection prevented via parameterized queries
   - Task ownership verified for every CRUD operation

3. **Error Handling**
   - Consistent error format: `{ "error": "Descriptive message" }`
   - Detailed error logging with Winston
   - User-friendly messages for client-facing errors

4. **Swagger Documentation**  
   Full interactive documentation available at:  
   `http://localhost:3001/api-docs` (when running locally)