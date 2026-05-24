# Programer Zaman Now — Backend API

Backend REST API untuk manajemen user dan autentikasi, dibangun menggunakan **Bun**, **ElysiaJS**, **Drizzle ORM**, dan **PostgreSQL**.

---

## Teknologi & Library

| Teknologi | Versi | Keterangan |
|-----------|-------|------------|
| [Bun](https://bun.sh) | 1.3.x | JavaScript runtime (pengganti Node.js) |
| [ElysiaJS](https://elysiajs.com) | ^1.4.28 | Web framework untuk Bun |
| [Drizzle ORM](https://orm.drizzle.team) | ^0.45.2 | TypeScript ORM untuk PostgreSQL |
| [postgres](https://github.com/porsager/postgres) | ^3.4.9 | PostgreSQL driver |
| [Drizzle Kit](https://orm.drizzle.team/kit-docs/overview) | ^0.31.10 | CLI untuk migrasi database |
| TypeScript | ^5 | Bahasa pemrograman |

---

## Arsitektur & Struktur Folder

```
programer-zaman-now/
├── index.ts                 # Entry point aplikasi (server ElysiaJS)
├── drizzle.config.ts        # Konfigurasi Drizzle Kit (migrasi DB)
├── package.json
├── tsconfig.json
├── .env                     # Variabel environment lokal (tidak di-commit)
├── .env.example             # Template variabel environment
│
├── src/
│   ├── db/
│   │   ├── index.ts         # Koneksi database PostgreSQL via Drizzle
│   │   └── schema.ts        # Definisi skema tabel (users, sessions)
│   │
│   ├── middleware/
│   │   └── auth.ts          # Middleware autentikasi Bearer token
│   │
│   ├── routes/
│   │   ├── user-route.ts    # Rute: registrasi & get current user
│   │   └── auth-route.ts    # Rute: login & logout
│   │
│   └── services/
│       ├── user-service.ts  # Logic bisnis: registrasi, get current user
│       └── auth-service.ts  # Logic bisnis: login, logout
│
├── tests/
│   ├── api.test.ts          # Unit test untuk semua endpoint API
│   └── helpers.ts           # Fungsi pembantu (pembersihan database)
│
└── drizzle/                 # File migrasi SQL yang di-generate
    ├── 0000_*.sql
    ├── 0001_*.sql
    ├── 0002_*.sql
    └── meta/                # Metadata & snapshot migrasi
```

### Konvensi Penamaan File

| Folder | Format Nama | Contoh |
|--------|-------------|--------|
| `src/routes/` | `[fitur]-route.ts` | `user-route.ts`, `auth-route.ts` |
| `src/services/` | `[fitur]-service.ts` | `user-service.ts`, `auth-service.ts` |
| `src/middleware/` | `[nama].ts` | `auth.ts` |
| `tests/` | `[nama].test.ts` | `api.test.ts` |

### Alur Request

```
Client Request
  → ElysiaJS Router (routes/)
    → [opsional] Auth Middleware (middleware/auth.ts)
      → Service Layer (services/)
        → Drizzle ORM (db/)
          → PostgreSQL
```

---

## Skema Database

### Tabel `users`

| Kolom | Tipe | Constraint | Keterangan |
|-------|------|------------|------------|
| `id` | `serial` | `PRIMARY KEY` | ID auto-increment |
| `name` | `varchar(255)` | `NOT NULL` | Nama user |
| `email` | `varchar(255)` | `NOT NULL`, `UNIQUE` | Email user (unik) |
| `password` | `varchar(255)` | `NOT NULL` | Hash password (bcrypt) |
| `created_at` | `timestamp` | `NOT NULL`, `DEFAULT NOW()` | Waktu registrasi |

### Tabel `sessions`

| Kolom | Tipe | Constraint | Keterangan |
|-------|------|------------|------------|
| `id` | `serial` | `PRIMARY KEY` | ID auto-increment |
| `token` | `varchar(255)` | `NOT NULL`, `UNIQUE` | Token session (UUID) |
| `user_id` | `integer` | `NOT NULL`, `FK → users.id` | Relasi ke tabel users |
| `created_at` | `timestamp` | `NOT NULL`, `DEFAULT NOW()` | Waktu login |

---

## API Endpoints

### 1. Registrasi User

```
POST /api/users
```

**Request Body:**
```json
{
  "name": "Dimas",
  "email": "dimas@localhost",
  "password": "password123"
}
```

**Validasi:**
- `name`: wajib, 1–255 karakter
- `email`: wajib, 1–255 karakter
- `password`: wajib, 6–255 karakter

**Response Sukses (200):**
```json
{ "data": "OK" }
```

**Response Error (400) — Email duplikat:**
```json
{ "error": "Email sudah terdaftar" }
```

---

### 2. Login User

```
POST /api/login
```

**Request Body:**
```json
{
  "email": "dimas@localhost",
  "password": "password123"
}
```

**Response Sukses (200):**
```json
{ "data": "550e8400-e29b-41d4-a716-446655440000" }
```

**Response Error (400) — Kredensial salah:**
```json
{ "error": "Email atau password salah" }
```

---

### 3. Get Current User

```
GET /api/users/current
```

**Header:**
```
Authorization: Bearer <token>
```

**Response Sukses (200):**
```json
{
  "data": {
    "id": 1,
    "name": "Dimas",
    "email": "dimas@localhost",
    "created_at": "2026-05-24T07:00:00.000Z"
  }
}
```

**Response Error (401) — Token tidak valid:**
```json
{ "error": "Unauthorized" }
```

---

### 4. Logout User

```
DELETE /api/users/logout
```

**Header:**
```
Authorization: Bearer <token>
```

**Response Sukses (200):**
```json
{ "data": "OK" }
```

**Response Error (401) — Token tidak valid:**
```json
{ "error": "Unauthorized" }
```

---

## Setup Project

### Prasyarat

- [Bun](https://bun.sh) v1.3 atau lebih baru
- [PostgreSQL](https://www.postgresql.org/) yang sudah berjalan

### Langkah-langkah

1. **Clone repository:**
   ```bash
   git clone https://github.com/Dimas-es/belajar-vibe-coding.git
   cd belajar-vibe-coding
   ```

2. **Install dependencies:**
   ```bash
   bun install
   ```

3. **Konfigurasi environment:**
   ```bash
   cp .env.example .env
   ```
   Sesuaikan isi `.env` dengan koneksi database PostgreSQL Anda:
   ```
   DATABASE_URL="postgres://postgres:postgres@localhost:5432/programer_zaman_now"
   PORT=3000
   ```

4. **Buat database** (jika belum ada):
   ```sql
   CREATE DATABASE programer_zaman_now;
   ```

5. **Sinkronisasi skema database:**
   ```bash
   bun run db:push
   ```

---

## Menjalankan Aplikasi

### Mode Development (dengan hot-reload)
```bash
bun run dev
```

### Mode Production
```bash
bun run start
```

Server akan berjalan di `http://localhost:3000` (atau sesuai `PORT` di `.env`).

---

## Menjalankan Test

```bash
bun run test
```

Test suite mencakup **13 skenario** yang menguji seluruh endpoint API:
- Registrasi (sukses, validasi gagal, email duplikat)
- Login (sukses, password salah, email tidak terdaftar)
- Get Current User (sukses, tanpa token, token invalid)
- Logout (sukses, tanpa token, token invalid)

---

## Script Tersedia

| Script | Perintah | Keterangan |
|--------|----------|------------|
| `dev` | `bun run dev` | Jalankan server dengan hot-reload |
| `start` | `bun run start` | Jalankan server tanpa hot-reload |
| `test` | `bun run test` | Jalankan semua unit test |
| `db:generate` | `bun run db:generate` | Generate file migrasi SQL |
| `db:migrate` | `bun run db:migrate` | Jalankan migrasi database |
| `db:push` | `bun run db:push` | Push skema langsung ke database |
| `db:studio` | `bun run db:studio` | Buka Drizzle Studio (GUI database) |
