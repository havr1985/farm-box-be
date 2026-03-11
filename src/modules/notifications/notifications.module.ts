import { Module } from '@nestjs/common';
import { NotificationsGateway } from '@modules/notifications/notifications.gateway';
import { NotificationsService } from '@modules/notifications/notifications.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [JwtModule.register({})],
  providers: [NotificationsGateway, NotificationsService],
})
export class NotificationsModule {}
