const express = require("express");
const cors = require("cors");

const app = express();

const prisma = require("./config/db");

const studentRoutes = require("./routes/student.routes");

const guruRoutes = require("./routes/guru.routes");

const kelasRoutes = require("./routes/kelas.routes");

const mapelRoutes = require("./routes/mapel.routes");

const semesterRoutes = require("./routes/semester.routes");

const tahunAjaranRoutes = require("./routes/tahunAjaran.routes");

const nilaiRoutes = require("./routes/nilai.routes");

const absensiRoutes = require("./routes/absensi.routes");

const spkRoutes = require("./routes/spk.routes");

const reportRoutes = require("./routes/report.routes");

const authRoutes = require("./routes/auth.routes");
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

app.use(cors());
app.use(express.json());

app.use("/api/students", studentRoutes);

app.use("/api/guru", guruRoutes);

app.use("/api/kelas", kelasRoutes);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "SIAKAD Backend API Running",
  });
});

app.use("/api/auth", authRoutes);

app.use("/api/mapel", mapelRoutes);

app.use("/api/semester", semesterRoutes);

app.use("/api/tahun-ajaran", tahunAjaranRoutes);

app.use("/api/nilai", nilaiRoutes);

app.use("/api/absensi", absensiRoutes);

app.use("/api/spk-bantuan", spkRoutes);

app.use("/api/reports", reportRoutes);

app.get("/api", (req, res) => {
  res.json({
    success: true,
    message: "SIAKAD API Running",
  });
});

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "SIAKAD Backend Running",
  });
});

module.exports = app;
