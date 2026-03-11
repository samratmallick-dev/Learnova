import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { corsOptions } from "./config/cors/cors.config.js";
import Logger from "./config/logger.config.js";
import errorHandler from "./middleware/error.middleware.js";

const app = express();

app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use((req, res, next) => {
      if (req.path !== "/health" && req.path !== "/") {
            Logger.info("Incoming request", {
                  method: req.method,
                  path: req.path,
                  origin: req.headers.origin,
            });
      }
      next();
});

app.get("/", (req, res) => {
      res.json({
            message: "Learnova server is running",
            version: "1.0.0",
            status: "healthy",
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV || "development",
      });
});

app.get("/health", (req, res) => {
      res.json({
            status: "healthy",
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
      });
});

app.use((req, res) => {
      Logger.warn("Route not found", {
            path: req.originalUrl,
            method: req.method,
            ip: req.ip,
            origin: req.headers.origin,
      });

      res.status(404).json({
            success: false,
            message: "Route not found",
            path: req.originalUrl,
            method: req.method,
      });
});

app.use(errorHandler);

export default app;