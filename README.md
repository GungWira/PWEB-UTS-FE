# Pemira Web (Frontend)

Single Page Application React untuk sistem E-Voting Pilkades. Berkomunikasi dengan
`pemira-api` lewat REST API dan JWT. Tidak ada kode server di project ini.

## Menjalankan

```bash
npm install
cp .env.example .env     # arahkan VITE_API_URL ke pemira-api
npm run dev
```

## Konfigurasi

| Variabel | Keterangan |
|---|---|
| `VITE_API_URL` | Base URL API, contoh `http://localhost:8000/api/v1` |

## Struktur

```
src/
├── main.tsx                 Entry point, pasang Router + AuthProvider
├── App.tsx                  Daftar route
├── index.css                Tailwind + gaya konten rich text
├── lib/
│   ├── api.ts               Instance axios, penyisip token, helper error
│   └── utils.ts             Helper className
├── context/
│   └── auth-context.tsx     Status login, simpan JWT di localStorage
├── components/
│   ├── protected-route.tsx  Pembatas route per peran (voter/admin)
│   ├── theme-toggle.tsx     Mode terang/gelap
│   ├── rich-text-editor.tsx Editor visi & misi (TipTap)
│   ├── candidate-modal.tsx  Form tambah/edit paslon
│   ├── import-dpt-modal.tsx Impor DPT dari CSV, dua tahap
│   └── confirm-modal.tsx    Dialog konfirmasi aksi admin
└── pages/
    ├── login.tsx            Login pemilih (NIK + tanggal lahir)
    ├── dashboard.tsx        Dashboard pemilih
    ├── vote.tsx             Bilik suara + popup visi & misi
    ├── vote-success.tsx     Halaman setelah memilih
    ├── live-count.tsx       Perolehan suara publik
    ├── admin-login.tsx      Login admin
    └── admin-dashboard.tsx  Kelola DPT & paslon
```

## Route

| Path | Akses |
|---|---|
| `/login` | publik |
| `/live-count` | publik |
| `/admin/login` | publik |
| `/dashboard` | pemilih |
| `/vote` | pemilih |
| `/vote/success` | pemilih |
| `/admin/dashboard` | admin |
