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
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./swagger";

dotenv.config();

// Critical: Check for JWT_SECRET
if (!process.env.JWT_SECRET) {
  console.error("FATAL ERROR: JWT_SECRET is not defined in .env file.");
  process.exit(1);
}

const app = express();

// Swagger UI setup
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Add a route to serve the Swagger/OpenAPI specification as JSON
app.get("/api-docs.json", (req: Request, res: Response) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

// Middlewares
app.set("trust proxy", 1);
app.use(helmet());

const { PORT = 8000 } = process.env;

const allowedOrigins = [
  "http://localhost:5173",
  `http://localhost:${PORT}`,
  "https://everydaycart-app.netlify.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
app.use(morgan("dev"));
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));
app.use(cookieParser());
app.use(apiLimiter);
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

app.use("/api/v1", router);

app.get("/", (req: Request, res: Response) => {
  res.redirect("/api-docs");
});

app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ message: "Server is healthy" });
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
