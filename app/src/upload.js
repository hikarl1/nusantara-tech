const express = require("express");
const multer = require("multer");
const Minio = require("minio");
const router = express.Router();

// Koneksi ke MinIO — pakai service name 'minio' sesuai di docker-compose
const minioClient = new Minio.Client({
  endPoint: "minio",
  port: 9000,
  useSSL: false,
  accessKey: process.env.MINIO_ROOT_USER,
  secretKey: process.env.MINIO_ROOT_PASSWORD,
});

const BUCKET = "uploads";
const upload = multer({ storage: multer.memoryStorage() });

// Memastikan bucket bernama "uploads" sudah otomatis terbuat di MinIO
minioClient.bucketExists(BUCKET, (err, exists) => {
  if (!exists) {
    minioClient.makeBucket(BUCKET, "", () => {
      console.log('Bucket "uploads" berhasil dibuat otomatis');
    });
  }
});

// Endpoint POST untuk menangani upload file tunggal
router.post("/upload", upload.single("file"), async (req, res) => {
  const file = req.file;
  if (!file) return res.status(400).json({ error: "Tidak ada file yang dipilih" });

  try {
    await minioClient.putObject(BUCKET, file.originalname, file.buffer, file.size);
    res.json({ message: "Upload berhasil", filename: file.originalname });
  } catch (error) {
    res.status(500).json({ error: "Gagal mengunggah file ke MinIO" });
  }
});

module.exports = router;