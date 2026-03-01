import net from "node:net";
import tls from "node:tls";


const webhookUrl = process.env.EMAIL_WEBHOOK_URL || process.env.MAIL_WEBHOOK_URL;
const frontendBaseUrl =
  process.env.PUBLIC_FRONTEND_URL?.trim() ||
  process.env.FRONTEND_BASE_URL?.trim() ||
  "https://autoszczech.ch";

const smtpConfig = {
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || "0") || undefined,
  secure: (process.env.SMTP_SECURE ?? "").toLowerCase() === "true" || process.env.SMTP_PORT === "465",
  user: process.env.SMTP_USER,
  pass: process.env.SMTP_PASS,
  from: process.env.SMTP_FROM || process.env.SMTP_USER,
};

const extractEmailAddress = (value?: string) => {
  if (!value) return "";
  const trimmed = value.trim();
  const angleMatch = trimmed.match(/<([^>]+)>/);
  const candidate = angleMatch?.[1]?.trim() || trimmed;
  return candidate.toLowerCase();
};

const smtpEnvelopeFrom = extractEmailAddress(smtpConfig.user) || extractEmailAddress(smtpConfig.from);
const smtpHeaderFrom = smtpConfig.user || smtpConfig.from;

if (smtpConfig.from && smtpConfig.user && extractEmailAddress(smtpConfig.from) !== extractEmailAddress(smtpConfig.user)) {
  console.warn(
    `[mailer] SMTP_FROM (${smtpConfig.from}) differs from SMTP_USER (${smtpConfig.user}). Using SMTP_USER as header/envelope FROM for deliverability.`
  );
}

const officeEmailRecipient = process.env.OFFICE_BID_EMAIL?.trim() || "biuro@autoszczech.ch";

export const emailDeliveryConfigured = Boolean(webhookUrl || (smtpConfig.host && smtpConfig.port && smtpEnvelopeFrom));

type MailPayload = {
  kind: "registration_pending" | "account_approved" | "auction_won" | "auction_awarded" | "bid_placed_client" | "bid_placed_office";
  to: string;
  subject: string;
  text: string;
  meta?: Record<string, unknown>;
};

type Recipient = {
  to: string;
  firstName?: string | null;
};

const isNetworkError = (error: unknown) => {
  if (!error || typeof error !== "object") return false;
  const code = "code" in error ? String((error as { code?: unknown }).code ?? "") : "";
  return ["ECONNRESET", "ETIMEDOUT", "EPIPE", "ECONNABORTED", "ECONNREFUSED"].includes(code);
};

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

type SendMailOptions = {
  retries?: number;
};

const sanitizeName = (firstName?: string | null) => {
  if (typeof firstName !== "string") return "Kliencie";
  const trimmed = firstName.trim();
  return trimmed.length > 0 ? trimmed : "Kliencie";
};

const normalizeBaseUrl = (value: string) => value.replace(/\/+$/, "");

const buildFrontendUrl = (path: string) => {
  const base = normalizeBaseUrl(frontendBaseUrl);
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalizedPath}`;
};

const formatAmount = (amount?: number | null) => {
  if (typeof amount !== "number" || !Number.isFinite(amount)) return null;
  return `${amount.toLocaleString("pl-PL")} CHF`;
};

const readResponse = async (socket: net.Socket | tls.TLSSocket, expectedCode: number) => {
  const data = await new Promise<Buffer>((resolve, reject) => {
    const cleanup = () => {
      socket.off("data", onData);
      socket.off("error", onError);
      socket.off("timeout", onTimeout);
    };

    const onData = (chunk: Buffer) => {
      cleanup();
      resolve(chunk);
    };

    const onError = (error: Error) => {
      cleanup();
      reject(error);
    };

    const onTimeout = () => {
      cleanup();
      reject(new Error("SMTP socket timeout while waiting for response"));
    };

    socket.once("data", onData);
    socket.once("error", onError);
    socket.once("timeout", onTimeout);
  });

  const message = data.toString().trim();

  if (!message.startsWith(String(expectedCode))) {
    throw new Error(`SMTP expected ${expectedCode}, received: ${message}`);
  }

  return message;
};

const sendViaWebhook = async (payload: MailPayload) => {
  if (!webhookUrl) return false;

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Webhook responded with ${response.status}`);
  }

  return true;
};

