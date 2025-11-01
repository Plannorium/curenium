
export class ChatRoom {
  state: any;
  sessions: any[];
  messages: any[];

  constructor(state: any, env: any) {
    this.state = state;
    this.sessions = [];
    this.messages = [];
    this.state.blockConcurrencyWhile(async () => {
      this.messages = (await this.state.storage.get("messages")) || [];
    });
  }

  async fetch(request: Request) {
    // This part of the fetch is for WebSocket connections, which is correct.
    // We will handle the broadcast logic in the main worker entrypoint.
    return new Response("This endpoint is for WebSocket connections.", { status: 400 });
  }

  async broadcastAlert(alert: any, recipients: string[]) {
    // This is a simplified broadcast. A real implementation might check
    // which room the recipients are in. For now, we broadcast to all
    // sessions connected to this Durable Object's room.
    const payload = {
      type: 'alert_notification',
      alert: alert,
    };
    const message = JSON.stringify(payload);

    // Get all connected sessions for this room
    const sessions = this.state.getWebSockets();

    // Iterate over the sessions and send the message
    for (const session of sessions) {
      session.send(message);
    }
  }
}