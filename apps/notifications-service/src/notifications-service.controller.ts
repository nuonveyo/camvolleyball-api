import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { NotificationsServiceService } from './notifications-service.service';
import { NotificationType } from '@app/common';

@Controller()
export class NotificationsServiceController {
  constructor(private readonly notificationsService: NotificationsServiceService) { }

  @MessagePattern('notify_user')
  async notifyUser(@Payload() data: { recipientId: string; actorId: string; type: NotificationType; entityId?: string; message?: string }) {
    return this.notificationsService.createNotification(data);
  }

  @MessagePattern('get_notifications')
  async getNotifications(@Payload() userId: string) {
    return this.notificationsService.getUserNotifications(userId);
  }

  @MessagePattern('mark_read')
  async markRead(@Payload() id: string) {
    return this.notificationsService.markAsRead(id);
  }

  @MessagePattern('send_sms')
  async sendSms(@Payload() data: { phoneNumber: string, message: string }) {
    return this.notificationsService.sendSms(data.phoneNumber, data.message);
  }
}
