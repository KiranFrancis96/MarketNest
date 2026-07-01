import nodemailer from "nodemailer";
import logger from "@/utils/logger.ts";

export const sendOtpEmail = async (email: string, otp: string) => {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || user === "example@gmail.com" || !pass || pass === "example_password") {
    logger.warn(`[Dev Mail Bypass] Real mail NOT sent. OTP for ${email} is: ${otp}`);
    return;
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user,
      pass,
    },
  });

  await transporter.sendMail({
    from: user,
    to: email,
    subject: "Your OTP",
    text: `Your OTP is ${otp}`,
  });
};