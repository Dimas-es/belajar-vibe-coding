import { Elysia, t } from "elysia";
import { UserService } from "../services/user-service";
import { authMiddleware } from "../middleware/auth";

export const userRoutes = new Elysia()
  // Endpoint untuk registrasi user baru (Tanpa autentikasi)
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
  )
  
  // Terapkan middleware autentikasi untuk rute-rute di bawah ini
  .use(authMiddleware)
  
  // Endpoint untuk mendapatkan data user saat ini yang sedang login (Dengan autentikasi)
  .get(
    "/api/users/current",
    async ({ user }) => {
      return {
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          created_at: user.createdAt,
        },
      };
    }
  );
