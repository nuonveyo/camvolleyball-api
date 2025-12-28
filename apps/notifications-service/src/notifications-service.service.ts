import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import axios from 'axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, IsNull } from 'typeorm';
import { Notification, NotificationType, UserDevice } from '@app/common';
import { NotificationsGateway } from './notifications.gateway';
import * as admin from 'firebase-admin';

@Injectable()
export class NotificationsServiceService implements OnModuleInit {
  private readonly logger = new Logger(NotificationsServiceService.name);

  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    @InjectRepository(UserDevice)
    private userDeviceRepository: Repository<UserDevice>,
    private readonly notificationsGateway: NotificationsGateway,
  ) { }

  async onModuleInit() {
    this.initializeFirebase();
  }

  private initializeFirebase() {
    if (admin.apps.length === 0) {
      try {
        const credentialConfig: admin.ServiceAccount = {
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'), // Handle newline characters
        };

        if (credentialConfig.projectId && credentialConfig.clientEmail && credentialConfig.privateKey) {
          admin.initializeApp({
            credential: admin.credential.cert(credentialConfig),
          });
          this.logger.log('Firebase Admin initialized successfully');
        } else {
          this.logger.warn('Firebase credentials missing. Push notifications will not be sent.');
        }
      } catch (error) {
        this.logger.error('Error initializing Firebase Admin:', error);
      }
    }
  }

  async createNotification(payload: {
    recipientId: string;
    actorId: string;
    type: NotificationType;
    entityId?: string;
    message?: string;
    actorName?: string; // Add optional actorName
  }) {
    const { actorName, ...data } = payload; // Extract actorName, allow it to be passed but not saved to DB if not in entity
    const notification = this.notificationRepository.create(data);
    const saved = await this.notificationRepository.save(notification);

    // Emit Real-time (Socket.io)
    this.notificationsGateway.emitToUser(payload.recipientId, 'notification', saved);

    // Send Push Notification (Firebase)
    await this.sendPushNotification(payload.recipientId, saved, actorName);

    return saved;
  }

  private async sendPushNotification(recipientId: string, notification: Notification, actorName?: string) {
    try {
      if (admin.apps.length === 0) {
        this.logger.warn('Firebase not initialized. Skipping push notification.');
        return;
      }

      // 1. Get active user devices with FCM token
      const devices = await this.userDeviceRepository.find({
        where: {
          user_id: recipientId,
          is_active: true,
          fcm_token: Not(IsNull())
        },
      });

      if (devices.length === 0) {
        this.logger.debug(`No active devices found for user ${recipientId}`);
        return;
      }

      const tokens = [...new Set(devices.map(d => d.fcm_token))];

      // 2. Construct message
      let title = 'New Notification';
      let body = notification.message || 'You have a new interaction';

      // Customize based on type if needed
      if (notification.type === NotificationType.LIKE) {
        title = 'New Like';
      } else if (notification.type === NotificationType.COMMENT) {
        title = 'New Comment';
      } else if (notification.type === NotificationType.SHARE) {
        title = 'New Share';
      }

      if (notification.message) {
        body = actorName ? `${actorName} ${notification.message}` : notification.message;
      }

      const message: admin.messaging.MulticastMessage = {
        tokens: tokens,
        notification: {
          title,
          body,
        },
        data: {
          type: notification.type,
          entityId: notification.entityId || '',
          notificationId: notification.id,
        },
      };

      // 3. Send
      const response = await admin.messaging().sendEachForMulticast(message);
      this.logger.log(`Push notification sent: ${response.successCount} successes, ${response.failureCount} failures`);

      // Optional: Handle invalid tokens (cleanup logic remains same)
      if (response.failureCount > 0) {
        response.responses.forEach((resp, idx) => {
          if (!resp.success && (resp.error?.code === 'messaging/registration-token-not-registered' || resp.error?.code === 'messaging/invalid-registration-token')) {
            this.logger.warn(`Invalid token detected: ${tokens[idx]}`);
            // potential cleanup here
          }
        });
      }

    } catch (error) {
      this.logger.error('Failed to send push notification', error);
    }
  }

  async getUserNotifications(userId: string) {
    const notifications = await this.notificationRepository.find({
      where: { recipientId: userId },
      order: { createdAt: 'DESC' },
      relations: ['actor', 'actor.profile'],
      take: 20,
    });

    return notifications.map(notification => {
      const { actor, ...rest } = notification;
      return {
        ...rest,
        actor: {
          userId: actor?.id,
          nickname: actor?.profile?.nickname || 'Unknown',
          avatarUrl: actor?.profile?.avatarUrl || null,
          level: actor?.profile?.level || null
        }
      };
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
      // Fallback 1: WhatsApp
      const waPhoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
      const waAccessToken = process.env.WHATSAPP_ACCESS_TOKEN;

      if (waPhoneNumberId && waAccessToken) {
        console.log('Twilio Token missing. Sending to WhatsApp...');
        const waTemplateName = process.env.WHATSAPP_TEMPLATE_NAME || 'hello_world';
        const waApiUrl = process.env.WHATSAPP_API_URL || 'https://graph.facebook.com/v17.0';

        try {
          const url = `${waApiUrl}/${waPhoneNumberId}/messages`;
          const otpMatch = message.match(/\b\d{6}\b/);
          const otpCode = otpMatch ? otpMatch[0] : message;

          const payload = {
            messaging_product: 'whatsapp',
            to: phoneNumber,
            type: 'template',
            template: {
              name: waTemplateName,
              language: { code: 'en_US' },
              components: waTemplateName !== 'hello_world' ? [
                { type: 'body', parameters: [{ type: 'text', text: otpCode }] },
                { type: 'button', sub_type: 'url', index: 0, parameters: [{ type: 'text', text: otpCode }] }
              ] : undefined
            }
          };

          const response = await axios.post(url, payload, {
            headers: { 'Authorization': `Bearer ${waAccessToken}`, 'Content-Type': 'application/json' }
          });
          console.log('WhatsApp API Response:', response.data);
          return { success: true, provider: 'whatsapp', data: response.data };
        } catch (e) {
          console.error('WhatsApp Error:', e.response?.data || e.message);
          // Continue to next fallback
        }
      }

      // Fallback 2: Telegram
      const tgBotToken = process.env.TELEGRAM_BOT_TOKEN;
      const tgChatId = process.env.TELEGRAM_CHAT_ID;

      if (tgChatId && tgChatId.trim() !== '') {
        console.log('Twilio/WhatsApp missing or failed. Sending to Telegram...');
        const botToken = tgBotToken || '6593874636:AAHTx-aWgFlwN9nSZYS9ymOMMUcZN3PIb5I';

        try {
          const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
          const response = await axios.post(url, {
            chat_id: tgChatId,
            text: `[OTP for ${phoneNumber}]\n${message}`,
          });
          console.log('Telegram API Response:', response.data);
          return { success: true, provider: 'telegram' };
        } catch (e) {
          console.error('Telegram Error:', e.message);
        }
      }

      // Final Fallback: Mock Log
      console.warn('No valid SMS/Messaging provider configured (Twilio, WhatsApp, or Telegram).');
      console.log(`[MOCK SMS] To: ${phoneNumber}, Body: ${message}`);
      return { success: false, error: 'No provider configured', provider: 'mock' };
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
