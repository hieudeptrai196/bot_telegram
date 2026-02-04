import { Email } from '../models/email.model';

export interface IMailService {
  getUnreadEmails(): Promise<Email[]>;
}

export const IMailService = Symbol('IMailService');
