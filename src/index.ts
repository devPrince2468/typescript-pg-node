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
import path from "path";
dotenv.config();

const app = express();

// Middlewares
app.set("trust proxy", 1);
app.use(helmet());
app.use(
  cors({ origin: "https://everydaycart-app.netlify.app/", credentials: true })
);
app.use(morgan("dev"));
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));
app.use(cookieParser());
app.use(apiLimiter);
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

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
      console.log("Server is running on " + PORT);
    });
    console.log("Data Source has been initialized!");
  })
  .catch((error) => console.log(error));
