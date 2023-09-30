const nodemailer = require("nodemailer");
const { smtp } = require("../../../config/config")();

class GmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: smtp.auth.user,
        pass: smtp.auth.pass,
      },
    });
  }

  async send(email) {
    return new Promise((resolve, reject) => {
      this.transporter.sendMail(email, (error, info) => {
        if (error) {
          reject(error);
        } else {
          resolve(info);
        }
      });
    });
  }
}

module.exports = GmailService;
