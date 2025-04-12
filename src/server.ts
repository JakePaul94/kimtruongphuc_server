import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import morgan from "morgan";
import userRoutes from "./routes/userRouter";
import authRouter from "./routes/authRouter";
import { errorMiddleware } from "./middlewares/errorMiddleware";
import deviceRouter from "./routes/deviceRouter";
import boilerRouter from "./routes/boilerRouter";
import maintenanceRouter from "./routes/tasks/maintenanceRoutes";
import inspectionRouter from "./routes/tasks/inspectionRouter";
import adHocTaskRouter from "./routes/tasks/adHocTaskRouter";
import cleaningRouter from "./routes/tasks/cleaningRouter";
import incidentRouter from "./routes/incidentReport.routes";
import path from "path";
import taskRouter from "./routes/tasks/taskRouter";
import waterReportRouter from "./routes/tasks/waterReportRouer";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan("dev"));


app.use("/uploads", express.static(path.join(__dirname, "uploads")));


app.use("/users", userRoutes);
app.use("/auth", authRouter);
app.use("/devices", deviceRouter);
app.use("/boilers", boilerRouter);
app.use("/maintenance-tasks", maintenanceRouter);
app.use("/inspection-tasks", inspectionRouter);
app.use("/ad-hoc-tasks", adHocTaskRouter);
app.use("/cleaning-tasks", cleaningRouter);
app.use("/water-report-tasks", waterReportRouter);
app.use("/incident-reports", incidentRouter); 
app.use("/tasks", taskRouter);

app.get("/", (req, res) => {
  res.send("Hello World with Express, TypeScript, Sequelize!");
});
app.use(errorMiddleware);

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
