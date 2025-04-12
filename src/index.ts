import { AppDataSource } from "./data-source";
import express from "express";
import * as dotenv from "dotenv";
import { Request, Response } from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import router from "./routes";
import "reflect-metadata";
import { errorHandler } from "./middleware/errorHandler";
import { apiLimiter } from "./middleware/rateLimiter";
dotenv.config();

const app = express();

// Middlewares
app.use(helmet());
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(apiLimiter);

const { PORT = 8000 } = process.env;

app.use("/api/v1", router);

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({ message: "Welcome to E-commerce API" });
});

app.get("*", (req: Request, res: Response) => {
  res.status(505).json({ message: "Bad Request" });
});

app.use(errorHandler);

AppDataSource.initialize()
  .then(async () => {
    app.listen(PORT, () => {
      console.log("Server is running on http://localhost:" + PORT);
    });
    console.log("Data Source has been initialized!");
  })
  .catch((error) => console.log(error));
