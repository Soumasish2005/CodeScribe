// packages/api/src/mailer/index.ts
import nodemailer from 'nodemailer';
import path from 'path';
import fs from 'fs/promises';
import Handlebars from 'handlebars';
import config from '../config';
import { logger } from '../utils/logger';

const transporter = nodemailer.createTransport({
  host: config.mailer.host,
  port: config.mailer.port,
  secure: true, // true for 465, false for other ports
  auth: {
    user: config.mailer.user,
    pass: config.mailer.pass,
  },
});

interface MailOptions {
  to: string;
  subject: string;
  template: string;
  context: Record<string, any>;
}

export const sendEmail = async ({ to, subject, template, context }: MailOptions) => {
  try {
    const templatePath = path.join(__dirname, 'templates', `${template}.hbs`);
    const templateSource = await fs.readFile(templatePath, 'utf-8');
    const compiledTemplate = Handlebars.compile(templateSource);
    const html = compiledTemplate(context);

    const mailOptions = {
      from: config.mailer.from,
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info(`Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    logger.error({ error, to, subject }, 'Error sending email');
    // In production, you might want a more robust error handling/retry mechanism
  }
};
