const express = require("express");
const cors = require("cors");

const app = express();

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Backend healthy",
  });
});

const prisma = require("./config/db");

console.log("PRISMA LOADED");

console.log("LOAD STUDENT ROUTES");
const studentRoutes = require("./routes/student.routes");

console.log("LOAD GURU ROUTES");
const guruRoutes = require("./routes/guru.routes");

console.log("LOAD KELAS ROUTES");
const kelasRoutes = require("./routes/kelas.routes");

console.log("LOAD MAPEL ROUTES");
const mapelRoutes = require("./routes/mapel.routes");

console.log("LOAD SEMESTER ROUTES");
const semesterRoutes = require("./routes/semester.routes");

console.log("LOAD TAHUN AJARAN ROUTES");
const tahunAjaranRoutes = require("./routes/tahunAjaran.routes");

console.log("LOAD NILAI ROUTES");
const nilaiRoutes = require("./routes/nilai.routes");

console.log("LOAD ABSENSI ROUTES");
const absensiRoutes = require("./routes/absensi.routes");

console.log("LOAD SPK ROUTES");
const spkRoutes = require("./routes/spk.routes");

//console.log("LOAD REPORT ROUTES");
//const reportRoutes = require("./routes/report.routes");

console.log("LOAD AUTH ROUTES");
const authRoutes = require("./routes/auth.routes");

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "OK",
    uptime: process.uptime(),
  });
});

app.get("/health/db", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    res.status(200).json({
      success: true,
      message: "Database connected",
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      message: "Database unavailable",
      error: error.message,
    });
  }
});

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "SIAKAD Backend Running",
  });
});

app.get("/api", (req, res) => {
  res.json({
    success: true,
    message: "SIAKAD API Running",
  });
});

app.get("/test-db", async (req, res) => {
  try {
    const siswa = await prisma.siswa.findMany({
      include: {
        kelas: true,
      },
    });

    res.json({
      success: true,
      data: siswa,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

app.use("/api/students", studentRoutes);
app.use("/api/guru", guruRoutes);
app.use("/api/kelas", kelasRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/mapel", mapelRoutes);
app.use("/api/semester", semesterRoutes);
app.use("/api/tahun-ajaran", tahunAjaranRoutes);
app.use("/api/nilai", nilaiRoutes);
app.use("/api/absensi", absensiRoutes);
app.use("/api/spk-bantuan", spkRoutes);
app.use("/api/reports", reportRoutes);

module.exports = app;
