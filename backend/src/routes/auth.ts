import { Router, Request, Response } from "express";
import prisma from "../lib/prisma.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { RegistrationStatus } from "@prisma/client";

import { JWT_SECRET } from "../lib/jwt.js";
import { auth, AuthReq } from "../middleware/auth.js";
import { isAllowedAdminEmail } from "../lib/adminAccess.js";

const r = Router();

r.post("/register", async (req: Request, res: Response) => {
  const { email, password, firstName, lastName, ...rest } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: "Email i hasło wymagane" });

  const trimmedEmail = String(email).trim().toLowerCase();
  const exists = await prisma.user.findUnique({ where: { email: trimmedEmail } });
  if (exists) return res.status(409).json({ error: "Użytkownik istnieje" });

  const hash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      email: trimmedEmail,
      password: hash,
      role: "USER",
      firstName: typeof firstName === "string" ? firstName.trim() || null : null,
      lastName: typeof lastName === "string" ? lastName.trim() || null : null,
      registrationStatus: RegistrationStatus.PENDING,
      registrationForm: Object.keys(rest).length > 0 ? rest : null,
    },
  });
  res.json({ id: user.id, email: user.email, status: user.registrationStatus });
});

r.post("/login", async (req: Request, res: Response) => {
  const { email, password } = req.body || {};
  const trimmedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
  const user = await prisma.user.findUnique({ where: { email: trimmedEmail } });
  if (!user) return res.status(401).json({ error: "Błędne dane" });

  if (user.registrationStatus && user.registrationStatus !== RegistrationStatus.APPROVED) {
    return res.status(403).json({ error: "Konto oczekuje na akceptację" });
  }

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ error: "Błędne dane" });

  if (user.role === "ADMIN" && !isAllowedAdminEmail(user.email)) {
    return res.status(403).json({ error: "Brak uprawnień" });
  }

  const tokenRole = user.role === "ADMIN" && isAllowedAdminEmail(user.email) ? "ADMIN" : "USER";

  const token = jwt.sign({ id: user.id, email: user.email, role: tokenRole }, JWT_SECRET, {
    expiresIn: "7d",
  });
  res.json({ token, role: tokenRole, email: user.email });
});

r.get("/me", auth("USER"), async (req: AuthReq, res: Response) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (!user) {
      return res.status(404).json({ error: "Użytkownik nie istnieje" });
    }

    res.json({ id: user.id, email: user.email, role: user.role, createdAt: user.createdAt });
  } catch (error) {
    console.error("Nie udało się pobrać profilu użytkownika", error);
    res.status(500).json({ error: "Nie udało się pobrać profilu" });
  }
});

r.put("/me", auth("USER"), async (req: AuthReq, res: Response) => {
  const { email, password } = req.body || {};

  if (!email && !password) {
    return res.status(400).json({ error: "Brak danych do aktualizacji" });
  }

  const data: { email?: string; password?: string } = {};

  if (typeof email === "string" && email.trim().length > 3) {
    data.email = email.trim().toLowerCase();
  }

  if (typeof password === "string") {
    if (password.trim().length < 8) {
      return res.status(400).json({ error: "Hasło musi mieć co najmniej 8 znaków" });
    }
    data.password = await bcrypt.hash(password, 10);
  }

  try {
    const nextUser = await prisma.user.update({ where: { id: req.user!.id }, data });

    const token = jwt.sign({ id: nextUser.id, email: nextUser.email, role: nextUser.role }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({ id: nextUser.id, email: nextUser.email, role: nextUser.role, token });
  } catch (error) {
    if (error instanceof Error && "code" in error && (error as any).code === "P2002") {
      return res.status(409).json({ error: "Użytkownik z takim e-mailem już istnieje" });
    }
    console.error("Nie udało się zaktualizować profilu", error);
    res.status(500).json({ error: "Nie udało się zaktualizować profilu" });
  }
});

r.post("/reset-password", async (req: Request, res: Response) => {
  const { email, newPassword } = req.body || {};
  if (!email || !newPassword) return res.status(400).json({ error: "Email i nowe hasło wymagane" });

  if (typeof newPassword !== "string" || newPassword.trim().length < 8) {
    return res.status(400).json({ error: "Hasło musi mieć co najmniej 8 znaków" });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.json({ ok: true });
    }

    const hash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: user.id }, data: { password: hash } });

    res.json({ ok: true });
  } catch (error) {
    console.error("Nie udało się zresetować hasła.", error);
    res.status(500).json({ error: "Nie udało się zresetować hasła" });
  }
});

export default r;
