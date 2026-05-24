import { Elysia, t } from "elysia";
import { UserService } from "../services/user-service";

export const userRoutes = new Elysia()
  // Endpoint untuk registrasi user baru
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
  
  // Endpoint untuk mendapatkan data user saat ini yang sedang login
  .get(
    "/api/users/current",
    async ({ headers, set }) => {
      try {
        const authHeader = headers["authorization"];
        
        // Validasi keberadaan header Authorization dengan format Bearer <token>
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
          set.status = 401;
          return {
            error: "Unauthorized",
          };
        }

        // Ekstrak token dari header (setelah string "Bearer ")
        const token = authHeader.substring(7);
        
        // Ambil data user saat ini berdasarkan token
        const user = await UserService.getCurrentUser(token);
        
        // Kembalikan respons sukses
        return {
          data: {
            id: user.id,
            name: user.name,
            email: user.email,
            created_at: user.createdAt,
          },
        };
      } catch (error: any) {
        // Jika token tidak valid atau ada kegagalan lain, kembalikan 401 Unauthorized
        set.status = 401;
        return {
          error: "Unauthorized",
        };
      }
    }
  );
