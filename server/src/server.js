import { setDefaultResultOrder } from "dns";
setDefaultResultOrder("ipv4first");

import "dotenv/config";
import { connectDb } from "./database/connectdb.js";
import App from "./app.js";
import Logger from "./config/logger.config.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
      try {
            await connectDb();

            App.on("error", (err) => {
                  console.error("Failed to start server:", err);
                  Logger.error("Failed to start server", { error: err.message });
                  process.exit(1);
            });

            App.listen(PORT, () => {
                  console.log(`Server running on http://localhost:${PORT}`);
                  Logger.info(`Server running on http://localhost:${PORT}`);
            });

      } catch (error) {
            console.error("Server startup failed:", error);
            Logger.error("Server startup failed", { error: error.message });
            process.exit(1);
      }
};

startServer();