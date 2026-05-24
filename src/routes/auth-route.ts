import { Elysia, t } from "elysia";
import { AuthService } from "../services/auth-service";

export const authRoutes = new Elysia()
  // Endpoint untuk login user
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
  
  // Endpoint untuk logout user
  .delete(
    "/api/users/logout",
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

        // Ekstrak token dari header
        const token = authHeader.substring(7);
        
        // Jalankan proses logout
        const result = await AuthService.logout(token);
        
        return {
          data: result,
        };
      } catch (error: any) {
        // Jika token tidak valid, kembalikan 401 Unauthorized
        set.status = 401;
        return {
          error: "Unauthorized",
        };
      }
    }
  );
