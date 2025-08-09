const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db.js");
const { User } = require("./user.model.js");

const Task = sequelize.define("Task", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM("to-do", "in-progress", "done"),
    allowNull: false,
    defaultValue: "to-do",
  },
  total_duration: {
    type: DataTypes.BIGINT, // store in ms
    allowNull: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: "id",
    },
    onDelete: "CASCADE",
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  }
}, {
  tableName: "tasks",
  timestamps: false,
});

Task.belongsTo(User, { foreignKey: "user_id", as: "user" });
User.hasMany(Task, { foreignKey: "user_id", as: "tasks" });

module.exports = Task;
