import { Elysia } from "elysia";
import { userRoutes } from "./src/routes/user-route";
import { authRoutes } from "./src/routes/auth-route";

const app = new Elysia()
  // Endpoint dasar (health check)
  .get("/", () => {
    return {
      status: "online",
      message: "Server is running perfectly with Bun, ElysiaJS, and Drizzle ORM!",
      timestamp: new Date().toISOString(),
    };
  })
  
  // Daftarkan rute manajemen user (termasuk POST /api/users)
  .use(userRoutes)
  
  // Daftarkan rute autentikasi (termasuk POST /api/login)
  .use(authRoutes)
  
  // Konfigurasi port dari environment variable (default 3000)
  .listen(Number(process.env.PORT) || 3000);

console.log(
  `🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`
);