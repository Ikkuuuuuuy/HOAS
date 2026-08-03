import { Response } from 'express';

interface SSEClient {
  id: string;
  res: Response;
}

export class AlertService {
  private static clients: Map<string, Response> = new Map();

  static addClient(id: string, res: Response): void {
    this.clients.set(id, res);
    console.log(`📡 SSE client connected: ${id} (total: ${this.clients.size})`);
  }

  static removeClient(id: string): void {
    this.clients.delete(id);
    console.log(`📡 SSE client disconnected: ${id} (total: ${this.clients.size})`);
  }

  static broadcast(data: object): void {
    const payload = `data: ${JSON.stringify(data)}\n\n`;
    let sent = 0;
    this.clients.forEach((res, id) => {
      try {
        res.write(payload);
        sent++;
      } catch {
        this.clients.delete(id);
      }
    });
    console.log(`📢 Alert broadcast sent to ${sent} client(s)`);
  }

  static getClientCount(): number {
    return this.clients.size;
  }
}
