import { Inject, Injectable } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { PinoLogger } from 'nestjs-pino';
import { AccessTokenPayload } from '@modules/auth/interfaces/jwt-payload.interface';
import { UserRole } from '@modules/users/entities/user.entity';
import { AuthSocket } from '@modules/notifications/interfaces/auth-socket.interface';
import { JwtConfig, jwtConfig } from '@config/configuration';

@WebSocketGateway({ cors: '*' })
@Injectable()
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY) private readonly jwt: JwtConfig,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(NotificationsGateway.name);
  }

  async handleConnection(client: AuthSocket) {
    try {
      const token: string | undefined = String(
        client.handshake.auth?.token ||
          client.handshake.headers?.authorization?.split(' ')[1],
      );

      if (!token) {
        client.disconnect();
        return;
      }

      const payload: AccessTokenPayload = await this.jwtService.verifyAsync(
        token,
        { secret: this.jwt.accessSecret },
      );
      client.data.user = payload;
      await client.join(`user:${payload.sub}`);

      if (payload.farmId) {
        await client.join(`farm:${payload.farmId}`);
      }

      if (payload.roles?.includes(UserRole.ADMIN)) await client.join(`admin`);

      this.logger.info(
        `Client connected: ${payload.email} ${payload.roles.join(' ')}`,
      );
    } catch (e) {
      this.logger.error(e);
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthSocket) {
    this.logger.info(
      `Client disconnected: ${client.data.user?.email ?? client.id}`,
    );
  }

  sendToUser(userId: string, event: string, data: any) {
    this.server.to(`user:${userId}`).emit(event, data);
  }

  sendToFarm(farmId: string, event: string, data: any) {
    this.server.to(`farm:${farmId}`).emit(event, data);
  }

  sendToAdmin(event: string, data: any) {
    this.server.to('admin').emit(event, data);
  }
}
