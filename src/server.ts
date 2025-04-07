import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import morgan from "morgan";
import userRoutes from "./routes/userRouter";
import { sequelize } from "./config/database";
import authRouter from "./routes/authRouter";
import { errorMiddleware } from "./middlewares/errorMiddleware";
import deviceRouter from "./routes/deviceRouter";
import taskRouter from "./routes/taskRouter";
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.use("/users", userRoutes);
app.use("/auth", authRouter);
app.use("/devices", deviceRouter);
app.use("/tasks", taskRouter);
app.get("/", (req, res) => {
  res.send("Hello World with Express, TypeScript, Sequelize!");
});
app.use(errorMiddleware);

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
