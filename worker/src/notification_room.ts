export interface Env {
    NOTIFICATIONS_ROOM: DurableObjectNamespace;
}

interface PostRequestBody {
    type: 'new_notification';
    payload: any;
}

export class NotificationRoom {
    state: DurableObjectState;
    sessions: WebSocket[] = [];
    env: Env;

    constructor(state: DurableObjectState, env: Env) {
        this.state = state;
        this.env = env;
    }

    async fetch(request: Request) {
        const url = new URL(request.url);
        switch (url.pathname) {
            case "/api/broadcast":
                if (request.method !== "POST") {
                    return new Response("Method Not Allowed", { status: 405 });
                }
                try {
                    const alert = await request.json<any>();
                    this.broadcastAlert(alert);
                    return new Response("Alert broadcasted in room", { status: 200 });
                } catch (error) {
                    return new Response("Invalid JSON for broadcast", { status: 400 });
                }

            default:
                // This handles WebSocket upgrade requests
                if (request.headers.get("Upgrade") === "websocket") {
                    const pair = new WebSocketPair();
                    const [client, server] = Object.values(pair);
                    await this.handleSession(server);
                    return new Response(null, { status: 101, webSocket: client });
                }
                return new Response("Not Found", { status: 404 });
        }
    }

    async broadcast(message: string) {
        this.sessions.forEach((session) => {
            try {
                session.send(message);
            } catch (error) {
                console.error("Failed to send message to a session:", error);
                this.sessions = this.sessions.filter(s => s !== session);
            }
        });
    }

    async handleSession(webSocket: WebSocket) {
        webSocket.accept();
        this.sessions.push(webSocket);

        webSocket.addEventListener("close", () => {
            this.sessions = this.sessions.filter((s) => s !== webSocket);
        });

        webSocket.addEventListener("error", (error) => {
            console.error("WebSocket error:", error);
            this.sessions = this.sessions.filter((s) => s !== webSocket);
        });
    }

    broadcastAlert(alert: any) {
        const message = JSON.stringify({ type: 'new_notification', payload: alert });
        this.broadcast(message);
    }
}