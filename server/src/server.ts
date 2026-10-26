import app from "./app";
import { env } from "./config/env";

const PORT = env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server backend ATK berjalan di http://localhost:${PORT}`);
  console.log(`📍 Environment: ${env.NODE_ENV}`);
});
