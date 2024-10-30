import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: 465, // or 587 or your SMTP server's port
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PW,
  },
})

export const sendEmail = async (to: string, bcc: string, subject: string, text: string, html: string) => {
  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to,
    bcc,
    subject,
    text,
    html,
  })
}
