const puppeteer = require("puppeteer");
const { buildReportHtml } = require("./reportHtml.util");

let browserInstance = null;

async function getBrowser() {
  if (browserInstance && browserInstance.isConnected()) {
    return browserInstance;
  }

  browserInstance = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  return browserInstance;
}

async function generateReportPdf(reportType, meta, rows) {
  const html = buildReportHtml(reportType, meta, rows);
  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      margin: {
        top: "12mm",
        right: "10mm",
        bottom: "12mm",
        left: "10mm",
      },
    });

    return pdfBuffer;
  } finally {
    await page.close();
  }
}

module.exports = {
  generateReportPdf,
};
