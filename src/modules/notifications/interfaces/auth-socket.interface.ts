import { Socket } from 'socket.io';
import { AccessTokenPayload } from '@modules/auth/interfaces/jwt-payload.interface';

export interface AuthSocket extends Socket {
  data: {
    user: AccessTokenPayload;
  };
}
