import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  host: process.env.NEXT_PUBLIC_SMTP_HOST,
  port: 465, // or 587 or your SMTP server's port
  secure: true,
  auth: {
    user: process.env.NEXT_PUBLIC_SMTP_USER,
    pass: process.env.NEXT_PUBLIC_SMTP_PW,
  },
})

export const sendEmail = async (to: string, bcc: string, subject: string, text: string, html: string) => {
  await transporter.sendMail({
    from: process.env.NEXT_PUBLIC_SMTP_USER,
    to,
    bcc,
    subject,
    text,
    html,
  })
}
