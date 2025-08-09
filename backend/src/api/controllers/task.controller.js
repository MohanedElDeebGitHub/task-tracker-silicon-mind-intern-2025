const logger = require('../../config/logger');

const taskModel = require("../../models/task.model");

async function createTask(req, res) {
  try {
    const { title, description, status } = req.body;
    const user_id = req.user.id;

    if (!title) {
      return res.status(400).json({ error: "No title" });
    }

    const newTask = await taskModel.create({
      title,
      description,
      status,
      user_id,
    });

    res.status(201).json(newTask);
  } catch (error) {
    logger.error("Error creating new task: ", error);
    
    // Check for PostgreSQL unique constraint violation (code 23505), this makes the code tighly coupled on DB type
    if (error.code === '23505') {
      return res.status(409).json({ 
        error: "A task with this title already exists" 
      });
    }
    
    // For all other errors, return 500
    res.status(500).json({ error: "Internal server error" });
  }
}

async function getAllTasks(req, res) {
  try {
    const user_id = req.user.id;
    const allTasks = await taskModel.findAllByUserId(user_id);
    res.status(200).json(allTasks);
  } catch (error) {
    logger.error("Error fetching tasks: ", error);
    res.status(500).json({ error: "internal server error" });
  }
}

async function getTaskById(req, res) {
  try {
    const taskId = req.params.id;
    const userId = req.user.id;

    const task = await taskModel.findOne({ where: { id: taskId, user_id: userId } });

    if (!task) {
      return res
        .status(404)
        .json({ message: "Task not found." });
    }

    res.status(200).json(task);
  } catch (error) {
    logger.error("Error retrieving task by id:  ", error);
    res.status(500).json({ error: "Internal server error." });
  }
}

async function updateTask(req, res) {
  try {
    const taskId = req.params.id;
    const userId = req.user.id;

    const task = await taskModel.findById(taskId);

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    if (task.user_id !== userId) {
      return res
        .status(403)
        .json({ error: "Forbidden: You do not own this task" });
    }

    const updatedTask = await taskModel.update(taskId, req.body);
    res.status(200).json(updatedTask);
  } catch (error) {
    logger.error("Error updating task:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

async function deleteTask(req, res) {
  try {
    const taskId = req.params.id;
    const userId = req.user.id;

    const task = await taskModel.findById(taskId);

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    if (task.user_id !== userId) {
      return res
        .status(403)
        .json({ error: "Forbidden: You do not own this task" });
    }

    await taskModel.remove(taskId);
    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    logger.error("Error deleting task:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = {
  createTask,
  getAllTasks,
  updateTask,
  deleteTask,
  getTaskById,
};
