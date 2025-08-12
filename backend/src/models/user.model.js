const { DataTypes } = require("sequelize");
const bcrypt = require("bcrypt");
const { sequelize } = require("../config/db.js");

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "users",
    timestamps: false,
    hooks: {
      beforeCreate: async (user) => {
        const saltRounds = 12;
        user.password = await bcrypt.hash(user.password, saltRounds);
      },
    },
  },
);

/**
 * Find a user by email
 * @param {string} email - The email to search for
 * @returns {Promise<User|null>} The found user or null
 */
async function findOneByEmail(email) {
  return await User.findOne({ where: { email } });
}

/**
 * Find a user by username
 * @param {string} username - The username to search for
 * @returns {Promise<User|null>} The found user or null
 */
async function findOneByUsername(username) {
  return await User.findOne({ where: { username } });
}

/**
 * Create a new user
 * @param {string} username - The username for the new user
 * @param {string} email - The email for the new user
 * @param {string} password - The password for the new user (will be hashed)
 * @returns {Promise<User>} The created user
 */
async function create(username, email, password) {
  return await User.create({
    username,
    email,
    password,
  });
}

/**
 * Get a user by email and verify password
 * @param {string} email - The email to search for
 * @param {string} password - The password to verify
 * @returns {Promise<User|null>} The user if authentication is successful, null otherwise
 */
async function getUser(email, password) {
  const user = await User.findOne({ where: { email } });

  if (!user) {
    return null;
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return null;
  }

  return user;
}

module.exports = {
  User,
  findOneByEmail,
  findOneByUsername,
  create,
  getUser,
};
