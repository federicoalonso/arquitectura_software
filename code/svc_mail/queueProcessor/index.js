const { queue } = require("../queues/queue-binder");
const logger = require("../logger");
const { emailQueue } = require("../config/config")();
const processQueue = queue(emailQueue || "emailQueue");

const EmailService = require("../services/email/emailService");
const logginService = require("../services/loggingService");

let emailService = new EmailService();

async function processEmail(job, done) {
  try {
    logger.info(`Processing queue item: ${job.data}`);

    let jsonData = job.data;

    let email = {
      from: jsonData.from,
      to: jsonData.to,
      subject: jsonData.subject,
      text: "Email para " + jsonData.to + ":\n" + jsonData.body,
    };

    // Send only to our email address in order to check and not send to fictitious emails
    let emailList = ["f.nicolas.alonso@gmail.com", "horacio.mathias@gmail.com"];

    for (let subemail of emailList) {
      email.to = subemail;
      await emailService.sendEmail(email);
      logger.info("Email sent successfully");
    }
    await logginService.sendTolog({
      level: "info",
      message: `${jsonData.event}`,
      service: "svc_email",
      logBody: email,
    });

    // await emailService.sendEmail(email);
    // logger.info("Email sent successfully");

    setTimeout(done, 0);
  } catch (error) {
    logger.error(`Failed to process queue item: ${error}`);
    await logginService.sendTolog({
      level: "error",
      message: `Error processing queue item: ${error}`,
      service: "svc_email",
      logBody: error,
    });
    done(error);
  }
}

module.exports = {
  start: () => {
    logger.info("Starting email service");
    processQueue.process(processEmail);
  },
  stop: () => {
    logger.info("Stopping email service");
    processQueue.close();
  },
};
