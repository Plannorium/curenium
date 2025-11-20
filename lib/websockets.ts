let ws: WebSocket | null = null;
let retryCount = 0;
const maxRetries = 3;

const connect = (room: string, token: string) => {
  if (retryCount >= maxRetries) {
    console.error("Max retry attempts reached");
    return;
  }

  const workerUrl =
    process.env.NODE_ENV === "development"
      ? "http://127.0.0.1:8787"
      : process.env.NEXT_PUBLIC_CLOUDFLARE_WORKER_URL;

  if (!workerUrl) {
    console.error("Worker URL is not configured.");
    return;
  }

  let wsUrl;
  try {
    const url = new URL(workerUrl);
    const wsProtocol = url.protocol === "https:" ? "wss" : "ws";
    wsUrl = `${wsProtocol}://${url.host}/api/chat/socket?room=${room}`;
  } catch (error) {
    console.error("Invalid worker URL:", workerUrl, error);
    return;
  }

  ws = new WebSocket(wsUrl);

  ws.onopen = () => {
    console.log("WebSocket connected successfully");
    retryCount = 0;
    ws?.send(JSON.stringify({ type: "auth", token }));
  };

  ws.onclose = (event) => {
    console.log(`WebSocket disconnected: code=${event.code}`);
    if (event.code !== 1000) {
      retryCount++;
      setTimeout(() => connect(room, token), 1000 * Math.pow(2, retryCount));
    }
  };

  ws.onerror = (error) => {
    console.error("WebSocket error:", error);
  };
};

export const sendWebSocketMessage = (payload: any, room: string, token: string) => {
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    connect(room, token);
    setTimeout(() => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(payload));
      }
    }, 3000); // wait for connection
  } else {
    ws.send(JSON.stringify(payload));
  }
};