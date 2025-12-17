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
  }) {
    const notification = this.notificationRepository.create(payload);
    const saved = await this.notificationRepository.save(notification);

    // Emit Real-time (Socket.io)
    this.notificationsGateway.emitToUser(payload.recipientId, 'notification', saved);

    // Send Push Notification (Firebase)
    await this.sendPushNotification(payload.recipientId, saved);

    return saved;
  }

  private async sendPushNotification(recipientId: string, notification: Notification) {
    try {
      this.logger.log(`[Push] Preparing to send to user: ${recipientId}`);

      if (admin.apps.length === 0) {
        this.logger.warn('[Push] Firebase not initialized. Skipping.');
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

      this.logger.log(`[Push] Found ${devices.length} active devices for user ${recipientId}`);

      if (devices.length === 0) {
        this.logger.debug(`[Push] No active devices found for user ${recipientId}`);
        return;
      }

      const tokens = [...new Set(devices.map(d => d.fcm_token))];
      this.logger.log(`[Push] Target Tokens: ${JSON.stringify(tokens)}`);

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
        body = notification.message;
      }

      this.logger.log(`[Push] Message Payload - Title: ${title}, Body: ${body}`);

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
      this.logger.log(`[Push] Firebase Response: Success=${response.successCount}, Failure=${response.failureCount}`);

      if (response.failureCount > 0) {
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            this.logger.error(`[Push] Failure Detail for token ${tokens[idx]}: ${JSON.stringify(resp.error)}`);
          }
        });
      }

      // Optional: Handle invalid tokens (cleanup logic remains same)
      if (response.failureCount > 0) {
        response.responses.forEach((resp, idx) => {
          if (!resp.success && (resp.error?.code === 'messaging/registration-token-not-registered' || resp.error?.code === 'messaging/invalid-registration-token')) {
            this.logger.warn(`[Push] Invalid token detected: ${tokens[idx]}`);
            // potential cleanup here
          }
        });
      }

    } catch (error) {
      this.logger.error('[Push] Failed to send push notification', error);
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
