# Schema Modeling Document – Task & Time Tracking System

## 1. Overview

This schema supports a system where users can create tasks, log time in work sessions, and allocate time from each session to multiple tasks.

This is a relational-based database that is ensured to exist in 3rd NF, with appropriate indexing. Simplicity is *intentional*.

## 2. Entity Descriptions

### Table: users

Stores user credentials and identifiers.

| Column | Data Type | Constraints | Description |
|--------|-----------|-------------|-------------|
| `id` | `SERIAL` | `PRIMARY KEY` | Unique user ID |
| `username` | `VARCHAR(35)` | `UNIQUE, NOT NULL` | Display/login name |
| `email` | `VARCHAR(50)` | `UNIQUE, NOT NULL` | User's email |
| `password` | `VARCHAR(255)` | `NOT NULL` | Encrypted password |
| `created_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | User creation timestamp |

### Table: tasks

Stores task information per user.

| Column | Data Type | Constraints | Description |
|--------|-----------|-------------|-------------|
| `id` | `SERIAL` | `PRIMARY KEY` | Unique task ID |
| `fk_user_id` | `INTEGER` | `NOT NULL, FK → users(id)` | Task owner |
| `title` | `VARCHAR(80)` | `NOT NULL` | Task title |
| `status` | `ENUM ('to-do', 'in progress', 'done')` | `NOT NULL` | Current status |
| `description` | `TEXT` | | Description of task |
| `total_duration` | `INTERVAL` | `DEFAULT '0'` | Total time logged |
| `created_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | Creation timestamp |

**Indexes:**
- `idx_tasks_status`
- `idx_tasks_fk_user_id`

## 3. Relationships

- One user can have many tasks (1:N)
- One task can have one, and only one user (1:1)

## 4. Normalization Study

All the tables are in 3NF (Third Normal Form) and are intended to be in that form to ensure absolute avoidance of anomalies and data redundancy.

## 5. De-Normalization Study

**Would joining too many tables become a bottleneck?**
- Given the current scope/scale of the project, we won't face too much performance bottlenecks

Given the potential for scaling out the database, enhancing it with logs, extra attributes and possibly extra entities - the risks of anomalies or redundancy for a project that may need to scale such as this make the performance trade-off worth it.

## 6. Future Considerations

- Possible support for logging (To be studied.)
- Necessary additions for collaborations between different users
- Extra indexing logic