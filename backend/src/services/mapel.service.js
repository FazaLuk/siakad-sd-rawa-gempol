const prisma = require("../config/db");

async function getAllMapelService() {
  return await prisma.mapel.findMany({
    orderBy: {
      nama_mapel: "asc",
    },
  });
}

module.exports = {
  getAllMapelService,
};
