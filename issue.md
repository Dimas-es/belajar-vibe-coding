# Rencana Implementasi Fitur Logout User

Dokumen ini berisi panduan dan instruksi bertahap (step-by-step) untuk mengimplementasikan fitur logout user. Instruksi ini dirancang agar dapat diikuti dengan mudah oleh programmer junior atau model AI.

## 1. Implementasi Logic Bisnis (Service Layer)
Pada file `src/services/auth-service.ts`, tambahkan fungsi baru yang menangani logika logout user:
- **Validasi Token:** Terima parameter `token` (string). Cari token tersebut di tabel `sessions`.
- **Error Handling:** Jika token tidak ditemukan di tabel `sessions`, kembalikan error atau throw error dengan pesan `"Unauthorized"`.
- **Hapus Session:** Jika token ditemukan, hapus record session tersebut dari tabel `sessions` di database.
- **Return:** Kembalikan `"OK"` jika berhasil.

## 2. Implementasi Endpoint (Route Layer)
Pada file `src/routes/auth-route.ts`, tambahkan endpoint baru:
- Definisikan endpoint: `DELETE /api/users/logout`.
- Endpoint ini memerlukan header `Authorization` dengan format `Bearer <token>`.
- Parsing header `Authorization`:
  - Ambil nilai header `Authorization` dari request.
  - Pastikan header diawali dengan `Bearer `.
  - Ekstrak token dari header (bagian setelah `Bearer `).
  - Jika header tidak ada atau format tidak valid, langsung kembalikan error `"Unauthorized"`.
- Panggil fungsi logout dari `auth-service.ts` dengan token yang sudah diekstrak.
- Pastikan endpoint ini mengeluarkan Response Body sesuai spesifikasi berikut:

  **Header Request yang dibutuhkan:**
  ```
  Authorization: Bearer <token>
  ```

  **Format Response Body (Jika Sukses Logout):**
  ```json
  {
      "data": "OK"
  }
  ```
  Jika sukses logout, data session dengan token tersebut harus sudah terhapus dari database.

  **Format Response Body (Jika Gagal / Token Tidak Valid):**
  ```json
  {
      "error": "Unauthorized"
  }
  ```
  Kembalikan HTTP status code `401` untuk respons error ini.

## 3. Pengujian Fitur
- Jalankan server lokal aplikasi.
- **Skenario sukses:** Kirim request `DELETE /api/users/logout` dengan header `Authorization: Bearer <token_valid>`. Pastikan kembalian berupa `{"data": "OK"}` dan pastikan record session dengan token tersebut sudah tidak ada lagi di tabel `sessions`.
- **Skenario gagal (tanpa header):** Kirim request tanpa header `Authorization`. Pastikan kembalian berupa `{"error": "Unauthorized"}` dengan status `401`.
- **Skenario gagal (token salah):** Kirim request dengan token yang tidak ada di tabel `sessions`. Pastikan kembalian berupa `{"error": "Unauthorized"}` dengan status `401`.

---
**Catatan untuk Implementator:**
Kerjakan instruksi di atas secara berurutan. Pisahkan tanggung jawab antara *Routes* dengan *Services*. Jangan mencampur aduk query database ke dalam file routing. Gunakan file-file yang sudah ada (`auth-route.ts`, `auth-service.ts`, `user-route.ts`) sebagai referensi pola kode.
