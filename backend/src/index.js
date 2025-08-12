const express = require("express");
const authRoutes = require("./api/routes/auth.routes.js");
const taskRoutes = require("./api/routes/task.routes.js");
const morgan = require("morgan");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger.config.js");

const logger = require("./config/logger.js");

const app = express();

app.use(express.json());
app.use(cors());

app.use(morgan("dev"));

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec)); // <-- ADD THIS

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
