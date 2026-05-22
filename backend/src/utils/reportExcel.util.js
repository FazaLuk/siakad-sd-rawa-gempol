const path = require("path");
const fs = require("fs");
const ExcelJS = require("exceljs");

const kopEndRow = 8;
const reportTitleRow = 10;
const reportInfoStartRow = 12;
const tableHeaderRow = 15;

const logoPath = path.join(
  __dirname,
  "../../../frontend/assets/images/logo_kab_tng.png",
);

const defaultLogoUrl = process.env.REPORT_LOGO_URL || "";

const reportTypeConfig = {
  nilai: {
    title: "Laporan Nilai",
    sheetName: "Laporan Nilai",
    fileNamePrefix: "laporan-nilai",
    headers: [
      "No",
      "Nama Siswa",
      "Kelas",
      "Mata Pelajaran",
      "Tugas",
      "UTS",
      "UAS",
      "Rata-rata",
    ],
    mapRows: (rows) =>
      rows.map((item, index) => [
        index + 1,
        item.studentName,
        item.className,
        item.subject,
        item.taskScore,
        item.utsScore,
        item.uasScore,
        item.averageScore,
      ]),
  },
  kehadiran: {
    title: "Laporan Kehadiran",
    sheetName: "Laporan Kehadiran",
    fileNamePrefix: "laporan-kehadiran",
    headers: ["No", "Nama Siswa", "Kelas", "Tanggal", "Status"],
    mapRows: (rows) =>
      rows.map((item, index) => [
        index + 1,
        item.studentName,
        item.className,
        item.date,
        item.status,
      ]),
  },
  siswa: {
    title: "Laporan Data Siswa",
    sheetName: "Laporan Siswa",
    fileNamePrefix: "laporan-siswa",
    headers: [
      "No",
      "NISN",
      "Nama Siswa",
      "Kelas",
      "Jenis Kelamin",
      "Penghasilan Orang Tua",
      "Status Rumah",
    ],
    mapRows: (rows) =>
      rows.map((item, index) => [
        index + 1,
        item.nisn || "-",
        item.name,
        item.className,
        item.gender || "-",
        item.income || "-",
        item.house || "-",
      ]),
  },
  bantuan: {
    title: "Laporan SPK Bantuan",
    sheetName: "Laporan SPK",
    fileNamePrefix: "laporan-spk",
    headers: [
      "Ranking",
      "Nama Siswa",
      "Kelas",
      "Penghasilan Orang Tua",
      "Status Rumah",
      "Skor Akhir",
      "Status Bantuan",
    ],
    mapRows: (rows) =>
      rows.map((item) => [
        item.ranking,
        item.name,
        item.className,
        item.income || "-",
        item.house || "-",
        item.bantuanScore,
        item.bantuanStatus,
      ]),
  },
};

function getColumnLetter(columnNumber) {
  let letter = "";
  let currentNumber = columnNumber;

  while (currentNumber > 0) {
    const remainder = (currentNumber - 1) % 26;

    letter = String.fromCharCode(65 + remainder) + letter;
    currentNumber = Math.floor((currentNumber - 1) / 26);
  }

  return letter;
}

