const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware");
const taskController = require("../controllers/task.controller");

router.use(authMiddleware);

router.get("/", taskController.getAllTasks);
router.delete("/:id", taskController.deleteTask);
router.put("/:id", taskController.updateTask);
router.post("/", taskController.createTask);
router.get("/:id", taskController.getTaskById);

module.exports = router;
