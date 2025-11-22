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
    sessions: { socket: WebSocket; user: UserSession | null }[] = [];
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

    // Prune stored messages to keep the durable object's storage bounded while
    // preferentially preserving threaded replies and important notifications.
    pruneMessages() {
        const cap = 500;
        while (this.messages.length > cap) {
            // Prefer removing the oldest non-thread, non-alert, non-call message first
            const idx = this.messages.findIndex((m: any) => !m.threadId && m.type !== 'alert_notification' && m.type !== 'call_invitation' && m.type !== 'call_join');
            if (idx > -1) {
                this.messages.splice(idx, 1);
            } else {
                // Fallback: remove the oldest message
                this.messages.shift();
            }
        }
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
        const corsHeaders = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        };

        // Handle CORS preflight early so browser POSTs with Content-Type: application/json
        // don't fail with a closed connection when hitting the worker in dev.
        if (request.method === 'OPTIONS') {
            return new Response(null, { status: 204, headers: corsHeaders });
        }
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
                return new Response('Call ended', { status: 200, headers: corsHeaders });
            }
            return new Response('Method not allowed', { status: 405, headers: corsHeaders });
        }

        if (url.pathname === '/api/call-invitation') {
            if (request.method === 'POST') {
                try {
                    const { callId, callerName, timestamp } = await request.json() as any;
                    const finalMessage = {
                        type: 'call_invitation',
                        id: callId,
                        text: `${callerName || 'Someone'} started a call.`,
                        userId: 'system',
                        fullName: callerName || 'Someone',
                        createdAt: timestamp || new Date().toISOString(),
                        callId: callId,
                        sender: null,
                    };

                    // Avoid duplicates
                    if (!this.messages.some((m: any) => m.id === finalMessage.id)) {
                        this.messages.push(finalMessage);
                        this.pruneMessages();
                        await this.state.storage.put("messages", this.messages);
                        this.broadcast(JSON.stringify(finalMessage));
                    }

                    return new Response('Call invitation persisted', { status: 200, headers: corsHeaders });
                } catch (err) {
                    console.error('Error persisting call_invitation via HTTP POST', err);
                    return new Response('Bad request', { status: 400, headers: corsHeaders });
                }
            }
            return new Response('Method not allowed', { status: 405, headers: corsHeaders });
        }

        // Handle POST requests for call_end messages sent via HTTP
        if (request.method === 'POST') {
            try {
                const data = await request.json() as any;
                if (data.type === 'call_end') {
                    const { callId, duration } = data;
                    const messageIndex = this.messages.findIndex(msg => msg.id === callId);
                    if (messageIndex > -1) {
                        this.messages[messageIndex].callEnded = true;
                        this.messages[messageIndex].duration = duration;
                        await this.state.storage.put("messages", this.messages);
                        this.broadcast(JSON.stringify({ type: 'message_updated', payload: this.messages[messageIndex] }));
                    }
                    return new Response('Call ended', { status: 200, headers: corsHeaders });
                }

                if (data.type === 'call_join') {
                    // Create a join notice and persist it
                    const finalMessage = {
                        type: 'call_join',
                        id: `${data.callId}-join-${data.callerName || 'unknown'}-${Date.now()}`,
                        text: `${data.callerName || 'Someone'} joined the call.`,
                        userId: data.userId || 'system',
                        fullName: data.callerName || 'Someone',
                        createdAt: data.timestamp || new Date().toISOString(),
                        callId: data.callId,
                        sender: null,
                    };
                    this.messages.push(finalMessage);
                    if (this.messages.length > 50) this.messages.shift();
                    await this.state.storage.put("messages", this.messages);
                    this.broadcast(JSON.stringify(finalMessage));
                    return new Response('Call join persisted', { status: 200 });
                }
                    if (data.type === 'call_invitation') {
                        try {
                            const finalMessage = {
                                type: 'call_invitation',
                                id: data.callId,
                                text: `${data.callerName || 'Someone'} started a call.`,
                                userId: data.userId || 'system',
                                fullName: data.callerName || 'Someone',
                                createdAt: data.timestamp || new Date().toISOString(),
                                callId: data.callId,
                                sender: null,
                            };

                            if (!this.messages.some((m: any) => m.id === finalMessage.id)) {
                                this.messages.push(finalMessage);
                                this.pruneMessages();
                                await this.state.storage.put("messages", this.messages);
                                this.broadcast(JSON.stringify(finalMessage));
                            }
                            return new Response('Call invitation persisted', { status: 200 });
                        } catch (err) {
                            console.error('Failed to persist call_invitation in generic POST handler:', err);
                        }
                    }
            } catch (error) {
                // Not JSON or not a recognized POST payload, continue to WebSocket handling
            }
        }

        const isWebSocketUpgrade = request.headers.get("Upgrade") === "websocket";

        if (isWebSocketUpgrade) {
            const pair = new WebSocketPair();
            const [client, server] = Object.values(pair);
            // Pass token (if provided) from the URL as an optional auth shortcut
            const token = url.searchParams.get('token') || null;
            await this.handleSession(server, token);
            return new Response(null, { status: 101, webSocket: client });
        } else {
            return new Response("Expected websocket", { status: 400 });
        }
    }

    async handleSession(webSocket: WebSocket, token: string | null = null) {
        webSocket.accept();
        const session: { socket: WebSocket; user: UserSession | null } = { socket: webSocket, user: null };
        this.sessions.push(session);

        console.log("New WebSocket session established");

        // If a token was passed on the WebSocket URL (fallback), try to
        // authenticate immediately so the client doesn't have to send an
        // auth message and we avoid auth races.
        if (token) {
            try {
                const tryVerify = async (secretLiteral: string) => {
                    try {
                        const secret = new TextEncoder().encode(secretLiteral);
                        const { payload } = await jose.jwtVerify(token, secret, {});
                        return payload as unknown as UserSession;
                    } catch (err) {
                        return null;
                    }
                };

                let userPayload: UserSession | null = null;
                if (this.env.NEXTAUTH_SECRET) {
                    userPayload = await tryVerify(this.env.NEXTAUTH_SECRET);
                }
                if (!userPayload) {
                    try {
                        const maybe = atob(this.env.NEXTAUTH_SECRET || '');
                        if (maybe) userPayload = await tryVerify(maybe);
                    } catch (e) {}
                }
                if (!userPayload) {
                    try {
                        const decoded = typeof Buffer !== 'undefined' ? Buffer.from(this.env.NEXTAUTH_SECRET || '', 'base64').toString('utf-8') : null;
                        if (decoded) userPayload = await tryVerify(decoded as string);
                    } catch (e) {}
                }
                if (userPayload) {
                    session.user = userPayload;
                    this.users.set(userPayload.id as string, { id: userPayload.id as string, name: userPayload.name as string, image: userPayload.image as string });
                    this.broadcastPresence();
                    console.log('Authenticated (via token param) user:', userPayload.name, userPayload.id);
                }
            } catch (err) {
                console.warn('Token param auth attempt failed', err);
            }
        }

        webSocket.send(JSON.stringify({ type: "messages", messages: this.messages }));
        this.broadcastPresence();

        webSocket.addEventListener("message", async (event) => {
            const data = JSON.parse(event.data as string);
            console.log("Received message:", data);

            if (data.type === 'auth') {
                // Robust JWT verification with a couple fallback attempts. In
                // production we've seen tokens that fail verification due to
                // secret encoding differences (raw vs base64). Try sensible
                // alternatives before rejecting.
                const attempts: string[] = [];
                const tryVerify = async (secretLiteral: string) => {
                    try {
                        const secret = new TextEncoder().encode(secretLiteral);
                        const { payload } = await jose.jwtVerify(data.token, secret, {});
                        return payload as unknown as UserSession;
                    } catch (err) {
                        attempts.push(String(err?.message || err));
                        return null;
                    }
                };

                try {
                    let userPayload: UserSession | null = null;

                    // 1) Try the configured NEXTAUTH_SECRET as-is
                    if (this.env.NEXTAUTH_SECRET) {
                        userPayload = await tryVerify(this.env.NEXTAUTH_SECRET);
                    }

                    // 2) If that failed, and the secret looks base64-ish, try decoding it
                    if (!userPayload) {
                        try {
                            const maybe = atob(this.env.NEXTAUTH_SECRET || '');
                            if (maybe) {
                                userPayload = await tryVerify(maybe);
                            }
                        } catch (e) {
                            // ignore atob errors
                        }
                    }

                    // 3) Try interpreting the secret as pure base64 bytes
                    if (!userPayload) {
                        try {
                            const decoded = typeof Buffer !== 'undefined' ? Buffer.from(this.env.NEXTAUTH_SECRET || '', 'base64').toString('utf-8') : null;
                            if (decoded) {
                                userPayload = await tryVerify(decoded);
                            }
                        } catch (e) {
                            // ignore
                        }
                    }

                    // 4) As a last resort, attempt to decode without verification to at
                    // least extract the payload for debugging (do NOT treat this as auth success)
                    if (!userPayload) {
                        try {
                            const decoded = jose.decodeJwt(data.token);
                            console.warn('Auth failed - token payload (unverified):', decoded);
                        } catch (e) {
                            console.warn('Auth failed and unable to decode token payload');
                        }
                    }

                    if (!userPayload) {
                        console.error('Authentication failed. Attempts:', attempts);
                        webSocket.send(JSON.stringify({ error: 'Authentication failed' }));
                        webSocket.close(1008, 'Authentication failed');
                        return;
                    }

                    session.user = userPayload;
                    this.users.set(userPayload.id as string, { id: userPayload.id as string, name: userPayload.name as string, image: userPayload.image as string });
                    this.broadcastPresence();
                    console.log('Authenticated user:', userPayload.name, userPayload.id);
                } catch (error) {
                    console.error('Authentication unexpected error:', error);
                    webSocket.send(JSON.stringify({ error: 'Authentication failed' }));
                    webSocket.close(1008, 'Authentication failed');
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
                    file: data.files,
                    files: data.files,
                    replyTo: data.replyTo, // This was missing
                    createdAt: new Date().toISOString(),
                    sender: {
                        _id: this.getUserFromSession(session).id,
                        fullName: this.getUserFromSession(session).name,
                        image: this.getUserFromSession(session).image || null,
                    },
                    status: 'sent',
                };

                this.messages.push(finalMessage);
                this.pruneMessages();
                this.broadcast(JSON.stringify(finalMessage));
                await this.state.storage.put("messages", this.messages);
            } else if (data.type === 'call_join') {
                // Persist a join notice so the chat retains who joined the call
                try {
                    const finalMessage = {
                        type: 'call_join',
                        id: `${data.callId}-join-${(session.user as unknown as UserSession).id}-${Date.now()}`,
                        text: `${data.callerName} joined the call.`,
                        userId: (session.user as unknown as UserSession).id,
                        fullName: data.callerName,
                        createdAt: data.timestamp || new Date().toISOString(),
                        callId: data.callId,
                        sender: {
                            _id: (session.user as unknown as UserSession).id,
                            fullName: (session.user as unknown as UserSession).name,
                            image: (session.user as unknown as UserSession).image || null,
                        },
                    };

                    this.messages.push(finalMessage);
                    this.pruneMessages();
                    this.broadcast(JSON.stringify(finalMessage));
                    await this.state.storage.put("messages", this.messages);
                } catch (err) {
                    console.error('Failed to persist call_join:', err);
                }
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
                        newUsersForEmoji = usersForEmoji.filter((u: any) => u.userId !== userId);
                    } else {
                        newUsersForEmoji = [...usersForEmoji, { userId, userName }];
                    }

                    const newReactions = { ...currentReactions };
                    if (newUsersForEmoji.length === 0) {
                        delete newReactions[emoji];
                    } else {
                        newReactions[emoji] = newUsersForEmoji;
                    }

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
                    this.messages[messageIndex] = {
                        ...this.messages[messageIndex],
                        content: 'This message was deleted',
                        text: 'This message was deleted',
                        file: undefined,
                        files: undefined,
                        deleted: {
                            by: (session.user as unknown as UserSession)?.name || 'A user',
                            at: new Date().toISOString(),
                        },
                    };

                    await this.state.storage.put("messages", this.messages);
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
                this.pruneMessages();

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
    sessions: { socket: WebSocket, userId: string | null }[] = [];
    env: Env;

    constructor(state: DurableObjectState, env: Env) {
        this.state = state;
        this.env = env;
    }

    async handleSession(socket: WebSocket, userId: string, token: string | null = null) {
        socket.accept();
        const session = { socket, userId: null as string | null };
        this.sessions.push(session);

        // Set a timeout for authentication - close connection if not authenticated within 10 seconds
        const authTimeout = setTimeout(() => {
            if (!session.userId) {
                console.log("Authentication timeout for notification WebSocket");
                socket.close(1008, "Authentication timeout");
            }
        }, 10000);

        // If a token param was provided on the upgrade URL, try to verify it
        // immediately and set session.userId to avoid auth races.
        if (token) {
            try {
                const tryVerify = async (secretLiteral: string) => {
                    try {
                        const secret = new TextEncoder().encode(secretLiteral);
                        const { payload } = await jose.jwtVerify(token, secret);
                        return payload as any;
                    } catch (err) {
                        return null;
                    }
                };

                let payload: any = null;
                if (this.env.NEXTAUTH_SECRET) payload = await tryVerify(this.env.NEXTAUTH_SECRET);
                if (!payload) {
                    try {
                        const maybe = atob(this.env.NEXTAUTH_SECRET || '');
                        if (maybe) payload = await tryVerify(maybe);
                    } catch (e) {}
                }
                if (!payload) {
                    try {
                        const decoded = typeof Buffer !== 'undefined' ? Buffer.from(this.env.NEXTAUTH_SECRET || '', 'base64').toString('utf-8') : null;
                        if (decoded) payload = await tryVerify(decoded as string);
                    } catch (e) {}
                }

                if (payload && payload.id === userId) {
                    session.userId = userId;
                    console.log('Notification WebSocket pre-authenticated for user:', userId);
                    socket.send(JSON.stringify({ type: 'authenticated', message: 'WebSocket authenticated successfully' }));
                }
            } catch (err) {
                console.warn('NotificationRoom token param auth failed', err);
            }
        }

        socket.addEventListener("message", async (event) => {
            try {
                const data = JSON.parse(event.data as string);
                console.log("NotificationRoom received message:", data);

                if (data.type === 'auth') {
                    // Try a few variants of the secret to be resilient to
                    // encoding differences (raw vs base64). Must match the
                    // requested userId.
                    const attempts: string[] = [];
                    const tryVerify = async (secretLiteral: string) => {
                        try {
                            const secret = new TextEncoder().encode(secretLiteral);
                            const { payload } = await jose.jwtVerify(data.token, secret);
                            return payload as any;
                        } catch (err) {
                            attempts.push(String(err?.message || err));
                            return null;
                        }
                    };

                    try {
                        let payload: any = null;
                        if (this.env.NEXTAUTH_SECRET) payload = await tryVerify(this.env.NEXTAUTH_SECRET);
                        if (!payload) {
                            try {
                                const maybe = atob(this.env.NEXTAUTH_SECRET || '');
                                if (maybe) payload = await tryVerify(maybe);
                            } catch (e) {}
                        }
                        if (!payload) {
                            try {
                                const decoded = typeof Buffer !== 'undefined' ? Buffer.from(this.env.NEXTAUTH_SECRET || '', 'base64').toString('utf-8') : null;
                                if (decoded) payload = await tryVerify(decoded as string);
                            } catch (e) {}
                        }

                        if (payload && payload.id === userId) {
                            session.userId = userId;
                            clearTimeout(authTimeout);
                            console.log('Notification WebSocket authenticated for user:', userId);
                            socket.send(JSON.stringify({ type: 'authenticated', message: 'WebSocket authenticated successfully' }));
                        } else {
                            console.error('Authentication failed: user ID mismatch or no payload. Attempts:', attempts);
                            clearTimeout(authTimeout);
                            socket.send(JSON.stringify({ error: 'Authentication failed' }));
                            socket.close(1008, 'Authentication failed');
                        }
                    } catch (error) {
                        console.error('Authentication failed:', error);
                        clearTimeout(authTimeout);
                        socket.send(JSON.stringify({ error: 'Authentication failed' }));
                        socket.close(1008, 'Authentication failed');
                    }
                } else if (!session.userId) {
                    // Reject any messages before authentication
                    socket.send(JSON.stringify({ error: 'Not authenticated' }));
                    socket.close(1008, "Not authenticated");
                }
            } catch (error) {
                console.error("Error parsing notification message:", error);
            }
        });

        socket.addEventListener("close", () => {
            clearTimeout(authTimeout);
            this.sessions = this.sessions.filter(s => s.socket !== socket);
        });

        socket.addEventListener("error", () => {
            clearTimeout(authTimeout);
            this.sessions = this.sessions.filter(s => s.socket !== socket);
        });
    }

    async fetch(request: Request): Promise<Response> {
        const url = new URL(request.url);
        const corsHeaders = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        };

        const envHeader = request.headers.get('X-Env');
        if (envHeader) {
            this.env = JSON.parse(envHeader);
        }

        // Preflight support for browser probes
        if (request.method === 'OPTIONS') {
            return new Response(null, { status: 204, headers: corsHeaders });
        }

        if (url.pathname === '/api/broadcast-notification') {
            const { type, payload } = await request.json<{ type: string, payload: any }>();
            // Send to all authenticated sessions for this user
            this.sessions.forEach(session => {
                if (session.userId && session.socket.readyState === WebSocket.OPEN) {
                    try {
                        session.socket.send(JSON.stringify({ type, payload }));
                    } catch (error) {
                        console.error("Failed to send notification to session:", error);
                        this.sessions = this.sessions.filter(s => s.socket !== session.socket);
                    }
                }
            });
            return new Response('Notification broadcasted', { status: 200, headers: corsHeaders });
        }

        const isWebSocketUpgrade = request.headers.get("Upgrade") === "websocket";
        if (isWebSocketUpgrade) {
            const pair = new WebSocketPair();
            const [client, server] = Object.values(pair);
            const userId = url.searchParams.get('user') || '';
            const token = url.searchParams.get('token') || null;
            await this.handleSession(server, userId, token);
            return new Response(null, { status: 101, webSocket: client });
        } else {
            // For non-websocket requests, return a helpful response with CORS headers so browser probes don't fail.
            return new Response("Expected websocket", { status: 400, headers: corsHeaders });
        }
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

        // Handle call WebSocket connections
        if (url.pathname.startsWith('/ws/call-')) {
            const room = url.pathname.replace('/ws/', '');
            const id = env.CHAT_ROOM.idFromName(room);
            const stub = env.CHAT_ROOM.get(id);
            const newRequest = new Request(request.url, request);
            newRequest.headers.set('X-Env', JSON.stringify(env));
            return stub.fetch(newRequest);
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