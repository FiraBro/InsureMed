import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST, // smtp.gmail.com
  port: parseInt(process.env.SMTP_PORT),
  secure: false, // TLS
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false, // avoids certificate issues inside Docker
  },
});

export default async function sendEmail({ email, subject, html, text }) {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
    console.log(`ℹ️ SMTP is not configured. Email skipped for: ${email}`);
    return { messageId: "skipped-no-smtp" };
  }

  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject,
      text,
      html,
    });
    console.log("Email sent:", info.messageId);
    return info;
  } catch (err) {
    console.error("Email send error:", err);
    throw err;
  }
}