const sendViaSmtp = async (payload: MailPayload) => {
  const { host, port, secure, user, pass } = smtpConfig;
  if (!host || !port || !smtpEnvelopeFrom) return false;

  const socket = secure
    ? tls.connect({ host, port, timeout: 15000 })
    : net.createConnection({ host, port, timeout: 15000 });

  let dataAccepted = false;

  const waitForClose = new Promise<void>((resolve) => {
    socket.once("close", () => {
      console.info("[mailer] smtp connection closed");
      resolve();
    });
  });

  socket.setTimeout(15000);
  socket.setKeepAlive(false);
  socket.on("error", (error) => {
    console.error("[mailer] SMTP transport error", error);
  });

  try {
    await new Promise<void>((resolve, reject) => {
      const connectEvent = secure ? "secureConnect" : "connect";

      const cleanup = () => {
        socket.off(connectEvent, onConnect);
        socket.off("error", onError);
        socket.off("timeout", onTimeout);
      };

      const onConnect = () => {
        cleanup();
        resolve();
      };

      const onError = (error: Error) => {
        cleanup();
        reject(error);
      };

      const onTimeout = () => {
        cleanup();
        reject(new Error("SMTP connection timeout"));
      };

      socket.once(connectEvent, onConnect);
      socket.once("error", onError);
      socket.once("timeout", onTimeout);
    });

    console.info("[mailer] smtp connection opened");
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

    socket.write(`MAIL FROM:<${smtpEnvelopeFrom}>\r\n`);
    const mailFromResponse = await readResponse(socket, 250);
    console.info(`[mailer] MAIL FROM accepted ${mailFromResponse}`);

    socket.write(`RCPT TO:<${payload.to}>\r\n`);
    const rcptResponse = await readResponse(socket, 250);
    console.info(`[mailer] RCPT TO accepted ${payload.to} ${rcptResponse}`);

    socket.write("DATA\r\n");
    await readResponse(socket, 354);

    const message = [
      `Subject: ${payload.subject}`,
      `From: ${smtpHeaderFrom}`,
      `To: ${payload.to}`,
      "MIME-Version: 1.0",
      "Content-Type: text/plain; charset=utf-8",
      "Content-Transfer-Encoding: 8bit",
      "",
      payload.text,
      ".",
    ].join("\r\n");

    socket.write(message + "\r\n");
    const dataResponse = await readResponse(socket, 250);
    dataAccepted = true;
    console.info(`[mailer] DATA accepted (250) ${dataResponse}`);

    socket.write("QUIT\r\n");
  } catch (error) {
    if (!dataAccepted) {
      console.error("[mailer] send failed before 250", error);
    }
    throw error;
  } finally {
    if (!socket.destroyed) {
      socket.end();
      socket.destroy();
    }

    await Promise.race([waitForClose, sleep(1000)]);
  }

  return true;
};

const sendMail = async (payload: MailPayload, options: SendMailOptions = {}) => {
  if (!payload.to) return false;

  const maxAttempts = Math.max(1, (options.retries ?? 0) + 1);

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const delivered = webhookUrl ? await sendViaWebhook(payload) : await sendViaSmtp(payload);

      if (delivered) {
        console.info(`[mailer] Sent \"${payload.kind}\" email to ${payload.to}`);
        return true;
      }

      console.info(`[mailer] Email delivery is not configured, skipped \"${payload.kind}\" for ${payload.to}`);
      return false;
    } catch (error) {
      const canRetry = attempt < maxAttempts && isNetworkError(error);
      if (!canRetry) {
        console.error(`[mailer] Failed to send \"${payload.kind}\" email to ${payload.to}`, error);
        return false;
      }

      const backoffMs = 500 + Math.floor(Math.random() * 501);
      console.warn(`[mailer] Retry ${attempt}/${maxAttempts - 1} for \"${payload.kind}\" in ${backoffMs}ms`);
      await sleep(backoffMs);
    }
  }

  return false;
};

export const sendRegistrationPendingEmail = async ({ to, firstName }: Recipient) => {
  const displayName = sanitizeName(firstName);

  return sendMail({
    kind: "registration_pending",
    to,
    subject: "Witamy w Auto Szczech! Twoje konto zostało zarejestrowane",
    text: [
      `Cześć ${displayName},`,
      "Dziękujemy za rejestrację w serwisie autoszczech.ch!",
      "",
      "Twoje zgłoszenie zostało przyjęte i obecnie oczekuje na weryfikację przez nasz zespół.",
      "Dbamy o bezpieczeństwo wszystkich transakcji, dlatego sprawdzamy każde nowe konto przed udzieleniem pełnego dostępu do licytacji.",
      "",
      "Co teraz?",
      "Poinformujemy Cię osobnym mailem, gdy Twoje konto zostanie aktywowane.",
      "",
      "W międzyczasie:",
      "Możesz przeglądać aktualną ofertę naszych pojazdów, jednak licytowanie będzie możliwe dopiero po akceptacji profilu.",
      "",
      "Pozdrawiamy,",
      "Zespół AutoSzczech",
    ].join("\n"),
  });
};

