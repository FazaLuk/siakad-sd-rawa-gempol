require("dotenv").config();

const app = require("./app");

const PORT = Number(process.env.PORT) || 8080;
const HOST = process.env.HOST || "0.0.0.0";

function logStartupConfig() {
  console.log(`NODE_ENV=${process.env.NODE_ENV || "development"}`);
  console.log(`PORT=${PORT}`);
  console.log(`HOST=${HOST}`);
  console.log(`DATABASE_URL=${process.env.DATABASE_URL ? "set" : "missing"}`);
  console.log(`JWT_SECRET=${process.env.JWT_SECRET ? "set" : "missing"}`);
}

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  process.exit(1);
});

logStartupConfig();

const server = app.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
});

server.on("error", (error) => {
  console.error("Server failed to start:", error);
  process.exit(1);
});
