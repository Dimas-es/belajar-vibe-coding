import { Elysia } from "elysia";
import { db } from "./src/db";
import { userRoutes } from "./src/routes/user-route";

const app = new Elysia()
  // Integrasikan koneksi Drizzle ke dalam context Elysia
  .decorate("db", db)
  
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
  
  .listen(3000);

console.log(
  `🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`
);