function getExportFileName(prefix, className, extension = "xlsx") {
  const classSlug = String(className || "kelas")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[\\/:*?"<>|]+/g, "-");

  return `${prefix}-kelas-${classSlug}.${extension}`;
}

async function getLogoImageBuffer(logoUrl) {
  const publicLogoUrl = logoUrl || defaultLogoUrl;

  if (publicLogoUrl) {
    try {
      const response = await fetch(publicLogoUrl);

      if (response.ok) {
        return Buffer.from(await response.arrayBuffer());
      }
    } catch (error) {
      console.error("Fetch logo laporan error:", error);
    }
  }

  if (fs.existsSync(logoPath)) {
    return fs.readFileSync(logoPath);
  }

  return null;
}

async function applySchoolLetterhead(workbook, worksheet, logoUrl) {
  const logoBuffer = await getLogoImageBuffer(logoUrl);

  if (logoBuffer) {
    const logoImageId = workbook.addImage({
      buffer: logoBuffer,
      extension: "png",
    });

    worksheet.addImage(logoImageId, {
      tl: { col: 0.2, row: 1.2 },
      ext: {
        width: 140,
        height: 140,
      },
    });
  }

  const kopRows = [
    {
      row: 2,
      text: "PEMERINTAH KABUPATEN TANGERANG",
      size: 14,
      bold: true,
    },
    { row: 3, text: "DINAS PENDIDIKAN", size: 14, bold: true },
    { row: 4, text: "SD N RAWA GEMPOL", size: 14, bold: true },
    {
      row: 5,
      text: "NPSN:20602847, NSS:101280318010",
      size: 14,
      bold: true,
    },
    {
      row: 6,
      text: "Jl. Gaga Kecil, Gempol Sari, Kec. Sepatan Timur., Kab. Tangerang",
      size: 10,
      italic: true,
    },
    {
      row: 7,
      text: "Kode Pos (15521) Email: sdrawagempol@gmail.com",
      size: 10,
      italic: true,
    },
  ];

  kopRows.forEach((item) => {
    worksheet.mergeCells(`C${item.row}:H${item.row}`);
    worksheet.getCell(`C${item.row}`).value = item.text;
    worksheet.getCell(`C${item.row}`).font = {
      name: "Times New Roman",
      size: item.size,
      bold: Boolean(item.bold),
      italic: Boolean(item.italic),
    };
    worksheet.getCell(`C${item.row}`).alignment = {
      horizontal: "center",
      vertical: "middle",
    };
  });

  for (let column = 1; column <= 8; column++) {
    worksheet.getCell(`${getColumnLetter(column)}${kopEndRow}`).border = {
      bottom: { style: "double" },
    };
  }
}

function applyWorksheetLayout(worksheet, columnCount) {
  const layoutColumnCount = Math.max(columnCount, 8);
  const tableLastColumn = getColumnLetter(columnCount);
  const reportLastColumn = getColumnLetter(layoutColumnCount);

  worksheet.columns = Array.from({ length: layoutColumnCount }, (_, index) => ({
    width: index === 0 ? 10 : 24,
  }));

  worksheet.getColumn(1).width = 8;
  worksheet.getColumn(2).width = 18;

  for (let rowNumber = 1; rowNumber <= tableHeaderRow; rowNumber++) {
    worksheet.getRow(rowNumber).height = 20;
  }

  worksheet.mergeCells(
    `A${reportTitleRow}:${reportLastColumn}${reportTitleRow}`,
  );
  worksheet.getRow(reportTitleRow).height = 24;
  worksheet.getCell(`A${reportTitleRow}`).alignment = {
    horizontal: "center",
    vertical: "middle",
  };
  worksheet.getCell(`A${reportTitleRow}`).font = {
    name: "Times New Roman",
    bold: true,
    size: 14,
  };

  worksheet.mergeCells(`A${reportInfoStartRow}:B${reportInfoStartRow}`);
  worksheet.mergeCells(
    `C${reportInfoStartRow}:${reportLastColumn}${reportInfoStartRow}`,
  );
  worksheet.mergeCells(`A${reportInfoStartRow + 1}:B${reportInfoStartRow + 1}`);
  worksheet.mergeCells(
    `C${reportInfoStartRow + 1}:${reportLastColumn}${reportInfoStartRow + 1}`,
  );

  [reportInfoStartRow, reportInfoStartRow + 1].forEach((rowNumber) => {
    worksheet.getRow(rowNumber).eachCell((cell) => {
      cell.font = { name: "Times New Roman", size: 11 };
      cell.alignment = { vertical: "middle" };
    });
  });

  worksheet.getRow(tableHeaderRow).height = 22;
  worksheet.getRow(tableHeaderRow).eachCell((cell) => {
    cell.font = { name: "Times New Roman", bold: true };
    cell.alignment = { horizontal: "center", vertical: "middle" };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFEFF6FF" },
    };
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
  });

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber <= tableHeaderRow) return;

    row.eachCell((cell) => {
      cell.alignment = { vertical: "middle" };
      cell.font = { name: "Times New Roman", size: 11 };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });
  });

  worksheet.autoFilter = {
    from: `A${tableHeaderRow}`,
    to: `${tableLastColumn}${tableHeaderRow}`,
  };
}

async function buildReportWorkbook(reportType, meta, rows, options = {}) {
  const config = reportTypeConfig[reportType];

  if (!config) {
    throw new Error("Konfigurasi export laporan tidak ditemukan");
  }

  const workbook = new ExcelJS.Workbook();

  const worksheet = workbook.addWorksheet(config.sheetName);

  worksheet.views = [
    {
      showGridLines: false,
    },
  ];

  worksheet.pageSetup = {
    paperSize: 9,
    orientation: "landscape",
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight: 0,
  };
  const exportRows = config.mapRows(rows);

  worksheet.getCell(`A${reportTitleRow}`).value = config.title;
  worksheet.getCell(`A${reportInfoStartRow}`).value = "Wali Kelas";
  worksheet.getCell(`C${reportInfoStartRow}`).value =
    `: ${meta?.wali_kelas || "-"}`;
  worksheet.getCell(`A${reportInfoStartRow + 1}`).value = "Nama Kelas";
  worksheet.getCell(`C${reportInfoStartRow + 1}`).value =
    `: ${meta?.nama_kelas || "-"}`;
  worksheet.getRow(tableHeaderRow).values = config.headers;

  exportRows.forEach((row, index) => {
    worksheet.getRow(tableHeaderRow + index + 1).values = row;
  });

  applyWorksheetLayout(worksheet, config.headers.length);
  await applySchoolLetterhead(workbook, worksheet, options.logoUrl);

  return {
    workbook,
    fileName: getExportFileName(
      config.fileNamePrefix,
      meta?.nama_kelas || "kelas",
    ),
  };
}

async function writeWorkbookToBuffer(workbook) {
  return workbook.xlsx.writeBuffer();
}

module.exports = {
  reportTypeConfig,
  buildReportWorkbook,
  writeWorkbookToBuffer,
  getExportFileName,
  logoPath,
};
