const prisma = require("../config/db");

async function getAllSemesterService() {
  return await prisma.semester.findMany({
    orderBy: {
      urutan: "asc",
    },
  });
}

module.exports = {
  getAllSemesterService,
};
