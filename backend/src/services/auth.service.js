const prisma = require("../config/db");
const jwt = require("jsonwebtoken");

const loginUser = async (data) => {
  const user = await prisma.users.findUnique({
    where: {
      username: data.username,
    },
  });

  if (!user) {
    throw new Error("Username not found");
  }

  if (user.password !== data.password) {
    throw new Error("Wrong password");
  }

  const token = jwt.sign(
    {
      id_user: user.id_user,
      username: user.username,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1d",
    },
  );

  return {
    token,
    user: {
      id_user: user.id_user,
      username: user.username,
      role: user.role,
    },
  };
};

module.exports = {
  loginUser,
};
