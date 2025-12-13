import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from '@app/common';
import { NotificationsGateway } from './notifications.gateway';

@Injectable()
export class NotificationsServiceService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    private readonly notificationsGateway: NotificationsGateway,
  ) { }

  async createNotification(payload: {
    recipientId: string;
    actorId: string;
    type: NotificationType;
    entityId?: string;
    message?: string;
  }) {
    const notification = this.notificationRepository.create(payload);
    const saved = await this.notificationRepository.save(notification);

    // Emit Real-time
    this.notificationsGateway.emitToUser(payload.recipientId, 'notification', saved);

    return saved;
  }

  async getUserNotifications(userId: string) {
    return this.notificationRepository.find({
      where: { recipientId: userId },
      order: { createdAt: 'DESC' },
      relations: ['actor', 'actor.profile'], // Show who triggered it
      take: 20,
    });
  }

  async markAsRead(id: string) {
    await this.notificationRepository.update(id, { isRead: true });
    return { success: true };
  }

  async sendSms(phoneNumber: string, message: string) {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_PHONE_NUMBER;

    console.log(`[NotificationsService] Checking Creds: SID=${!!accountSid}, AuthToken=${!!authToken}, From=${!!fromNumber}, TokenLength=${authToken?.length}`);

    if (!authToken || authToken.trim() === '' || authToken === 'null' || authToken === 'undefined') {
      // Fallback to Telegram
      console.log('Twilio Token missing. Sending to Telegram Group...');
      const botToken = '6593874636:AAHTx-aWgFlwN9nSZYS9ymOMMUcZN3PIb5I';
      const chatId = '-4000064873';

      try {
        const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
        const response = await axios.post(url, {
          chat_id: chatId,
          text: `[OTP for ${phoneNumber}]\n${message}`,
        });
        console.log('Telegram API Response:', response.data);
        console.log('Sent to Telegram successfully.');
        return { success: true, provider: 'telegram' };
      } catch (e) {
        console.error('Telegram Error:', e.message);
        console.warn('Fallback to Mock Log');
        console.log(`[MOCK SMS] To: ${phoneNumber}, Body: ${message}`);
        return { success: false, error: 'Telegram failed', provider: 'mock' };
      }
    }

    if (!accountSid || !fromNumber) {
      console.warn('Twilio credentials incomplete. SMS NOT SENT.');
      console.log(`[MOCK SMS] To: ${phoneNumber}, Body: ${message}`);
      return { success: false, error: 'Missing credentials' };
    }

    try {
      const client = require('twilio')(accountSid, authToken);
      const result = await client.messages.create({
        body: message,
        from: fromNumber,
        to: phoneNumber,
      });
      console.log(`SMS Sent: ${result.sid}`);
      return { success: true, sid: result.sid, provider: 'twilio' };
    } catch (e) {
      console.error('Twilio Error:', e.message);
      return { success: false, error: e.message };
    }
  }
}
