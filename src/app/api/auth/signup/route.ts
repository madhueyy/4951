import clientPromise from "../../../lib/mongodb";
import bcrypt from "bcrypt";
import crypto from "crypto";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  const { email, password, name } = await req.json();

  if (!email || !password || !name) {
    return new Response(JSON.stringify({ message: "Missing fields" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const db = (await clientPromise).db();
  const users = db.collection("users");

  const existing = await users.findOne({ email });
  if (existing) {
    return new Response(JSON.stringify({ message: "User already exists" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const verificationToken = crypto.randomBytes(32).toString("hex");
  // 24h expiry
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  const newUser = await users.insertOne({
    email,
    name,
    passwordHash,
    verified: false,
    verificationToken,
    verificationTokenExpires: expiresAt,
    createdAt: new Date(),
  });

  // Send verification email
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const verificationUrl = `${process.env.NEXTAUTH_URL}/auth/verify?token=${verificationToken}`;

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: "Verify your email",
    html: `<p>Hello ${name},</p>
           <p>Please verify your email by clicking this link:</p>
           <a href="${verificationUrl}">Verify Email</a>
           <p>This link expires in 24 hours.</p>`,
  });

  return new Response(JSON.stringify({ id: newUser.insertedId, email, name }));
}
