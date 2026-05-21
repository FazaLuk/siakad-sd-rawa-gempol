const fs = require("fs");
const path = require("path");
const { reportTypeConfig } = require("./reportExcel.util");

const logoPath = path.join(
  __dirname,
  "../../../frontend/assets/images/logo_kab_tng.png"
);

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function getLogoDataUri() {
  if (!fs.existsSync(logoPath)) return "";

  const buffer = fs.readFileSync(logoPath);

  return `data:image/png;base64,${buffer.toString("base64")}`;
}

function buildTableHtml(reportType, rows) {
  const config = reportTypeConfig[reportType];
  const tableRows = config.mapRows(rows);

  const headerHtml = config.headers
    .map((header) => `<th>${escapeHtml(header)}</th>`)
    .join("");

  const bodyHtml = tableRows.length
    ? tableRows
        .map(
          (row) => `
            <tr>
              ${row
                .map(
                  (cell, index) =>
                    `<td class="${index === 0 ? "text-center" : ""}">${escapeHtml(cell)}</td>`
                )
                .join("")}
            </tr>
          `
        )
        .join("")
    : `<tr><td colspan="${config.headers.length}" class="text-center">Belum ada data</td></tr>`;

  return `
    <table class="report-table">
      <thead>
        <tr>${headerHtml}</tr>
      </thead>
      <tbody>${bodyHtml}</tbody>
    </table>
  `;
}

function buildReportHtml(reportType, meta, rows) {
  const config = reportTypeConfig[reportType];
  const logoDataUri = getLogoDataUri();

  return `<!DOCTYPE html>
<html lang="id">
  <head>
    <meta charset="UTF-8" />
    <title>${escapeHtml(config.title)}</title>
    <style>
      @page {
        size: A4;
        margin: 12mm 10mm;
      }

      * {
        box-sizing: border-box;
      }

      body {
        font-family: "Times New Roman", Times, serif;
        color: #111827;
        margin: 0;
        padding: 0;
      }

      .kop {
        display: grid;
        grid-template-columns: 120px 1fr;
        gap: 12px;
        align-items: center;
        padding-bottom: 10px;
        border-bottom: 3px double #111827;
        margin-bottom: 18px;
      }

      .kop-logo {
        width: 110px;
        height: 110px;
        object-fit: contain;
      }

      .kop-text h1,
      .kop-text h2,
      .kop-text h3 {
        margin: 0;
        text-align: center;
        font-weight: 700;
      }

      .kop-text h1,
      .kop-text h2,
      .kop-text h3,
      .kop-main {
        font-size: 14pt;
      }

      .kop-address {
        font-size: 10pt;
        font-style: italic;
        font-weight: 400;
      }

      .report-title {
        text-align: center;
        font-size: 14pt;
        font-weight: 700;
        margin: 0 0 14px;
      }

      .report-info {
        margin-bottom: 16px;
        font-size: 11pt;
      }

      .report-info p {
        margin: 4px 0;
      }

      .report-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 11pt;
      }

      .report-table th,
      .report-table td {
        border: 1px solid #111827;
        padding: 8px 10px;
        vertical-align: middle;
      }

      .report-table th {
        background: #eff6ff;
        font-weight: 700;
        text-align: center;
      }

      .text-center {
        text-align: center;
      }
    </style>
  </head>
  <body>
    <header class="kop">
      <div>
        ${
          logoDataUri
            ? `<img class="kop-logo" src="${logoDataUri}" alt="Logo Sekolah" />`
            : ""
        }
      </div>
      <div class="kop-text">
        <h1 class="kop-main">PEMERINTAH KABUPATEN TANGERANG</h1>
        <h2 class="kop-main">DINAS PENDIDIKAN</h2>
        <h3 class="kop-main">SD N RAWA GEMPOL</h3>
        <p class="kop-main">NPSN:20602847, NSS:101280318010</p>
        <p class="kop-address">Jl. Gaga Kecil, Gempol Sari, Kec. Sepatan Timur., Kab. Tangerang</p>
        <p class="kop-address">Kode Pos (15521) Email: sdrawagempol@gmail.com</p>
      </div>
    </header>

    <h4 class="report-title">${escapeHtml(config.title)}</h4>

    <div class="report-info">
      <p><strong>Wali Kelas</strong> : ${escapeHtml(meta?.wali_kelas || "-")}</p>
      <p><strong>Nama Kelas</strong> : ${escapeHtml(meta?.nama_kelas || "-")}</p>
    </div>

    ${buildTableHtml(reportType, rows)}
  </body>
</html>`;
}

module.exports = {
  buildReportHtml,
};
