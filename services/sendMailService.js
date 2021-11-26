const nodemailer = require('nodemailer');
const nodemailerSendgrid = require('nodemailer-sendgrid');
const dotenv = require('dotenv');

dotenv.config();

const transporter = nodemailer.createTransport(
  nodemailerSendgrid({
      apiKey: process.env.SENDGRID_API_KEY
  })
);

module.exports = {
  sendEmail: async (mailData) => {
    transporter.sendMail({
      from: process.env.SENDGRID_SENDER,
      to: mailData.toEmail,
      subject: mailData.subject,
      html: mailData.content
    }).catch(err => console.error(err.response.body));
  }
}
