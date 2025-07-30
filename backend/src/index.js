const express = require("express");
const authRoutes = require("./api/routes/auth.routes.js");
const taskRoutes = require("./api/routes/task.routes.js");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
