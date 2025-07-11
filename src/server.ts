import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

const app = express();

// Contoh konfigurasi proxy
app.use('/api', createProxyMiddleware({
  target: '${process.env.NEXT_PUBLIC_VERCEL_FASTAPI_CLASSIFY}', // Ganti dengan base URL API Anda
  changeOrigin: true, // Mengizinkan perubahan origin
  secure: false, // Menonaktifkan validasi sertifikat SSL untuk permintaan dari server ke API (harus dipertimbangkan dengan hati-hati untuk produksi)
}));

// Endpoint dan middleware lainnya di sini

app.listen(3000, () => {
  console.log('Server berjalan di http://localhost:3000');
});
