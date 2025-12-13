import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
    cors: {
        origin: '*', // Allow all origins for dev
    },
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    // Map userId -> socketId(s)
    private userSockets: Map<string, string[]> = new Map();

    constructor(private readonly jwtService: JwtService) { }

    async handleConnection(client: Socket) {
        try {
            // Extract token from query or headers. Client should send ?token=...
            const token = client.handshake.query.token as string;
            if (!token) {
                // Allow connection but maybe minimal access? Or disconnect.
                // For now, strict auth.
                // client.disconnect(); // Let's not disconnect strictly yet for simpler testing, but we won't map user.
                return;
            }

            const payload = this.jwtService.decode(token) as any;
            if (payload && payload.sub) {
                const userId = payload.sub;
                const sockets = this.userSockets.get(userId) || [];
                sockets.push(client.id);
                this.userSockets.set(userId, sockets);
                console.log(`User ${userId} connected on socket ${client.id}`);
            }
        } catch (e) {
            console.log('WS Connection auth error', e);
        }
    }

    handleDisconnect(client: Socket) {
        // Ideally remove socket from mapping
        // iterating map is slow, but optimized maps or Redis adapter is better for scale.
        // For MVP:
        this.userSockets.forEach((sockets, userId) => {
            const index = sockets.indexOf(client.id);
            if (index !== -1) {
                sockets.splice(index, 1);
                if (sockets.length === 0) {
                    this.userSockets.delete(userId);
                }
            }
        });
    }

    emitToUser(userId: string, event: string, data: any) {
        const sockets = this.userSockets.get(userId);
        if (sockets && sockets.length > 0) {
            sockets.forEach(socketId => {
                this.server.to(socketId).emit(event, data);
            });
        }
    }
}
