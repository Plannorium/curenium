export interface Env {
    CHAT_ROOM: DurableObjectNamespace;
}

export class ChatRoom {
    state: DurableObjectState;
    sessions: { socket: WebSocket, user: any }[] = [];
    messages: any[] = [];

    constructor(state: DurableObjectState) {
        this.state = state;
        this.state.blockConcurrencyWhile(async () => {
            this.messages = await this.state.storage.get<any[]>("messages") || [];
        });
    }

    async fetch(request: Request) {
        const isWebSocketUpgrade = request.headers.get("Upgrade") === "websocket";

        if (isWebSocketUpgrade) {
            const pair = new WebSocketPair();
            const [client, server] = Object.values(pair);
            await this.handleSession(server);
            return new Response(null, { status: 101, webSocket: client });
        } else {
            return new Response("Expected websocket", { status: 400 });
        }
    }

    async handleSession(webSocket: WebSocket) {
        webSocket.accept();
        const session = { socket: webSocket, user: null };
        this.sessions.push(session);

        console.log("New WebSocket session established");

        webSocket.send(JSON.stringify({ type: "messages", messages: this.messages }));

        webSocket.addEventListener("message", async (event) => {
            const data = JSON.parse(event.data as string);
            console.log("Received message:", data);

            if (data.type === 'auth') {
                session.user = data.user;
                console.log("Authenticated user:", session.user);
                return;
            }

            if (data.type === 'message') {
                if (!session.user) {
                    console.log("Message from unauthenticated user, sending error");
                    webSocket.send(JSON.stringify({ error: 'Not authenticated' }));
                    return;
                }
                const finalMessage = {
                    type: 'message',
                    id: crypto.randomUUID(),
                    content: data.content,
                    files: data.files,
                    createdAt: new Date().toISOString(),
                    sender: {
                        _id: session.user.id,
                        fullName: session.user.name,
                        image: session.user.image || null,
                    },
                };

                this.messages.push(finalMessage);
                if (this.messages.length > 50) {
                    this.messages.shift();
                }
                
                this.broadcast(JSON.stringify(finalMessage));
                await this.state.storage.put("messages", this.messages);
            } else if (data.type === 'reaction') {
                const { messageId, emoji, userId, userName } = data.payload;
                const messageIndex = this.messages.findIndex(msg => msg.id === messageId);

                if (messageIndex > -1) {
                    const originalMessage = this.messages[messageIndex];
                    const currentReactions = originalMessage.reactions || {};
                    const usersForEmoji = currentReactions[emoji] || [];
                    const userIndex = usersForEmoji.findIndex((u: any) => u.userId === userId);

                    let newUsersForEmoji;
                    if (userIndex > -1) {
                        // User is removing reaction: create a new array without the user
                        newUsersForEmoji = usersForEmoji.filter((u: any) => u.userId !== userId);
                    } else {
                        // User is adding reaction: create a new array with the new user
                        newUsersForEmoji = [...usersForEmoji, { userId, userName }];
                    }

                    const newReactions = { ...currentReactions };
                    if (newUsersForEmoji.length === 0) {
                        delete newReactions[emoji];
                    } else {
                        newReactions[emoji] = newUsersForEmoji;
                    }

                    // Create a new message object with the new reactions
                    const updatedMessage = { ...originalMessage, reactions: newReactions };
                    this.messages[messageIndex] = updatedMessage;
                    await this.state.storage.put("messages", this.messages);
                }
                this.broadcast(JSON.stringify(data));
            } else if (data.type === 'typing') {
                this.broadcast(JSON.stringify(data));
            }
        });

        webSocket.addEventListener("close", () => {
            console.log("WebSocket session closed");
            this.sessions = this.sessions.filter((s) => s.socket !== webSocket);
        });

        webSocket.addEventListener("error", (error) => {
            console.error("WebSocket error:", error);
            this.sessions = this.sessions.filter((s) => s.socket !== webSocket);
        });
    }

    broadcast(message: string) {
        console.log("Broadcasting message to all sessions:", message);
        this.sessions.forEach((session) => {
            try {
                session.socket.send(message);
            } catch (error) {
                console.error("Failed to send message to a session:", error);
                this.sessions = this.sessions.filter(s => s.socket !== session.socket);
            }
        });
    }
}

export default <ExportedHandler<Env>>{
    async fetch(request: Request, env: Env): Promise<Response> {
        const url = new URL(request.url);
        const room = url.searchParams.get('room');

        if (!room) {
            return new Response('Missing room query parameter', { status: 400 });
        }

        let id = env.CHAT_ROOM.idFromName(room);
        let stub = env.CHAT_ROOM.get(id);
        return stub.fetch(request);
    },
};