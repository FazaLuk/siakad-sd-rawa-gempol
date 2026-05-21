const { getReportByType } = require("../services/report.service");
const { exportReport } = require("../services/reportExport.service");

function sendExportFile(res, payload) {
  res.setHeader("Content-Type", payload.contentType);
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${payload.fileName}"`
  );

  return res.send(payload.buffer);
}

async function getGradesReport(req, res) {
  try {
    const data = await getReportByType("nilai", req.query);

    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Get grades report error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

async function getAttendanceReport(req, res) {
  try {
    const data = await getReportByType("kehadiran", req.query);

    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Get attendance report error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

async function getStudentsReport(req, res) {
  try {
    const data = await getReportByType("siswa", req.query);

    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Get students report error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

async function getSpkReport(req, res) {
  try {
    const data = await getReportByType("bantuan", req.query);

    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Get SPK report error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

async function exportGradesReport(req, res) {
  try {
    const format = String(req.query.format || "xlsx").toLowerCase();
    const payload = await exportReport("nilai", req.query, format);

    return sendExportFile(res, payload);
  } catch (error) {
    console.error("Export grades report error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

async function exportAttendanceReport(req, res) {
  try {
    const format = String(req.query.format || "xlsx").toLowerCase();
    const payload = await exportReport("kehadiran", req.query, format);

    return sendExportFile(res, payload);
  } catch (error) {
    console.error("Export attendance report error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

async function exportStudentsReport(req, res) {
  try {
    const format = String(req.query.format || "xlsx").toLowerCase();
    const payload = await exportReport("siswa", req.query, format);

    return sendExportFile(res, payload);
  } catch (error) {
    console.error("Export students report error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

async function exportSpkReport(req, res) {
  try {
    const format = String(req.query.format || "xlsx").toLowerCase();
    const payload = await exportReport("bantuan", req.query, format);

    return sendExportFile(res, payload);
  } catch (error) {
    console.error("Export SPK report error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

module.exports = {
  getGradesReport,
  getAttendanceReport,
  getStudentsReport,
  getSpkReport,
  exportGradesReport,
  exportAttendanceReport,
  exportStudentsReport,
  exportSpkReport,
};