export const sendAccountApprovedEmail = async ({ to, firstName }: Recipient) => {
  const displayName = sanitizeName(firstName);
  const loginUrl = buildFrontendUrl("/login");

  return sendMail({
    kind: "account_approved",
    to,
    subject: "Twoje konto w Auto Szczech jest już aktywne!",
    text: [
      `Dzień dobry ${displayName},`,
      "Twoje konto na portalu autoszczech.ch zostało pomyślnie zweryfikowane i aktywowane.",
      "",
      "Od teraz masz pełny dostęp do:",
      "- składania ofert w aukcjach",
      "- obserwowania pojazdów",
      "- panelu klienta",
      "",
      "Zaloguj się:",
      loginUrl,
      "",
      "Życzymy udanych licytacji!",
      "Zespół AutoSzczech",
    ].join("\n"),
    meta: { loginUrl },
  });
};

type AuctionMailInput = {
  to: string;
  carName: string;
  amount?: number | null;
  auctionId: string;
};

export const sendAuctionWinnerEmail = async ({ to, carName, amount, auctionId }: AuctionMailInput) => {
  const auctionUrl = buildFrontendUrl(`/cars/${auctionId}`);
  const formattedAmount = formatAmount(amount) ?? "—";

  return sendMail({
    kind: "auction_won",
    to,
    subject: `Gratulacje! Twoja oferta jest najwyższa – aukcja: ${carName}`,
    text: [
      "Szanowny Kliencie,",
      `Aukcja pojazdu ${carName} zakończyła się, a Twoja oferta ${formattedAmount} jest najwyższa.`,
      "",
      "Czekamy jeszcze na ostateczne zatwierdzenie sprzedaży.",
      "O wyniku poinformujemy Cię w kolejnej wiadomości.",
      "",
      "Link:",
      auctionUrl,
      "",
      "Zespół AutoSzczech",
    ].join("\n"),
    meta: { auctionUrl, amount: formattedAmount },
  });
};

export const sendAuctionAwardedEmail = async ({ to, carName, amount, auctionId }: AuctionMailInput) => {
  const panelUrl = buildFrontendUrl("/panel");
  const formattedAmount = formatAmount(amount) ?? "—";

  return sendMail({
    kind: "auction_awarded",
    to,
    subject: `Potwierdzenie: Aukcja ${carName} została Ci PRZYZNANA!`,
    text: [
      "Szanowny Kliencie,",
      `Pojazd ${carName} został Ci oficjalnie przyznany.`,
      "",
      `Cena końcowa: ${formattedAmount}`,
      `Numer aukcji: ${auctionId}`,
      "",
      "Wkrótce otrzymasz fakturę oraz instrukcję płatności.",
      "Po zaksięgowaniu wpłaty ustalimy odbiór lub transport.",
      "",
      "Panel klienta:",
      panelUrl,
      "",
      "Zespół AutoSzczech",
    ].join("\n"),
    meta: { panelUrl, amount: formattedAmount },
  });
};


type BidPlacedInput = {
  userEmail: string;
  userFirstName?: string | null;
  userLastName?: string | null;
  carName: string;
  amount?: number | null;
  auctionId: string;
  placedAt?: Date;
};

export const sendBidPlacedEmails = async ({
  userEmail,
  userFirstName,
  userLastName,
  carName,
  amount,
  auctionId,
  placedAt,
}: BidPlacedInput) => {
  const auctionUrl = buildFrontendUrl(`/cars/${auctionId}`);
  const formattedAmount = formatAmount(amount) ?? "—";
  const date = (placedAt ?? new Date()).toLocaleString("pl-PL");
  const firstName = sanitizeName(userFirstName);
  const lastName = typeof userLastName === "string" ? userLastName.trim() : "";
  const fullName = `${firstName} ${lastName}`.trim();

  const clientSent = await sendMail({
    kind: "bid_placed_client",
    to: userEmail,
    subject: `Potwierdzenie złożenia oferty – ${carName}`,
    text: [
      `Dzień dobry ${firstName},`,
      "",
      "Potwierdzamy przyjęcie Twojej oferty w aukcji pojazdu:",
      "",
      `Pojazd: ${carName}`,
      `Kwota oferty: ${formattedAmount}`,
      `Data: ${date}`,
      "",
      "Twoja oferta została zapisana w systemie i bierze udział w licytacji.",
      "",
      "Możesz śledzić status aukcji tutaj:",
      auctionUrl,
      "",
      "Pozdrawiamy,",
      "Zespół AutoSzczech",
    ].join("\n"),
    meta: { auctionUrl, amount: formattedAmount, date },
  }, { retries: 2 });

  const officeSent = await sendMail({
    kind: "bid_placed_office",
    to: officeEmailRecipient,
    subject: `Potwierdzenie złożenia oferty – ${carName}`,
    text: [
      "Nowa oferta została złożona przez klienta.",
      "",
      `Klient: ${fullName} (${userEmail})`,
      `Pojazd: ${carName}`,
      `Kwota: ${formattedAmount}`,
      `Data: ${date}`,
      "",
      "Link do aukcji:",
      auctionUrl,
    ].join("\n"),
    meta: { auctionUrl, amount: formattedAmount, date, userEmail, fullName },
  });

  return { clientSent, officeSent };
};
