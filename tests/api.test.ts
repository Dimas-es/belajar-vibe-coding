import { describe, expect, it, beforeEach } from "bun:test";
import { app } from "../index";
import { cleanDatabase } from "./helpers";
import { db } from "../src/db";
import { users, sessions } from "../src/db/schema";
import { eq } from "drizzle-orm";

describe("API Integration Tests", () => {
  beforeEach(async () => {
    // Bersihkan database sebelum setiap skenario tes dijalankan
    await cleanDatabase();
  });

  describe("POST /api/users (Register)", () => {
    it("should successfully register a new user with valid data", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Dimas",
            email: "dimas@localhost",
            password: "password123",
          }),
        })
      );

      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json).toEqual({ data: "OK" });

      // Verifikasi data masuk ke DB
      const user = await db
        .select()
        .from(users)
        .where(eq(users.email, "dimas@localhost"))
        .limit(1);
      expect(user.length).toBe(1);
      expect(user[0].name).toBe("Dimas");
    });

    it("should fail validation if missing fields", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Dimas",
            // missing email
            password: "password123",
          }),
        })
      );

      expect(response.status).toBe(422);
    });

    it("should fail validation if name exceeds 255 characters", async () => {
      const longName = "A".repeat(300);
      const response = await app.handle(
        new Request("http://localhost/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: longName,
            email: "longname@localhost",
            password: "password123",
          }),
        })
      );

      expect(response.status).toBe(422);
    });

    it("should fail if email is already registered", async () => {
      // Register user first
      await app.handle(
        new Request("http://localhost/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Dimas",
            email: "dimas@localhost",
            password: "password123",
          }),
        })
      );

      // Register again with same email
      const response = await app.handle(
        new Request("http://localhost/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Dimas Baru",
            email: "dimas@localhost",
            password: "password456",
          }),
        })
      );

      expect(response.status).toBe(400);
      const json = await response.json();
      expect(json).toEqual({ error: "Email sudah terdaftar" });
    });
  });

  describe("POST /api/login (Login)", () => {
    beforeEach(async () => {
      // Buat user untuk testing login
      await app.handle(
        new Request("http://localhost/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Dimas",
            email: "dimas@localhost",
            password: "password123",
          }),
        })
      );
    });

    it("should login successfully with correct credentials", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "dimas@localhost",
            password: "password123",
          }),
        })
      );

      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.data).toBeDefined();
      expect(typeof json.data).toBe("string");

      // Cek session terbuat di DB
      const session = await db
        .select()
        .from(sessions)
        .where(eq(sessions.token, json.data))
        .limit(1);
      expect(session.length).toBe(1);
    });

    it("should fail login with incorrect password", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "dimas@localhost",
            password: "wrongpassword",
          }),
        })
      );

      expect(response.status).toBe(400);
      const json = await response.json();
      expect(json).toEqual({ error: "Email atau password salah" });
    });

    it("should fail login with non-existent email", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "doesnotexist@localhost",
            password: "password123",
          }),
        })
      );

      expect(response.status).toBe(400);
      const json = await response.json();
      expect(json).toEqual({ error: "Email atau password salah" });
    });
  });

  describe("GET /api/users/current (Get Current User)", () => {
    let token: string;

    beforeEach(async () => {
      // Register
      await app.handle(
        new Request("http://localhost/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Dimas",
            email: "dimas@localhost",
            password: "password123",
          }),
        })
      );

      // Login
      const loginRes = await app.handle(
        new Request("http://localhost/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "dimas@localhost",
            password: "password123",
          }),
        })
      );
      const loginJson = await loginRes.json();
      token = loginJson.data;
    });

    it("should successfully retrieve profile with valid token", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users/current", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
      );

      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.data).toBeDefined();
      expect(json.data.name).toBe("Dimas");
      expect(json.data.email).toBe("dimas@localhost");
      expect(json.data.password).toBeUndefined(); // password harus disembunyikan
    });

    it("should fail with 401 if token is missing", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users/current", {
          method: "GET",
        })
      );

      expect(response.status).toBe(401);
      const json = await response.json();
      expect(json).toEqual({ error: "Unauthorized" });
    });

    it("should fail with 401 if token is invalid", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users/current", {
          method: "GET",
          headers: {
            Authorization: "Bearer invalidtoken123",
          },
        })
      );

      expect(response.status).toBe(401);
      const json = await response.json();
      expect(json).toEqual({ error: "Unauthorized" });
    });
  });

  describe("DELETE /api/users/logout (Logout)", () => {
    let token: string;

    beforeEach(async () => {
      // Register
      await app.handle(
        new Request("http://localhost/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Dimas",
            email: "dimas@localhost",
            password: "password123",
          }),
        })
      );

      // Login
      const loginRes = await app.handle(
        new Request("http://localhost/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "dimas@localhost",
            password: "password123",
          }),
        })
      );
      const loginJson = await loginRes.json();
      token = loginJson.data;
    });

    it("should successfully logout and delete session with valid token", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users/logout", {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
      );

      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json).toEqual({ data: "OK" });

      // Pastikan session sudah terhapus di DB
      const session = await db
        .select()
        .from(sessions)
        .where(eq(sessions.token, token))
        .limit(1);
      expect(session.length).toBe(0);
    });

    it("should fail logout with 401 if token is missing", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users/logout", {
          method: "DELETE",
        })
      );

      expect(response.status).toBe(401);
      const json = await response.json();
      expect(json).toEqual({ error: "Unauthorized" });
    });

    it("should fail logout with 401 if token is invalid", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users/logout", {
          method: "DELETE",
          headers: {
            Authorization: "Bearer invalidtoken123",
          },
        })
      );

      expect(response.status).toBe(401);
      const json = await response.json();
      expect(json).toEqual({ error: "Unauthorized" });
    });
  });
});
