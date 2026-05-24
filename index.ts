import { Elysia, t } from "elysia";
import { db } from "./src/db";
import { users } from "./src/db/schema";

const app = new Elysia()
  // Decorate context with the Drizzle db instance
  .decorate("db", db)
  
  // Root endpoint to check status
  .get("/", () => {
    return {
      status: "online",
      message: "Server is running perfectly with Bun, ElysiaJS, and Drizzle ORM!",
      timestamp: new Date().toISOString(),
    };
  })

  // Grouped routes for /users
  .group("/users", (group) =>
    group
      // Get all users
      .get("/", async ({ db }) => {
        try {
          const allUsers = await db.select().from(users);
          return {
            success: true,
            data: allUsers,
          };
        } catch (error: any) {
          return {
            success: false,
            message: "Failed to fetch users. Make sure your database is running and migrated.",
            error: error.message,
          };
        }
      })
      // Create a new user
      .post(
        "/",
        async ({ db, body }) => {
          try {
            const newUser = await db
              .insert(users)
              .values({
                name: body.name,
                email: body.email,
              })
              .returning();
            
            return {
              success: true,
              data: newUser[0],
            };
          } catch (error: any) {
            return {
              success: false,
              message: "Failed to create user.",
              error: error.message,
            };
          }
        },
        {
          body: t.Object({
            name: t.String(),
            email: t.String({ format: "email" }),
          }),
        }
      )
  )
  .listen(3000);

console.log(
  `🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`
);