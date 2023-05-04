import * as nodemailer from 'nodemailer'

export class Emailer {
  #transporter

  constructor() {
    this.#transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: Number(process.env.MAIL_PORT),
      secure: false,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false,
      },
    })
  }

  async sendEmail(mailOptions) {
    return this.#transporter.sendMail(mailOptions)
  }

  async notifyAdminForNewUser(email, username) {
    await this.sendEmail(notifyAdminNewUserEmailTemplate(email, username))
  }

  async notifyUserForSignup(email, username) {
    await this.sendEmail(newUserEmailTemplate(email, username))
  }
}

export const emailer = new Emailer()

export const newUserEmailTemplate = (email, username) => {
  return {
    from: process.env.MAIL_FROM,
    to: email,
    subject: process.env.MAIL_SUBJECT,
    html: `<p>Hello ${username}, you have been granted with early access to xCells! Please go app.xcells.io to login. Best regards, the xCells-Team</p>`,
  }
}
export const notifyAdminNewUserEmailTemplate = (email, username) => {
  return {
    from: process.env.MAIL_FROM,
    to: process.env.MAIL_FROM,
    subject: `New User: ${username} - email: ${email}`,
    text: `New User: ${username} - email: ${email}`,
    html: `
      <h1>New User: ${username}</h1>
      <p>email: ${email}</p>
    `,
  }
}
