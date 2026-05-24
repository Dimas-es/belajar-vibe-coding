import { eq } from "drizzle-orm";
import { db } from "../db";
import { users, sessions } from "../db/schema";

export class AuthService {
  /**
   * Log masuk user dan buat session baru jika kredensial cocok.
   * @param email Email user
   * @param passwordPlain Password teks biasa
   * @returns Token session yang berupa UUID
   * @throws Error jika email tidak ditemukan atau password salah
   */
  static async login(email: string, passwordPlain: string): Promise<string> {
    // 1. Cari user berdasarkan email
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) {
      throw new Error("Email atau password salah");
    }

    // 2. Verifikasi password plaintext dengan hash yang ada di database
    const isPasswordValid = await Bun.password.verify(passwordPlain, user.password);
    if (!isPasswordValid) {
      throw new Error("Email atau password salah");
    }

    // 3. Generate token session berupa UUID
    const token = crypto.randomUUID();

    // 4. Simpan session baru ke database
    await db.insert(sessions).values({
      token,
      userId: user.id,
    });

    return token;
  }

  /**
   * Log keluar user dengan menghapus record session dari database.
   * @param token Token session UUID yang ingin dihapus
   * @returns "OK" jika berhasil
   * @throws Error "Unauthorized" jika token tidak ditemukan
   */
  static async logout(token: string): Promise<"OK"> {
    // 1. Validasi token di database
    const [session] = await db
      .select({ id: sessions.id })
      .from(sessions)
      .where(eq(sessions.token, token))
      .limit(1);

    if (!session) {
      throw new Error("Unauthorized");
    }

    // 2. Hapus session berdasarkan token
    await db.delete(sessions).where(eq(sessions.token, token));

    return "OK";
  }
}
