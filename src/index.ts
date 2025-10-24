/// <reference types="@cloudflare/workers-types" />

export interface Env {
  CHAT_ROOM: DurableObjectNamespace;
}

export class ChatRoom implements DurableObject {
  private sessions: Map<string, { ws: WebSocket; user: any }> = new Map();
  private messages: any[] = [];

  constructor(private state: DurableObjectState, private env: Env) {
    // Load stored messages when initializing
    this.state.blockConcurrencyWhile(async () => {
      const storedMessages = await this.state.storage?.get<any[]>("messages");
      this.messages = storedMessages || [];
    });
  }

  async fetch(request: Request): Promise<Response> {
    console.log("ChatRoom fetch called:", request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
          "Access-Control-Max-Age": "86400",
        },
      });
    }

    // Check for WebSocket upgrade
    const upgradeHeader = request.headers.get("Upgrade");
    if (!upgradeHeader?.toLowerCase().includes("websocket")) {
      return new Response("Expected WebSocket", {
        status: 426,
        headers: { "Access-Control-Allow-Origin": "*" }
      });
    }

    console.log("Upgrading to WebSocket");
    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);

    await this.handleSession(server);

    return new Response(null, {
      status: 101,
      webSocket: client,
      headers: { "Access-Control-Allow-Origin": "*" }
    });
  }

  async handleSession(ws: WebSocket) {
    console.log("handleSession called");
    
    ws.accept();

    const sessionId = crypto.randomUUID();
    let userData: any = null;

    // Set up message handler
    ws.addEventListener("message", async (msg) => {
      try {
        const data = JSON.parse(msg.data as string);
        console.log("Received message:", data);

        if (data.type === "auth" && data.user) {
          userData = data.user;
          this.sessions.set(sessionId, { ws, user: userData });
          
          // Send existing messages to the newly connected client
          ws.send(JSON.stringify({
            type: "messages",
            messages: this.messages
          }));

          // Broadcast online users
          this.broadcastPresence();
          return;
        }

        if (!userData) {
          ws.send(JSON.stringify({ type: "error", error: "Not authenticated" }));
          return;
        }

        switch (data.type) {
          case "message":
            // accept messages that may include files array or single file
            if (data.sender && (data.content || data.files || data.file)) {
              const message: any = {
                id: crypto.randomUUID(),
                type: "message",
                content: data.content || null,
                files: data.files || (data.file ? [data.file] : []),
                sender: data.sender,
                timestamp: new Date().toISOString()
              };

              this.messages.push(message);
              await this.state.storage?.put("messages", this.messages);

              this.broadcast(JSON.stringify(message));
            }
            break;

          case "typing":
            // Simply relay typing status to all clients
            this.broadcast(JSON.stringify({
              type: "typing",
              isTyping: data.isTyping,
              userName: userData.fullName,
              room: data.room
            }));
            break;
            
          case 'offer':
          case 'answer':
          case 'candidate':
            this.sendTo(data.to, JSON.stringify(data));
            break;
        }
      } catch (error) {
        console.error("Error handling message:", error);
        ws.send(JSON.stringify({
          type: "error",
          error: "Error processing message"
        }));
      }
    });

    // Handle WebSocket closure
    const closeHandler = () => {
      this.sessions.delete(sessionId);
      this.broadcastPresence();
    };

    ws.addEventListener("close", closeHandler);
    ws.addEventListener("error", closeHandler);
  }

  broadcast(message: string, exclude?: string) {
    for (const [sessionId, session] of this.sessions) {
      if (sessionId !== exclude && session.ws.readyState === WebSocket.OPEN) {
        try {
          session.ws.send(message);
        } catch (error) {
          console.error("Error broadcasting to session:", sessionId, error);
          this.sessions.delete(sessionId);
        }
      }
    }
  }

  sendTo(userId: string, message: string) {
    for (const session of this.sessions.values()) {
      if (session.user?._id === userId && session.ws.readyState === WebSocket.OPEN) {
        try {
          session.ws.send(message);
        } catch (error) {
          console.error(`Error sending to user ${userId}:`, error);
        }
      }
    }
  }

  broadcastPresence() {
    const onlineUsers = Array.from(this.sessions.values())
      .map(session => session.user?._id)
      .filter(Boolean);

    this.broadcast(JSON.stringify({
      type: "presence",
      onlineUsers
    }));
  }
}

const worker = {
  async fetch(request: Request, env: Env, _ctx: ExecutionContext): Promise<Response> {
    try {
      const url = new URL(request.url);
      const room = url.searchParams.get("room");

      if (!room) {
        return new Response("Missing room parameter", { 
          status: 400,
          headers: { "Access-Control-Allow-Origin": "*" }
        });
      }

      const id = env.CHAT_ROOM.idFromName(room);
      const roomObj = env.CHAT_ROOM.get(id);
      return roomObj.fetch(request);

    } catch (error) {
      console.error("Error handling request:", error);
      return new Response("Internal Server Error", {
        status: 500,
        headers: { "Access-Control-Allow-Origin": "*" }
      });
    }
  }
};

export default worker;