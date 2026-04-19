import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { WsJwtGuard } from '../guards/ws-jwt.guard'; // I need to create this

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'sync',
})
export class SyncGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    const tenantId = client.handshake.query.tenantId as string;
    if (tenantId) {
      client.join(`tenant_${tenantId}`);
      console.log(`Client ${client.id} joined tenant_${tenantId}`);
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`Client ${client.id} disconnected`);
  }

  emitUnitUpdate(tenantId: string, unitId: string, status: string) {
    this.server.to(`tenant_${tenantId}`).emit('unit_updated', { unitId, status });
  }

  emitProjectUpdate(tenantId: string, projectId: string, data: any) {
    this.server.to(`tenant_${tenantId}`).emit('project_updated', { projectId, ...data });
  }

  @SubscribeMessage('subscribe_project')
  handleSubscribeProject(client: Socket, projectId: string) {
    client.join(`project_${projectId}`);
    return { event: 'subscribed', data: projectId };
  }
}
