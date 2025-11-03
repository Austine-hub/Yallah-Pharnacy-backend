/// ==========================================================
// 🌐 Core Imports
// ==========================================================
import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";

// ==========================================================
// 🔧 Load Environment Variables
// ==========================================================
dotenv.config();

// ==========================================================
// 📦 Route Imports (No .js extensions in CommonJS build)
// ==========================================================
import authRoutes from "./routes/authRoutes";
import paymentRoutes from "./routes/paymentRoutes";
import orderRoutes from "./routes/ordersRoutes";

// ==========================================================
// ⚙️ Environment Variables with Defaults
// ==========================================================
const PORT: number = Number(process.env.PORT) || 5000;
const NODE_ENV: string = process.env.NODE_ENV ?? "development";
const CLIENT_URL: string = process.env.CLIENT_URL ?? "http://localhost:5173";

// ==========================================================
// 🧩 Type Definitions
// ==========================================================
interface HealthCheckResponse {
  success: boolean;
  message: string;
  uptime: number;
  environment: string;
  database: string;
  timestamp: string;
}

interface ErrorResponse {
  success: boolean;
  error: string;
  path: string;
  timestamp: string;
}

// ==========================================================
// 🚀 Create Express Application
// ==========================================================
const createApp = (): Express => {
  const app = express();

  // ---------------- SECURITY ----------------
  app.use(
    helmet({
      contentSecurityPolicy: NODE_ENV === "production",
      crossOriginEmbedderPolicy: NODE_ENV === "production",
    })
  );

  // ---------------- CORS ----------------
  const allowedOrigins = CLIENT_URL.split(",").map((url) => url.trim());
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          return callback(null, true);
        }
        callback(new Error(`CORS policy violation. Origin ${origin} not allowed.`));
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
      maxAge: 86400, // 24 hours
    })
  );

  // ---------------- BODY PARSING ----------------
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // ---------------- REQUEST LOGGING ----------------
  app.use(morgan(NODE_ENV === "development" ? "dev" : "combined"));

  // ---------------- ROUTES ----------------
  app.use("/api/auth", authRoutes);
  app.use("/api/payment", paymentRoutes);
  app.use("/api/orders", orderRoutes);

  // ---------------- HEALTH CHECK ----------------
  app.get("/api/health", (_req: Request, res: Response): void => {
    const response: HealthCheckResponse = {
      success: true,
      message: "Backend operational",
      uptime: Math.floor(process.uptime()),
      environment: NODE_ENV,
      database: "Not configured", // Replace when DB pool ready
      timestamp: new Date().toISOString(),
    };

    res.status(200).json(response);
  });

  // ---------------- 404 HANDLER ----------------
  app.use((_req: Request, res: Response): void => {
    const response: ErrorResponse = {
      success: false,
      error: "Endpoint not found",
      path: _req.originalUrl,
      timestamp: new Date().toISOString(),
    };
    res.status(404).json(response);
  });

  // ---------------- GLOBAL ERROR HANDLER ----------------
  app.use(
    (err: Error, _req: Request, res: Response, _next: NextFunction): void => {
      console.error("❌ Unhandled error:", err);

      res.status(res.statusCode !== 200 ? res.statusCode : 500).json({
        success: false,
        error: NODE_ENV === "production" ? "Internal server error" : err.message,
        ...(NODE_ENV === "development" && { stack: err.stack }),
        timestamp: new Date().toISOString(),
      });
    }
  );

  return app;
};

// ==========================================================
// 🧠 Server Startup & Graceful Shutdown
// ==========================================================
const startServer = (): void => {
  const app = createApp();

  app.get("/", (req, res) => {
  res.status(200).send("✅ Yallah Pharmacy Backend is Live and Running!");
});


  const server = app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`📦 Environment: ${NODE_ENV}`);
    console.log(`🌍 CORS: ${CLIENT_URL}`);
  });

  // Graceful shutdown
  const gracefulShutdown = (signal: string): void => {
    console.log(`\n${signal} received. Starting graceful shutdown...`);
    server.close(() => {
      console.log("🛑 HTTP server closed");
      process.exit(0);
    });

    setTimeout(() => {
      console.error("⏱️ Forced shutdown after timeout");
      process.exit(1);
    }, 10_000);
  };

  ["SIGTERM", "SIGINT"].forEach((signal) =>
    process.on(signal, () => gracefulShutdown(signal))
  );

  process.on("unhandledRejection", (reason, promise) => {
    console.error("⚠️ Unhandled Rejection:", reason, "at:", promise);
  });

  process.on("uncaughtException", (error) => {
    console.error("💥 Uncaught Exception:", error);
    process.exit(1);
  });
};

// ==========================================================
// ▶️ Run Server
// ==========================================================
startServer();
