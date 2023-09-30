const GmailService = require("./gmail/gmailService");

class EmailService {
  constructor() {
    this.emailProvider = new GmailService();
  }

  async sendEmail(email) {
    await this.emailProvider.send(email);
  }
}

module.exports = EmailService;
