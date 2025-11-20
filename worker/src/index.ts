import { NotificationRoom } from './notification_room';
import { ChatRoom } from './chat_room';

export default {
  async fetch(request: Request, env: any) {
    const url = new URL(request.url);
    const room = url.searchParams.get("room");

    if (!room) {
        return new Response("Missing room parameter", { status: 400 });
    }

    let durableObjectNamespace;
    if (room === 'notifications') {
        durableObjectNamespace = env.NOTIFICATIONS_ROOM;
    } else {
        durableObjectNamespace = env.CHAT_ROOM;
    }

    if (!durableObjectNamespace) {
        return new Response(`Durable Object namespace not bound for room: ${room}`, { status: 500 });
    }

    const id = durableObjectNamespace.idFromName(room);
    const stub = durableObjectNamespace.get(id);

    return stub.fetch(request);
  },
};

export { NotificationRoom, ChatRoom };