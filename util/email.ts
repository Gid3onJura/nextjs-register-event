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

export const sendEmail = async (
  to: string,
  bcc: string,
  subject: string,
  text: string,
  html: string,
  iscfile?: any | null
) => {
  const attachments = [
    {
      filename: "kamiza.png",
      path: `${process.env.NEXT_PUBLIC_BASE_URL}/kamiza.png`,
      cid: "kamiza",
    },
  ]

  if (iscfile) {
    attachments.push(iscfile)
  }

  await transporter.sendMail({
    from: process.env.NEXT_PUBLIC_SMTP_USER,
    to,
    bcc,
    subject,
    text,
    html,
    attachments,
  })
}
