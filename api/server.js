const express = require("express");
const app = express();
const { PrismaClient, Prisma } = require("@prisma/client");
const PORT = 5050;
const prisma = new PrismaClient();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require("dotenv").config();

app.use(express.json());

//新規ユーザー登録API
app.post("/api/auth/register", async (req, res) => {
  const { username, email, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  const prisma = new PrismaClient();

  const user = await prisma.user.create({
    data: {
      username,
      email,
      password: hashedPassword,
    },
  });
  return res.json({ user });
});

//ログインAPI
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return res.status(401).json({ error: "そのユーザーは存在しません" });
  }
  console.log(user);

  const isPasswordValid = await bcrypt.compare(password, user.password);
  console.log(email, password);
  if (!isPasswordValid) {
    return res.status(401).json({ error: "そのパスワードは間違っています" });
  }

  const token = jwt.sign({ id: user.id }, process.env.SECRET_KEY, {
    expiresIn: 24 * 60 * 60,
  });

  return res.json({ token });
});

app.listen(PORT, () => console.log(`server is running on Port ${PORT}`));
