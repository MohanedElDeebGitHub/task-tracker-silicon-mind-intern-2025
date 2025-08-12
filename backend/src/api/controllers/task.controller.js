const Task = require("../../models/task.model.js");
const logger = require("../../config/logger.js");

exports.createTask = async (req, res) => {
  try {
    const { title, description, status } = req.body;
    const userId = req.user.id;

    if (!title) {
      return res.status(400).json({ message: "Title is required." });
    }

    let totalDuration = null;

    // If creating already done, calculate duration = 0
    if (status === "done") {
      totalDuration = 0;
    }

    const task = await Task.create({
      title,
      description,
      status: status || "to-do",
      user_id: userId,
      total_duration: totalDuration,
    });

    res.status(201).json(task.toJSON());
  } catch (error) {
    logger.error("Error creating task: ", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

exports.getTasks = async (req, res) => {
  try {
    const userId = req.user.id;
    const tasks = await Task.findAll({ where: { user_id: userId } });

    res.status(200).json(tasks.map(task => task.toJSON()));
  } catch (error) {
    logger.error("Error fetching tasks: ", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

exports.getTaskById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const task = await Task.findOne({ where: { id, user_id: userId } });

    if (!task) {
      return res.status(404).json({ message: "Task not found." });
    }

    res.status(200).json(task.toJSON());
  } catch (error) {
    logger.error("Error retrieving task by id: ", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status } = req.body;
    const userId = req.user.id;

    const task = await Task.findOne({ where: { id, user_id: userId } });

    if (!task) {
      return res.status(404).json({ message: "Task not found." });
    }



    task.title = title ?? task.title;
    task.description = description ?? task.description;

    // If status is being updated
    if (status === "done" && task.status !== "done") {
      // Use UTC timestamps to avoid timezone issues
      const nowUTC = new Date().getTime();
      const createdAtUTC = new Date(task.created_at).getTime();
      
      // some weird local time reason makes it necessary to substract this number to get accurate
      // time, this is 3hours in MS
      // without - there will be a time difference of 3 hours
      // const durationMs = Math.floor((nowUTC - createdAtUTC)) - 10800000;

      /*
        For some reason when the environment is the host machine (not container), the time is defaulted to 3hours in MS
        however when it exists in the container, it is accurate, so keep it as below if running in a containerized env
      */

      const durationMs = Math.floor((nowUTC - createdAtUTC));
      
      // Convert milliseconds to PostgreSQL interval format
      const totalSeconds = Math.floor(durationMs / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      
      // Store as PostgreSQL interval string format
      task.total_duration = `${hours}:${minutes}:${seconds}`;
      
      logger.info(`Duration: ${totalSeconds} seconds (${hours}h ${minutes}m ${seconds}s)`);
      logger.info(`Now UTC: ${new Date(nowUTC).toISOString()}`);
      logger.info(`Created UTC: ${new Date(createdAtUTC).toISOString()}`);
    }
      task.status = status;
    await task.save();

    res.status(200).json(task.toJSON());
  } catch (error) {
    logger.error("Error updating task: ", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const deletedCount = await Task.destroy({ where: { id, user_id: userId } });

    if (deletedCount === 0) {
      return res.status(404).json({ message: "Task not found." });
    }

    res.status(204).send();
  } catch (error) {
    logger.error("Error deleting task: ", error);
    res.status(500).json({ error: "Internal server error." });
  }
};
