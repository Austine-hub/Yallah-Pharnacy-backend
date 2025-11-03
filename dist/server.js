"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// ==========================================================
// 🌐 Core Imports
// ==========================================================
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
// ==========================================================
// 🔧 Load Environment Variables
// ==========================================================
dotenv_1.default.config();
// ==========================================================
// 📦 Route Imports (No .js extensions in CommonJS build)
// ==========================================================
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const paymentRoutes_1 = __importDefault(require("./routes/paymentRoutes"));
const ordersRoutes_1 = __importDefault(require("./routes/ordersRoutes"));
// ==========================================================
// ⚙️ Environment Variables with Defaults
// ==========================================================
const PORT = Number(process.env.PORT) || 5000;
const NODE_ENV = process.env.NODE_ENV ?? "development";
const CLIENT_URL = process.env.CLIENT_URL ?? "http://localhost:5173";
// ==========================================================
// 🚀 Create Express Application
// ==========================================================
const createApp = () => {
    const app = (0, express_1.default)();
    // ---------------- SECURITY ----------------
    app.use((0, helmet_1.default)({
        contentSecurityPolicy: NODE_ENV === "production",
        crossOriginEmbedderPolicy: NODE_ENV === "production",
    }));
    // ---------------- CORS ----------------
    const allowedOrigins = CLIENT_URL.split(",").map((url) => url.trim());
    app.use((0, cors_1.default)({
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
    }));
    // ---------------- BODY PARSING ----------------
    app.use(express_1.default.json({ limit: "10mb" }));
    app.use(express_1.default.urlencoded({ extended: true, limit: "10mb" }));
    // ---------------- REQUEST LOGGING ----------------
    app.use((0, morgan_1.default)(NODE_ENV === "development" ? "dev" : "combined"));
    // ---------------- ROUTES ----------------
    app.use("/api/auth", authRoutes_1.default);
    app.use("/api/payment", paymentRoutes_1.default);
    app.use("/api/orders", ordersRoutes_1.default);
    // ---------------- ROOT ROUTE ----------------
    app.get("/", (_req, res) => {
        res.status(200).send("✅ Yallah Pharmacy Backend is Live and Running!");
    });
    // ---------------- HEALTH CHECK ----------------
    app.get("/api/health", (_req, res) => {
        const response = {
            success: true,
            message: "Backend operational",
            uptime: Math.floor(process.uptime()),
            environment: NODE_ENV,
            database: "Not configured", // Replace with DB connection status if needed
            timestamp: new Date().toISOString(),
        };
        res.status(200).json(response);
    });
    // ---------------- 404 HANDLER ----------------
    app.use((_req, res) => {
        const response = {
            success: false,
            error: "Endpoint not found",
            path: _req.originalUrl,
            timestamp: new Date().toISOString(),
        };
        res.status(404).json(response);
    });
    // ---------------- GLOBAL ERROR HANDLER ----------------
    app.use((err, _req, res, _next) => {
        console.error("❌ Unhandled error:", err);
        res.status(res.statusCode !== 200 ? res.statusCode : 500).json({
            success: false,
            error: NODE_ENV === "production" ? "Internal server error" : err.message,
            ...(NODE_ENV === "development" && { stack: err.stack }),
            timestamp: new Date().toISOString(),
        });
    });
    return app;
};
// ==========================================================
// 🧠 Server Startup & Graceful Shutdown
// ==========================================================
const startServer = () => {
    const app = createApp();
    const server = app.listen(PORT, () => {
        console.log(`✅ Server running on port ${PORT}`);
        console.log(`📦 Environment: ${NODE_ENV}`);
        console.log(`🌍 CORS: ${CLIENT_URL}`);
    });
    // Graceful shutdown
    const gracefulShutdown = (signal) => {
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
    ["SIGTERM", "SIGINT"].forEach((signal) => process.on(signal, () => gracefulShutdown(signal)));
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
//# sourceMappingURL=server.js.map