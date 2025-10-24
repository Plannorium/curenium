// connect.ts 
// roomName: string, token: NextAuth session token (JWT) 
export function openRoomSocket(roomName: string, token: string) { 
  // build ws url (same origin). If on Cloudflare domain: wss://curenium.com/ws/ward-A 
  const origin = (location.protocol === "https:" ? "wss://" : "ws://") + location.host; 
  const ws = new WebSocket(`${origin}/ws/${encodeURIComponent(roomName)}`, []); 

  // attach auth header via `Sec-WebSocket-Protocol` workaround or send first auth message 
  // Cloudflare Workers do not allow custom Authorization headers on plain browser WebSocket. 
  // So we send the auth token as the very first message after connection 
  ws.addEventListener("open", () => { 
    ws.send(JSON.stringify({ type: "auth", token })); 
  }); 

  ws.addEventListener("message", (evt) => { 
    const data = JSON.parse(evt.data); 
    console.log("ws message", data); 
  }); 

  // send chat message 
  function sendMessage(text: string) { 
    ws.send(JSON.stringify({ type: "message", text })); 
  } 

  return { ws, sendMessage }; 
}