const taskModel = require("../../models/task.model");

async function createTask(req, res) {
  try {
    const { title, description, status, estimate_hours } = req.body;

    const user_id = req.user.id;

    if (!title) return res.status(400).json({ error: "No title" });

    const newTask = await taskModel.create({
      title,
      description,
      status,
      estimate_hours,
      user_id,
    });

    res.status(201).json(newTask);
  } catch (error) {
    console.error("Error creating new task: ", error);
    res.status(500).json({ error: "internal server error" });
  }
}

async function getAllTasks(req, res) {
  try {
    const user_id = req.user.id;

    const allTasks = await taskModel.findAllByUserId(user_id);

    res.status(200).json(tasks);
  } catch (error) {
    console.error("Error creating new task: ", error);
    res.status(500).json({ error: "internal server error" });
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
    console.error("Error updating task:", error);
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
    console.error("Error deleting task:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

async function getTaskById(req, res) {
  try {
    user_id = req.user.id;
    task_id = req.task.id;

    const task = taskModel.findById(task_id);

    if (!task) {
      return res
        .status(404)
        .json({ message: "Task with that ID does't exist." });
    }

    if (task.user_id !== user_id) {
      return res
        .status(403)
        .json({ message: "You don't have access to this resource." });
    }

    res.status(200).json(task);
  } catch (error) {
    console.error("Error retrieving task by id:  ", error);
    res.status(500).json({ error: "Internal server error." });
  }
}

module.exports = {
  createTask,
  getAllTasks,
  updateTask,
  deleteTask,
  getTaskById,
};
