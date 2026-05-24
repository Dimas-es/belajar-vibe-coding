import { Elysia } from "elysia";
import { UserService } from "../services/user-service";

export const authMiddleware = new Elysia({ name: "middleware.auth" })
  .onError({ as: "scoped" }, ({ error, set }) => {
    if (error instanceof Error && error.message === "Unauthorized") {
      set.status = 401;
      return {
        error: "Unauthorized",
      };
    }
  })
  // Ekstrak dan validasi token dari header
  .derive({ as: "scoped" }, async ({ headers, set }) => {
    const authHeader = headers["authorization"];
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      set.status = 401;
      throw new Error("Unauthorized");
    }

    const token = authHeader.substring(7);
    const user = await UserService.getCurrentUser(token);

    return {
      user,
      token,
    };
  });
