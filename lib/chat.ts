
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

  async handleMessageStatusUpdate(message: any) {
    const { messageId, status, room } = message.payload;

    // Find the original message and update its status
    const originalMessageIndex = this.messages.findIndex(m => m.id === messageId);
    if (originalMessageIndex !== -1) {
      this.messages[originalMessageIndex].status = status;
      await this.state.storage.put("messages", this.messages);

      // Notify the sender about the status update
      const senderSession = this.sessions.find(s => s.id === this.messages[originalMessageIndex].userId);
      if (senderSession) {
        senderSession.webSocket.send(JSON.stringify({
          type: 'message_status_update',
          payload: { messageId, status },
        }));
      }
    }
  }
}