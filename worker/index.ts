import * as jose from 'jose';
import mongoose from 'mongoose';
import { ICallSession, getCallSessionModel } from '../models/CallSession';

export interface Env {
    CHAT_ROOM: DurableObjectNamespace;
    NOTIFICATIONS_ROOM: DurableObjectNamespace;
    MONGODB_URI: string;
    NEXTAUTH_SECRET: string;
    WORKER_INTERNAL_AUTH_KEY: string;
}

interface UserSession {
    id?: string;
    name?: string;
    image?: string;
    role?: string;
    orgId?: string;
    sub?: string;
}

export class ChatRoom {
    state: DurableObjectState;
    sessions: { socket: WebSocket, user: UserSession | null }[] = [];
    messages: any[] = [];
    users: Map<string, { id: string; name: string; image?: string }> = new Map();
    env: Env;
    callSessionId?: string;

    private getUserFromSession(session: { socket: WebSocket, user: UserSession | null }): UserSession {
        if (!session.user) {
            throw new Error('User not authenticated');
        }
        return session.user;
    }

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
        const url = new URL(request.url);
        const envHeader = request.headers.get('X-Env');
        if (envHeader) {
            this.env = JSON.parse(envHeader);
        }

        if (url.pathname === '/api/broadcast') {
            if (request.method === 'POST') {
                const { alert } = await request.json<{ alert: any }>();
                await this.broadcastAlert(alert);
                return new Response('Alert broadcasted in room', { status: 200 });
            }
            return new Response('Method not allowed', { status: 405 });
        }

        if (url.pathname === '/api/call-end') {
            if (request.method === 'POST') {
                const { callId, duration } = await request.json<{ callId: string; duration: string }>();
                const messageIndex = this.messages.findIndex(msg => msg.id === callId);
                if (messageIndex > -1) {
                    this.messages[messageIndex].callEnded = true;
                    this.messages[messageIndex].duration = duration;
                    await this.state.storage.put("messages", this.messages);
                    this.broadcast(JSON.stringify({ type: 'message_updated', payload: this.messages[messageIndex] }));
                }
                return new Response('Call ended', { status: 200 });
            }
            return new Response('Method not allowed', { status: 405 });
        }

