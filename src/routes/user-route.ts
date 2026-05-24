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
        
        let errorMessage = "Terjadi kesalahan saat memproses permintaan Anda";
        
        // Hanya ekspos pesan error yang aman (yang berasal dari logic bisnis kita)
        if (error instanceof Error && error.message === "Email sudah terdaftar") {
          errorMessage = error.message;
        }
        
        return {
          error: errorMessage,
        };
      }
    },
    {
      body: t.Object({
        name: t.String({ minLength: 1, maxLength: 255 }),
        email: t.String({ minLength: 1, maxLength: 255 }), // Menggunakan t.String biasa agar kompatibel dengan email mock seperti "dimas@localhost"
        password: t.String({ minLength: 6, maxLength: 255 }),
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
