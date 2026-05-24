import { db } from "../src/db";
import { sessions, users } from "../src/db/schema";

/**
 * Membersihkan semua data di tabel sessions dan users secara berurutan.
 * Wajib dijalankan sebelum/sesudah pengujian untuk State yang konsisten.
 */
export async function cleanDatabase() {
  await db.delete(sessions);
  await db.delete(users);
}
