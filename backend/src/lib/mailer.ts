import net from "node:net";
import tls from "node:tls";
import { once } from "node:events";

import { WinnerStatus } from "@prisma/client";

const webhookUrl = process.env.EMAIL_WEBHOOK_URL || process.env.MAIL_WEBHOOK_URL;

const smtpConfig = {
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || "0") || undefined,
  secure: (process.env.SMTP_SECURE ?? "").toLowerCase() === "true" || process.env.SMTP_PORT === "465",
  user: process.env.SMTP_USER,
  pass: process.env.SMTP_PASS,
  from: process.env.SMTP_FROM || process.env.SMTP_USER,
};

export const emailDeliveryConfigured = Boolean(
  webhookUrl || (smtpConfig.host && smtpConfig.port && smtpConfig.from)
);

type WinnerMailInput = {
  to: string;
  userName?: string | null;
  carLabel: string;
  amount?: number | null;
  status: WinnerStatus;
};

const formatStatusLabel = (status: WinnerStatus) => (status === WinnerStatus.AWARDED ? "Wygrana przyznana" : "Wygrana");

const buildWinnerMessage = ({ userName, carLabel, amount, status }: WinnerMailInput) => {
  const displayName = userName?.trim() || "Kliencie";
  const formattedAmount = typeof amount === "number" && Number.isFinite(amount) ? `${amount}` : null;
  const statusLabel = formatStatusLabel(status);

  const lines = [
    `Cześć ${displayName},`,
    `Twoja oferta w aukcji ${carLabel} została oznaczona jako: ${statusLabel}.`,
  ];

  if (formattedAmount) {
    lines.push(`Kwota Twojej oferty: ${formattedAmount}`);
  }

  lines.push("Zaloguj się do panelu klienta, aby zobaczyć szczegóły aukcji.");

  return lines.join("\n");
};

const sendViaWebhook = async (payload: WinnerMailInput) => {
  if (!webhookUrl) return false;

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      type: "winner_notification",
      to: payload.to,
      name: payload.userName,
      car: payload.carLabel,
      amount: payload.amount,
      status: payload.status,
      message: buildWinnerMessage(payload),
    }),
  });

  if (!response.ok) {
    throw new Error(`Webhook responded with ${response.status}`);
  }

  return true;
};

const readResponse = async (socket: net.Socket | tls.TLSSocket, expectedCode: number) => {
  const [data] = (await once(socket, "data")) as [Buffer];
  const message = data.toString().trim();

  if (!message.startsWith(String(expectedCode))) {
    throw new Error(`SMTP expected ${expectedCode}, received: ${message}`);
  }

  return message;
};

const sendViaSmtp = async (payload: WinnerMailInput) => {
  const { host, port, secure, user, pass, from } = smtpConfig;
  if (!host || !port || !from) return false;

  const socket = secure ? tls.connect({ host, port }) : net.createConnection({ host, port });
  socket.setTimeout(15000);

  try {
    await once(socket, secure ? "secureConnect" : "connect");
    await readResponse(socket, 220);

    socket.write(`EHLO ${host}\r\n`);
    await readResponse(socket, 250);

    if (user && pass) {
      socket.write("AUTH LOGIN\r\n");
      await readResponse(socket, 334);

      socket.write(Buffer.from(user).toString("base64") + "\r\n");
      await readResponse(socket, 334);

      socket.write(Buffer.from(pass).toString("base64") + "\r\n");
      await readResponse(socket, 235);
    }

    socket.write(`MAIL FROM:<${from}>\r\n`);
    await readResponse(socket, 250);

    socket.write(`RCPT TO:<${payload.to}>\r\n`);
    await readResponse(socket, 250);

    socket.write("DATA\r\n");
    await readResponse(socket, 354);

    const body = buildWinnerMessage(payload);
    const message = [
      `Subject: Wygrana aukcja - ${payload.carLabel}`,
      `From: ${from}`,
      `To: ${payload.to}`,
      "MIME-Version: 1.0",
      "Content-Type: text/plain; charset=utf-8",
      "Content-Transfer-Encoding: 8bit",
      "",
      body,
      ".",
    ].join("\r\n");

    socket.write(message + "\r\n");
    await readResponse(socket, 250);

    socket.write("QUIT\r\n");
  } finally {
    socket.end();
  }

  return true;
};

export const sendWinnerEmail = async (payload: WinnerMailInput) => {
  if (!payload.to) return false;

  try {
    if (webhookUrl) {
      return await sendViaWebhook(payload);
    }

    if (smtpConfig.host && smtpConfig.port && smtpConfig.from) {
      return await sendViaSmtp(payload);
    }

    console.info("[mailer] Brak konfiguracji e-mail, pomijam wysyłkę powiadomienia o wygranej");
    return false;
  } catch (error) {
    console.error("[mailer] Nie udało się wysłać e-maila o wygranej", error);
    return false;
  }
};
