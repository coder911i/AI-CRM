import {
  WebSocketGateway, WebSocketServer,
  SubscribeMessage, MessageBody, ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: { origin: process.env.FRONTEND_URL, credentials: true } })
export class EventsGateway {
  @WebSocketServer() server: Server;

  @SubscribeMessage('join')
  handleJoin(@MessageBody() data: { tenantId: string }, @ConnectedSocket() client: Socket) {
    client.join(`tenant:${data.tenantId}`);
    return { event: 'joined', room: `tenant:${data.tenantId}` };
  }

  @SubscribeMessage('join-user')
  handleJoinUser(@MessageBody() data: { userId: string }, @ConnectedSocket() client: Socket) {
    client.join(`user:${data.userId}`);
    return { event: 'joined-user', room: `user:${data.userId}` };
  }

  emitToTenant(tenantId: string, event: string, payload: any) {
    this.server.to(`tenant:${tenantId}`).emit(event, payload);
  }

  emitToUser(userId: string, event: string, payload: any) {
    this.server.to(`user:${userId}`).emit(event, payload);
  }
}
