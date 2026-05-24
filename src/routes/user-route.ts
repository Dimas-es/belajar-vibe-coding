import { Elysia, t } from "elysia";
import { UserService } from "../services/user-service";

export const userRoutes = new Elysia()
  .post(
    "/api/users",
    async ({ body, set }) => {
      try {
        const result = await UserService.register(body.name, body.email, body.password);
        
        // Response body (success): { "data": "OK" }
        return {
          data: result,
        };
      } catch (error: any) {
        // Jika ada kesalahan (seperti email duplikat), kembalikan respons error
        set.status = 400;
        
        // Response body (error): { "error": "Email sudah terdaftar" }
        return {
          error: error.message || "Terjadi kesalahan internal",
        };
      }
    },
    {
      body: t.Object({
        name: t.String(),
        email: t.String(), // Menggunakan t.String biasa agar kompatibel dengan email mock seperti "dimas@localhost"
        password: t.String(),
      }),
    }
  );
