import { Elysia, t } from "elysia";
import { AuthService } from "../services/auth-service";
import { authMiddleware } from "../middleware/auth";

export const authRoutes = new Elysia()
  // Endpoint untuk login user (Tanpa autentikasi)
  .post(
    "/api/login",
    async ({ body, set }) => {
      try {
        const token = await AuthService.login(body.email, body.password);
        
        // Response body (success): { "data": "token" }
        return {
          data: token,
        };
      } catch (error: any) {
        // Jika email atau password salah, kembalikan status 400
        set.status = 400;
        
        // Response body (error): { "error": "Email atau password salah" }
        return {
          error: error.message || "Terjadi kesalahan internal",
        };
      }
    },
    {
      body: t.Object({
        email: t.String(),
        password: t.String(),
      }),
    }
  )
  
  // Terapkan middleware autentikasi untuk rute-rute di bawah ini
  .use(authMiddleware)
  
  // Endpoint untuk logout user (Dengan autentikasi)
  .delete(
    "/api/users/logout",
    async ({ token }) => {
      // Jalankan proses logout
      const result = await AuthService.logout(token);
      
      return {
        data: result,
      };
    }
  );
