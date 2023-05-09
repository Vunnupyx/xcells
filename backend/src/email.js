import * as nodemailer from 'nodemailer'
import debug from 'debug'
const log = debug('infinity:Nodemailer:email')
const logError = log.extend('ERROR', '::')

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
    this.#transporter.verify(function (error) {
      if (error) {
        logError('SMTP create transport error.', error)
      }
    })
  }

  async sendEmail(mailOptions) {
    return this.#transporter.sendMail(mailOptions).catch(error => {
      logError('Transporter sendMail error.', error)
      return false
    })
  }

  async notifyAdminForNewUser(email, username) {
    if (!process.env.MAIL_FROM) {
      logError('Send properties not specified:', process.env.MAIL_FROM)
      return false
    }
    await this.sendEmail(notifyAdminNewUserEmailTemplate(email, username))
  }

  async notifyUserForSignup(email, username) {
    if (!process.env.MAIL_FROM || !email) {
      logError('Send properties not specified:', email, process.env.MAIL_FROM)
      return false
    }
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
