# Sequelize ORM Implementation Guide

## Overview

Sequelize ORM implementation based on the ERD and the Schema Models.

> **Note:** Dependencies and paths/syscalls may differ from OS to another.

## Installation

```bash
npm install sequelize pg pg-hstore
```

## Database Configuration

This file sets up the connection to Postgres - path to `.env` may differ:

```javascript
// may need to change the path to .env file based on your project structure
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: console.log
  }
);

module.exports = sequelize;
```

## Models

### User Model

Maps to the `users` table:

```javascript
// models/User.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING(35),
    allowNull: false,
    unique: true
  },
  email: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false
  }
}, {
  tableName: 'users',
  timestamps: true, // This handles the created_at column
  updatedAt: false, // We don't have an updated_at column in the schema
  createdAt: 'created_at' // Maps the 'createdAt' field to the 'created_at' column
});

module.exports = User;
```

### Task Model

Maps to the `tasks` table:

```javascript
// models/Task.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Task = sequelize.define('Task', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  fk_user_id: { // The foreign key column
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users', // This is a reference to another model
      key: 'id', // This is the column name of the referenced model
    }
  },
  title: {
    type: DataTypes.STRING(80),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('to-do', 'in progress', 'done'),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  total_duration: {
    // Sequelize doesn't have a native INTERVAL type. 
    // Storing duration in seconds (or minutes) as an INTEGER.
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Total duration in seconds'
  }
}, {
  tableName: 'tasks',
  timestamps: true, // Handles the created_at column
  updatedAt: false,
  createdAt: 'created_at',
  indexes: [
    {
      name: 'idx_tasks_status',
      fields: ['status']
    },
    {
      name: 'idx_tasks_fk_user_id',
      fields: ['fk_user_id']
    }
  ]
});

module.exports = Task;
```

## Associations

This file defines the relationships between the models:

```javascript
// models/index.js
const User = require('./User');
const Task = require('./Task');

// One-to-Many Relationship: A user can have many tasks.
User.hasMany(Task, {
  foreignKey: 'fk_user_id', // The foreign key in the Task model
  as: 'tasks' // Alias for when you fetch tasks from a user
});

// A task belongs to one user.
Task.belongsTo(User, {
  foreignKey: 'fk_user_id', // The foreign key in the Task model
  as: 'user' // Alias for when you fetch the user from a task
});

module.exports = { User, Task };
```

## Database Initialization

This script connects to the database and syncs the models:

```javascript
// database-init.js
const sequelize = require('./config/database');
// Importing models to ensure they are registered with Sequelize
require('./models'); 

async function initializeDatabase() {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');

    // Sync all defined models to the DB.
    // { force: false } prevents it from dropping tables if they already exist.
    await sequelize.sync({ force: false }); 
    console.log('Database & tables are synced!');

  } catch (error) {
    console.error('Unable to connect to the database or sync tables:', error);
  }
}

module.exports = initializeDatabase;

// To run initialization:
// initializeDatabase();
```

## Example Usage

### Creating a User

```javascript
const { User } = require('./models');

async function createUser(username, email, password) {
  try {
    const newUser = await User.create({
      username: username,
      email: email,
      password: password // TO-DO: Hashing
    });
    console.log('User created:', newUser.toJSON());
    return newUser;
  } catch (error) {
    console.error('Error creating user:', error.message);
  }
}

// createUser('jane_doe', 'jane.doe@example.com', 'securePassword123');
```

### Creating a Task for a User

```javascript
const { Task } = require('./models');

async function createTask(userId, title, description) {
  try {
    const newTask = await Task.create({
      fk_user_id: userId,
      title: title,
      status: 'to-do', // Default status
      description: description
    });
    console.log('Task created:', newTask.toJSON());
    return newTask;
  } catch (error) {
    console.error('Error creating task:', error.message);
  }
}

// Example:
// async function runExample() {
//   const user = await createUser('jane_doe', 'jane.doe@example.com', 'securePassword123');
//   if (user) {
//     await createTask(user.id, 'Setup Sequelize Models', 'Define User and Task models according to the schema.');
//   }
// }
// runExample();
```