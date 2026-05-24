import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { userRoutes } from "./src/routes/user-route";
import { authRoutes } from "./src/routes/auth-route";

export const app = new Elysia()
  // Tambahkan dokumentasi API Swagger
  .use(
    swagger({
      documentation: {
        info: {
          title: "Belajar Vibe Coding — Backend API",
          version: "1.0.0",
          description: "Dokumentasi API interaktif untuk registrasi, login, logout, dan manajemen session user.",
        },
        tags: [
          { name: "User", description: "Endpoint manajemen profil dan registrasi user" },
          { name: "Auth", description: "Endpoint autentikasi user (Login dan Logout)" },
        ],
        components: {
          securitySchemes: {
            bearerAuth: {
              type: "http",
              scheme: "bearer",
              bearerFormat: "UUID",
            },
          },
        },
      },
    })
  )
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