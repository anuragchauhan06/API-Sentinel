import dns from "node:dns";
import app from "./app";
import { env } from "./config/env";
import { connectDatabase } from "./config/database";

dns.setServers(["192.168.100.1"]);

const startServer = async (): Promise<void> => {
  try {
    await connectDatabase();

    app.listen(env.PORT, () => {
      console.log(
        `API Sentinel running in ${env.NODE_ENV} mode on port ${env.PORT}`
      );
    });
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    process.exit(1);
  }
};

void startServer();