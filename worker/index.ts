import * as jose from 'jose';
import mongoose from 'mongoose';
import { ICallSession, getCallSessionModel } from '../models/CallSession';


export interface Env {
    CHAT_ROOM: DurableObjectNamespace;
    MONGODB_URI: string;
    NEXTAUTH_SECRET: string;
}

export class ChatRoom {
    state: DurableObjectState;
    sessions: { socket: WebSocket, user: any }[] = [];
    messages: any[] = [];
    users: Map<string, { id: string; name: string; image?: string }> = new Map();
    env: Env;
    callSessionId?: string;

    constructor(state: DurableObjectState, env: Env) {
        this.state = state;
        this.env = env;
        this.state.blockConcurrencyWhile(async () => {
            this.messages = await this.state.storage.get<any[]>("messages") || [];
            this.callSessionId = await this.state.storage.get<string>("callSessionId");
        });
    }

    broadcastPresence() {
        const online = Array.from(this.users.values());
        this.broadcast(JSON.stringify({ type: 'presence', onlineUsers: online }));
    }

    async dbConnect() {
        if (mongoose.connection.readyState >= 1) {
            return;
        }
        return mongoose.connect(this.env.MONGODB_URI);
    }

    async fetch(request: Request) {
        const envHeader = request.headers.get('X-Env');
        if (envHeader) {
            this.env = JSON.parse(envHeader);
        }

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
        this.broadcastPresence();

        webSocket.addEventListener("message", async (event) => {
            const data = JSON.parse(event.data as string);
            console.log("Received message:", data);

            if (data.type === 'auth') {
                try {
                    const secret = new TextEncoder().encode(this.env.NEXTAUTH_SECRET);
                    const { payload } = await jose.jwtVerify(data.token, secret);
                    session.user = payload;
                    this.users.set(payload.id as string, { id: payload.id as string, name: payload.name as string, image: payload.image as string });
                    this.broadcastPresence();
                    console.log("Authenticated user:", session.user);
                } catch (error) {
                    console.error("Authentication failed:", error);
                    webSocket.send(JSON.stringify({ error: 'Authentication failed' }));
                    webSocket.close(1008, "Authentication failed");
                }
                return;
            }

            if (data.type === 'call-start') {
                if (!session.user) {
                    webSocket.send(JSON.stringify({ error: 'Not authenticated' }));
                    return;
                }

                if (!this.callSessionId) {
                    await this.dbConnect();
                    const CallSession = getCallSessionModel(); // Get the model after connecting to the DB
                    const newCallSession = new CallSession({
                        participants: [session.user.id],
                        startTime: new Date(),
                    });
                    await newCallSession.save();
                    this.callSessionId = newCallSession._id.toString();
                    await this.state.storage.put("callSessionId", this.callSessionId);
                    this.broadcast(JSON.stringify({ type: 'call-session-started', callSessionId: this.callSessionId }));
                }
                return;
            }

            if (data.type === 'call') {
                if (!session.user) {
                    console.log("Call message from unauthenticated user, sending error");
                    webSocket.send(JSON.stringify({ error: 'Not authenticated' }));
                    return;
                }
                this.broadcast(JSON.stringify(data));
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

        webSocket.addEventListener("close", async () => {
            console.log("WebSocket session closed");
            const session = this.sessions.find(s => s.socket === webSocket);
            if (session && session.user) {
                this.users.delete(session.user.id);
            }
            this.sessions = this.sessions.filter((s) => s.socket !== webSocket);
            this.broadcastPresence();

            if (this.sessions.length === 0 && this.callSessionId) {
                try {
                    await this.dbConnect();
                    const CallSession = getCallSessionModel(); // Get the model after connecting to the DB
                    const callSession: ICallSession | null = await CallSession.findById(this.callSessionId).exec();
                    if (callSession) {
                        callSession.endTime = new Date();
                        await callSession.save();
                        this.callSessionId = undefined;
                        await this.state.storage.delete("callSessionId");
                    }
                } catch (error) {
                    console.error('Error updating call session:', error);
                }
            }
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

        const newRequest = new Request(request.url, request);
        newRequest.headers.set('X-Env', JSON.stringify(env));

        return stub.fetch(newRequest);
    },
};