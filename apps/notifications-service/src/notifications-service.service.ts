import { Injectable } from '@nestjs/common';
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
}
