
import app from "./app";
import { env } from "./config/env";

app.listen(env.PORT, () => {
  console.log(
    `API Sentinel running in ${env.NODE_ENV} mode on port ${env.PORT}`
  );
});
