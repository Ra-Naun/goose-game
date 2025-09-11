import { Socket } from 'socket.io';

export class UsersSockets {
  usersSockets: Map<string, Set<Socket>> = new Map(); // playerId -> Set<Socket>

  getUserSockets(playerId: string): Set<Socket> {
    if (!this.usersSockets.has(playerId)) {
      this.usersSockets.set(playerId, new Set());
    }
    return this.usersSockets.get(playerId)!;
  }

  registerUserSocket(playerId: string, socket: Socket) {
    const userSockets = this.getUserSockets(playerId);
    userSockets.add(socket);
  }

  unregisterUserSocket(playerId: string, socket: Socket) {
    const userSockets = this.getUserSockets(playerId);
    userSockets.delete(socket);
    if (userSockets.size === 0) {
      this.usersSockets.delete(playerId);
    }
  }
}
