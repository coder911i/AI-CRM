import {
  WebSocketGateway, WebSocketServer,
  SubscribeMessage, MessageBody, ConnectedSocket,
  OnGatewayConnection,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*', credentials: true } })
export class EventsGateway implements OnGatewayConnection {
  @WebSocketServer() server: Server;

  handleConnection(client: Socket) {
    const tenantId = client.handshake.query?.tenantId as string;
    const userId = client.handshake.query?.userId as string;

    if (tenantId) {
      client.join(`tenant:${tenantId}`);
    }
    if (userId) {
      client.join(`user:${userId}`);
    }
  }

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

  emitUnitUpdate(tenantId: string, unitId: string, status: string) {
    this.server.to(`tenant:${tenantId}`).emit('unit:status', { unitId, status });
  }

  emitProjectUpdate(tenantId: string, projectId: string, data: any) {
    this.server.to(`tenant:${tenantId}`).emit('project:updated', { projectId, ...data });
  }
}
