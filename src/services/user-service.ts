import { eq } from "drizzle-orm";
import { db } from "../db";
import { users } from "../db/schema";

export class UserService {
  /**
   * Mendaftarkan user baru ke dalam database.
   * @param name Nama user
   * @param email Email user (unik)
   * @param passwordPlain Password teks biasa yang akan di-hash
   * @returns "OK" jika berhasil
   * @throws Error jika email sudah terdaftar
   */
  static async register(name: string, email: string, passwordPlain: string): Promise<"OK"> {
    // 1. Cek apakah email sudah terdaftar
    const existingUser = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      throw new Error("Email sudah terdaftar");
    }

    // 2. Hash password menggunakan bcrypt bawaan Bun.password
    const hashedPassword = await Bun.password.hash(passwordPlain, {
      algorithm: "bcrypt",
      cost: 10,
    });

    // 3. Simpan data user baru ke database
    await db.insert(users).values({
      name,
      email,
      password: hashedPassword,
    });

    return "OK";
  }
}
