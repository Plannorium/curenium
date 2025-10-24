import { ChatRoom } from "@/lib/chat";

export default {
  async fetch(request: Request, env: any) {
    const url = new URL(request.url);
    const room = url.searchParams.get("room");

    if (!room) {
      return new Response("Missing room", { status: 400 });
    }

    const id = env.CHAT_ROOM.idFromName(room);
    const stub = env.CHAT_ROOM.get(id);

    return await stub.fetch(request);
  },
};