        // Handle POST requests for call_end messages sent via HTTP
        if (request.method === 'POST') {
            try {
                const data = await request.json() as { type: string; callId: string; duration: string };
                if (data.type === 'call_end') {
                    const { callId, duration } = data;
                    const messageIndex = this.messages.findIndex(msg => msg.id === callId);
                    if (messageIndex > -1) {
                        this.messages[messageIndex].callEnded = true;
                        this.messages[messageIndex].duration = duration;
                        await this.state.storage.put("messages", this.messages);
                        this.broadcast(JSON.stringify({ type: 'message_updated', payload: this.messages[messageIndex] }));
                    }
                    return new Response('Call ended', { status: 200 });
                }
            } catch (error) {
                // Not JSON or not a call_end message, continue to WebSocket handling
            }
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
                    (session as any).user = payload as unknown as UserSession;
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
                        participants: [(session.user as UserSession).id],
                        startTime: new Date(),
                    });
                    await newCallSession.save();
                    this.callSessionId = newCallSession._id?.toString() || '';
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
                    threadId: data.threadId,
                    content: data.content,
                    file: data.files, // Ensure single file is also handled
                    files: data.files,
                    replyTo: data.replyTo, // This will now include the 'file' property
                    createdAt: new Date().toISOString(),
                    sender: {
                        _id: this.getUserFromSession(session).id,
                        fullName: this.getUserFromSession(session).name,
                        image: this.getUserFromSession(session).image || null,
                    },
                    status: 'sent',
                };

                this.messages.push(finalMessage);
                if (this.messages.length > 50) {
                    this.messages.shift();
                }
                
                this.broadcast(JSON.stringify(finalMessage));
                await this.state.storage.put("messages", this.messages);
            } else if (data.type === 'message_status_update') {
                const { messageId, status } = data.payload;
                const messageIndex = this.messages.findIndex(msg => msg.id === messageId);

                if (messageIndex > -1) {
                    this.messages[messageIndex].status = status;
                    await this.state.storage.put("messages", this.messages);
                    this.broadcast(JSON.stringify({ type: 'message_status_update', payload: { messageId, status } }));
                }
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
            } else if (data.type === 'delete_message') {
                const { messageId } = data.payload;
                const messageIndex = this.messages.findIndex(msg => msg.id === messageId);

                if (messageIndex > -1) {
                    // "Soft delete" the message by updating its properties
                    this.messages[messageIndex] = {
                        ...this.messages[messageIndex],
                        content: 'This message was deleted',
                        text: 'This message was deleted',
                        file: undefined,
                        files: undefined, // Clear files
                        deleted: {
                            by: (session.user as unknown as UserSession)?.name || 'A user',
                            at: new Date().toISOString(),
                        },
                    };

                    await this.state.storage.put("messages", this.messages);
                    // Broadcast the updated message object
                    this.broadcast(JSON.stringify({ type: 'message_updated', payload: this.messages[messageIndex] }));
                }
            } else if (data.type === 'call_invitation') {
                const finalMessage = {
                    type: 'call_invitation',
                    id: data.callId,
                    text: `${data.callerName} started a call.`,
                    userId: (session.user as unknown as UserSession).id,
                    fullName: data.callerName,
                    createdAt: data.timestamp,
                    callId: data.callId,
                    sender: {
                        _id: (session.user as unknown as UserSession).id,
                        fullName: (session.user as unknown as UserSession).name,
                        image: (session.user as unknown as UserSession).image || null,
                    },
                };

                this.messages.push(finalMessage);
                if (this.messages.length > 50) {
                    this.messages.shift();
                }

                this.broadcast(JSON.stringify(finalMessage));
                await this.state.storage.put("messages", this.messages);
            }
        });

        webSocket.addEventListener("close", async () => {
            console.log("WebSocket session closed");
            const session = this.sessions.find(s => s.socket === webSocket);
            if (session && session.user && session.user.id) {
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

    async broadcastAlert(alert: any) {
        const sender = alert.createdBy || alert.sender;
        if (!sender || !sender._id) {
            console.error('Invalid alert: missing sender or sender._id', alert);
            return;
        }
        // Ensure every alert has a unique ID before processing
        const alertWithId = { ...alert, _id: alert._id || crypto.randomUUID() };
        const alertMessage = {
            type: 'alert_notification',
            id: alertWithId._id,
            alert: alertWithId,
            text: alertWithId.message,
            userId: sender._id,
            fullName: sender.fullName,
            createdAt: alert.createdAt || new Date().toISOString(),
        };

        // Store the alert in messages for persistence
        this.messages.push(alertMessage);
        if (this.messages.length > 50) {
            this.messages.shift();
        }
        await this.state.storage.put("messages", this.messages);

        const payload = {
            type: 'alert_notification',
            alert: alertWithId,
        };
        this.broadcast(JSON.stringify(payload));
    }
}

const createDirectRoom = (userId1: string, userId2: string) => {
    const sortedIds = [userId1, userId2].sort();
    return sortedIds.join('-');
};

export class NotificationRoom {
    state: DurableObjectState;
    sessions: WebSocket[] = [];

    constructor(state: DurableObjectState, env: Env) {
        this.state = state;
    }

    handleSession(socket: WebSocket) {
        socket.accept();
        this.sessions.push(socket);
        socket.send(JSON.stringify({ type: 'connection_established', message: 'WebSocket connection established' }));

        socket.addEventListener("message", async (event) => {
            try {
                const data = JSON.parse(event.data as string);
                console.log("NotificationRoom received message:", data);

                if (data.type === 'auth') {
                    // Handle authentication if needed
                    console.log("Notification WebSocket authenticated");
                    // Could verify token here if needed
                }
                // Handle other message types if needed
            } catch (error) {
                console.error("Error parsing notification message:", error);
            }
        });

        socket.addEventListener("close", () => {
            this.sessions = this.sessions.filter(s => s !== socket);
        });
        socket.addEventListener("error", () => {
            this.sessions = this.sessions.filter(s => s !== socket);
        });
    }

    async fetch(request: Request): Promise<Response> {
        const url = new URL(request.url);
        if (url.pathname === '/api/broadcast-notification') {
            const { type, payload } = await request.json<{ type: string, payload: any }>();
            this.sessions.forEach(ws => {
                if (ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify({ type, payload }));
                }
            });
            return new Response('Notification broadcasted', { status: 200 });
        }
        const pair = new WebSocketPair();
        this.handleSession(pair[1]);
        return new Response(null, { status: 101, webSocket: pair[0] });
    }
}

export default <ExportedHandler<Env>>{
    async fetch(request: Request, env: Env): Promise<Response> {
        const url = new URL(request.url);

        // Route for broadcasting alerts from the Next.js backend
        if (url.pathname === '/api/broadcast-alert') {
            if (request.method !== 'POST') {
                return new Response('Method not allowed', { status: 405 });
            }

            // Authenticate the internal request
            const authKey = request.headers.get('X-Internal-Auth-Key');
            if (env.WORKER_INTERNAL_AUTH_KEY && authKey !== env.WORKER_INTERNAL_AUTH_KEY) {
                return new Response('Unauthorized', { status: 401 });
            }

            try {
                const { notification, recipients, originalRecipients } = await request.json<{ notification: any; recipients: string[]; originalRecipients?: string[] }>();
                const chatRoomsToNotify = new Set<string>();
                const userNotificationsToNotify = new Set<string>();

                // Handle original recipients for channels
                if (originalRecipients) {
                    for (const recipient of originalRecipients) {
                        if (recipient.startsWith('channel:')) {
                            // It's a channel, add the channel name as a room to notify
                            chatRoomsToNotify.add(recipient.replace('channel:', ''));
                        }
                    }
                }

                for (const recipient of recipients) {
                    // It's a user ID.
                    // Send to their "self-chat" room for an in-app alert message
                    chatRoomsToNotify.add(createDirectRoom(recipient, recipient));
                    // Also send to their dedicated notification room for the navbar
                    userNotificationsToNotify.add(recipient);
                }

                // Dispatch to ChatRoom Durable Objects
                const chatPromises = Array.from(chatRoomsToNotify).map(roomName => {
                    const id = env.CHAT_ROOM.idFromName(roomName);
                    const stub = env.CHAT_ROOM.get(id);
                    return stub.fetch(new Request(`${url.origin}/api/broadcast`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ alert: notification }),
                    }));
                });

                // Dispatch to NotificationRoom Durable Objects
                const notificationPromises = Array.from(userNotificationsToNotify).map(userId => {
                    const id = env.NOTIFICATIONS_ROOM.idFromName(userId);
                    const stub = env.NOTIFICATIONS_ROOM.get(id);
                    // Ensure the notification has an ID before broadcasting.
                    const notificationWithId = { ...notification, _id: notification._id || crypto.randomUUID() };
                    // The NotificationRoom expects a 'new_notification' type in its broadcast
                    return stub.fetch(new Request(`${url.origin}/api/broadcast-notification`, { // This path is internal to the worker
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ type: 'new_notification', payload: notificationWithId }),
                    }));
                });

                await Promise.all([...chatPromises, ...notificationPromises]);
                return new Response('Alert broadcast initiated', { status: 202 });
            } catch (error) {
                console.error('Error in /api/broadcast-alert:', error);
                return new Response('Internal Server Error', { status: 500 });
            }
        }

        // Default route for WebSocket connections and HTTP messages
        const room = url.searchParams.get('room');
        if (room) {
            const id = env.CHAT_ROOM.idFromName(room);
            const stub = env.CHAT_ROOM.get(id);
            const newRequest = new Request(request.url, request);
            newRequest.headers.set('X-Env', JSON.stringify(env));
            return stub.fetch(newRequest);
        }

        const notifUserId = url.searchParams.get('user');
        if (notifUserId) {
            const id = env.NOTIFICATIONS_ROOM.idFromName(notifUserId);
            const stub = env.NOTIFICATIONS_ROOM.get(id);
            const newRequest = new Request(request.url, request);
            newRequest.headers.set('X-Env', JSON.stringify(env));
            return stub.fetch(newRequest);
        }

        if (url.pathname.startsWith("/api/notifications/socket")) {
            const isWebSocketUpgrade = request.headers.get("Upgrade") === "websocket";
            if (isWebSocketUpgrade) {
                const notifUserId = url.searchParams.get('user');
                const id = env.NOTIFICATIONS_ROOM.idFromName(notifUserId || 'default');
                const stub = env.NOTIFICATIONS_ROOM.get(id);
                return stub.fetch(request);
            } else {
                return new Response('Method not allowed', { status: 405 });
            }
        }

        return new Response('Not found', { status: 404 });
    },
};