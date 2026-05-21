const prisma = require("../config/db");

async function getAllTahunAjaranService() {
  return await prisma.tahun_ajaran.findMany({
    orderBy: {
      id_tahun_ajaran: "desc",
    },
  });
}

module.exports = {
  getAllTahunAjaranService,
};
