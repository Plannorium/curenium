import { fetchApi } from "@/lib/api";
import { toast } from "sonner";
import { useEffect, useState, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { playSound } from "@/lib/sound/soundGenerator";

export interface UploadResponse {
  url: string;
  public_id: string;
  name: string;
  type: string;
  size?: number;
  resource_type?: string;
  thumbnailUrl?: string;
  pdfUrl?: string;
  previewUrl?: string;
  pageCount?: number;
}

export interface Message {
  id: string;
  text: string;
  userId: string;
  fullName: string;
  userImage?: string | null;
  threadId?: string | null; // Add threadId to the Message interface
  file?: MessageFile;
  content?: any;
  createdAt?: string;
  type?: "message" | "alert_notification" | "call_invitation" | "call_join";
  alert?: any;
  reactions?: { [emoji: string]: { userId: string; fullName: string }[] };
  sender?: {
    _id: string;
    fullName: string;
    image?: string;
  };
  replyTo?: {
    id: string;
    fullName: string;
    text: string;
    file?: MessageFile;
  };
  status?: "sent" | "delivered" | "read";
  callId?: string;
  callEnded?: boolean;
  duration?: string;
}

// Allow messages to carry a single file or multiple files
export type MessageFile = UploadResponse | Partial<UploadResponse> | (UploadResponse | Partial<UploadResponse>)[] | undefined;

interface WebSocketMessage {
  type:
    | "typing"
    | "message"
    | "messages"
    | "presence"
    | "auth"
    | "reaction"
    | "alert_notification"
    | "vitals_update"
    | "message_status_update"
    | "call_invitation";
  isTyping?: boolean;
  fullName?: string;
  messages?: Message[];
  onlineUsers?: string[];
  sender?: {
    fullName: string;
    _id: string;
    image?: string;
  };
  alert?: any;
  error?: string;
  payload?: any;
}

export const useChat = (room: string) => {
  const { data: session } = useSession();
  // Pusher fallback refs
  const pusherRef = useRef<any | null>(null);
  const pusherChannelRef = useRef<any | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const ws = useRef<WebSocket | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const retryCount = useRef(0);
  const retryTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingMessageRef = useRef<Message | null>(null);
  // Track the last room name so we only clear messages when the room truly
  // changes (not on transient reconnects).
  const prevRoomRef = useRef<string | null>(null);

  // Initialize Pusher fallback (receive-only). We keep this minimal: subscribe to a private room channel
  // and append incoming messages to the UI. Sending is unchanged and will continue to use the WS when available.
  const initPusherFallback = useCallback(() => {
    // Lazy-load Pusher to avoid bundling it unless fallback is used
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const Pusher = require('pusher-js');
    if (!process.env.NEXT_PUBLIC_PUSHER_KEY) {
      console.warn('NEXT_PUBLIC_PUSHER_KEY not configured; cannot start Pusher fallback');
      return;
    }

    if (pusherRef.current) return; // already initialized

    const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
    const opts: any = {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'mt1',
      authEndpoint: '/api/pusher/auth',
      auth: {
        headers: {
          Authorization: `Bearer ${session?.user?.token}`,
        },
      },
    };

    try {
      const pusher = new Pusher(key, opts);
      pusherRef.current = pusher;
      const channelName = `private-room-${room}`;
      const channel = pusher.subscribe(channelName);
      pusherChannelRef.current = channel;
      channel.bind('message', (data: any) => {
        try {
          // Basic validation
          if (!data || !data.id) return;
          setMessages((prev) => {
            if (prev.some((m) => m.id === data.id)) return prev;
            return [...prev, data];
          });
        } catch (err) {
          console.error('Error handling pusher message:', err);
        }
      });
      console.log('Pusher fallback initialized for room', room);
    } catch (err) {
      console.error('Failed to init pusher fallback', err);
    }
  }, [room, session?.user?.token]);

  const getWs = () => ws.current;

  const _sendMessage = useCallback((payload: any) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(payload));
    } else {
      // This is a common scenario during a connection loop.
      // It's better to log a warning than an error.
      console.warn("Cannot send message: WebSocket not open.");
    }
  }, []); // Empty dependency array makes this function stable.

  const sendPayload = useCallback(
    (payload: any) => {
      // wrapper that exposes raw payload sending to callers
      _sendMessage(payload);
      playSound("messageSent");
    },
    [_sendMessage]
  );

  const connect = useCallback(() => {
    const maxRetries = 3;
    let currentWs: WebSocket | null = null;
    let tokenRetryCount = 0;
    const doConnect = () => {
      if (retryCount.current >= maxRetries) {
        console.error("Max retry attempts reached");
        // Initialize Pusher fallback for read-only realtime when WS is unavailable
        try {
          initPusherFallback();
        } catch (err) {
          console.error('Failed to initialize Pusher fallback:', err);
        }
        return;
      }

      if (!session || !room) return;

      // Wait for the session token to be available. Sometimes the session
      // object is present but the custom signed token is not yet attached
      // (race during sign-in). Retry briefly instead of failing auth.
      if (!session.user?.token) {
        tokenRetryCount++;
        if (tokenRetryCount > 10) {
          console.error('No session token available after retries; aborting WS connect');
          return;
        }
        setTimeout(doConnect, 500);
        return;
      }

      // Only clear messages/typing when the logical room actually changed.
      // Avoid clearing on transient reconnects which causes UI flashing.
      if (prevRoomRef.current !== room) {
        setMessages([]); // Clear messages when room truly changes
        setTypingUsers([]); // Clear typing users when room changes
        prevRoomRef.current = room;
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
        // Normalize workerUrl: allow hostnames without protocol and default to https
        const normalized = /^https?:\/\//i.test(workerUrl) ? workerUrl : `https://${workerUrl}`;
        const url = new URL(normalized);
        const wsProtocol = url.protocol === "https:" ? "wss" : "ws";
        // Append token as query param as a fallback so the worker can pre-authenticate
        const tokenParam = session.user?.token ? `&token=${encodeURIComponent(session.user.token)}` : '';
        wsUrl = `${wsProtocol}://${url.host}/api/chat/socket?room=${room}${tokenParam}`;
      } catch (error) {
        console.error("Invalid worker URL:", workerUrl, error);
        return;
      }

      console.log(
        `Connecting to WebSocket: ${wsUrl}, Attempt: ${retryCount.current + 1}`
      );
      console.log("Worker URL:", workerUrl);

      // Close existing connection from this effect scope if it exists
      if (currentWs) {
        currentWs.onclose = null; // Prevent onclose from triggering a retry
        currentWs.close();
      }

      try {
        currentWs = new WebSocket(wsUrl);
        ws.current = currentWs;

        currentWs.onopen = () => {
          console.log("WebSocket connected successfully");
          retryCount.current = 0; // Reset retry count on successful connection

          if (session?.user && currentWs) {
            const authMessage = JSON.stringify({
              type: "auth",
              token: session.user.token, // Send the token for validation
              user: {
                id: session.user.id,
                name: session.user.name,
                image: session.user.image,
              },
            });
            currentWs.send(authMessage);
          }
        };

        currentWs.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            console.log("Received message:", message);

            // Handle incoming websocket events
            if (message.type === "typing") {
              if (message.isTyping) {
                setTypingUsers((prev) => [
                  ...new Set([...prev, message.fullName]),
                ]);
              } else {
                setTypingUsers((prev) =>
                  prev.filter((user) => user !== message.fullName)
                );
              }
            } else if (message.type === "message") {
              // Handle new messages (including own messages)
              if (message.sender) {
                const newMessage: Message = {
                  id: message._id || message.id, // Prioritize DB ID
                  userId: message.sender._id,
                  threadId: message.threadId || null, // Map threadId from incoming message
                  fullName: message.sender.fullName,
                  userImage: message.sender.image || undefined,
                  text: message.content || "", // Use content from the message
                  file: message.files || message.file, // support files[] or file
                  sender: message.sender, // Preserve the sender object
                  replyTo: message.replyTo
                    ? {
                        id: message.replyTo.id,
                        text:
                          message.replyTo.text || message.replyTo.content || "",
                        fullName:
                          message.replyTo.fullName ||
                          message.replyTo.sender?.fullName ||
                          (message.replyTo as any).userName ||
                          "Unknown",
                        file: message.replyTo.file,
                      }
                    : undefined,
                  createdAt: message.timestamp || new Date().toISOString(),
                };

                setMessages((prevMessages) => {
                  // Check if there's an optimistic message to replace
                  const optimisticIndex = prevMessages.findIndex((m) =>
                    m.id.startsWith('temp-') && // optimistic messages have temp IDs
                    (m.id === message.optimisticId ||
                      (m.userId === newMessage.userId &&
                        m.text === newMessage.text &&
                        m.threadId === (message.threadId || null)))
                  );

                  if (optimisticIndex !== -1) {
                    // Replace the optimistic message with the real one, preserving threadId and replyTo
                    const updatedMessages = [...prevMessages];
                    updatedMessages[optimisticIndex] = {
                      ...newMessage,
                      threadId: prevMessages[optimisticIndex].threadId || newMessage.threadId,
                      replyTo: prevMessages[optimisticIndex].replyTo || newMessage.replyTo,
                    };
                    return updatedMessages;
                  } else {
                    // Prevent adding a message that already exists
                    if (prevMessages.some((m) => m.id === newMessage.id)) {
                      return prevMessages;
                    }
                    return [...(prevMessages || []), newMessage];
                  }
                });

                // Remove the sender from typing users
                if (message.sender.fullName) {
                  setTypingUsers((prev) =>
                    prev.filter((user) => user !== message.sender.fullName)
                  );
                }
              } else {
                console.warn("Received incomplete message:", message);
              }
            } else if (message.type === "vitals_update") {
              toast.info("Vitals updated for a patient.");
            } else if (
              message.type === "alert_notification" &&
              message.alert
            ) {
              const alertMessage: Message = {
                id: message.alert._id || crypto.randomUUID(),
                type: "alert_notification",
                alert: message.alert,
                text: message.alert.message,
                userId: message.alert.createdBy._id, // Not strictly needed but good for consistency
                fullName: message.alert.createdBy.fullName,
                createdAt: message.alert.createdAt || new Date().toISOString(),
              };
              setMessages((prevMessages) => {
                // Prevent adding an alert that already exists
                if (prevMessages.some((m) => m.id === alertMessage.id)) {
                  return prevMessages;
                }
                return [...(prevMessages || []), alertMessage];
              });
            } else if (message.type === "messages") {
              const historicalMessages = (message.messages || [])
                .filter(Boolean)
                .map((msg: any) => {
                  // Keep the original message.type where possible so UI can render call/alert types
                  const base: any = {
                    id: msg._id || msg.id, // Prioritize DB ID
                    userId: msg.sender?._id || msg.userId,
                    fullName: msg.sender?.fullName || msg.fullName,
                    threadId: msg.threadId || null,
                    userImage: msg.sender?.image || undefined,
                    text: msg.content || msg.text || "",
                    file: msg.files || msg.file,
                    sender: msg.sender || undefined,
                    createdAt: msg.createdAt || msg.timestamp,
                    reactions: msg.reactions,
                    deleted: msg.deleted,
                    replyTo: msg.replyTo
                      ? {
                          id: msg.replyTo.id,
                          text: msg.replyTo.text || msg.replyTo.content || "",
                          fullName:
                            msg.replyTo.fullName || (msg.replyTo as any).userName || "Unknown",
                          file: msg.replyTo.file,
                        }
                      : undefined,
                    // preserve type and call metadata if present
                    type: msg.type || undefined,
                    callId: msg.callId || undefined,
                    callEnded: msg.callEnded || undefined,
                    duration: msg.duration || undefined,
                  };

                  if (msg.type === "alert_notification") {
                    return {
                      ...base,
                      type: "alert_notification",
                      alert: msg.alert,
                    };
                  }

                  return base;
                });

              // Merge optimistic local messages (temp-*) into the historical
              // snapshot so sending from a thread doesn't get lost if the
              // server returns a messages array that doesn't yet include the
              // newly-created thread reply (race in persistence).
              setMessages((prevMessages) => {
                try {
                  const optimistic = (prevMessages || []).filter((m) => typeof m.id === 'string' && m.id.startsWith('temp-'));

                  const merged = [...(historicalMessages || [])];

                  for (const opt of optimistic) {
                    // If the optimistic message has already been replaced by a persisted message, skip it
                    const exists = merged.some((m) => m.id === opt.id || (m.userId === opt.userId && m.text === opt.text && (m.threadId || null) === (opt.threadId || null)));
                    if (!exists) merged.push(opt);
                  }

                  return merged;
                } catch (e) {
                  console.error('Error merging optimistic messages into historical snapshot', e);
                  return historicalMessages || [];
                }
              });
            } else if (message.type === "reaction") {
              if (message.payload) {
                const { messageId, emoji, userId, fullName } = message.payload;
                setMessages((prevMessages) =>
                  prevMessages.map((msg) => {
                    if (msg.id === messageId) {
                      const reactions = msg.reactions || {};
                      const users = reactions[emoji] || [];
                      const userIndex = users.findIndex(
                        (u) => u.userId === userId
                      );

                      let newUsers;
                      if (userIndex > -1) {
                        // User has already reacted with this emoji, so remove it
                        newUsers = users.filter((u) => u.userId !== userId);
                      } else {
                        // User is adding a new reaction
                        newUsers = [...users, { userId, fullName }];
                      }

                      if (newUsers.length === 0) {
                        const { [emoji]: _, ...rest } = reactions;
                        return { ...msg, reactions: rest };
                      } else {
                        return {
                          ...msg,
                          reactions: {
                            ...reactions,
                            [emoji]: newUsers,
                          },
                        };
                      }
                    }
                    return msg;
                  })
                );
              } else if (message.type === "message_deleted") {
                const { messageId } = message.payload;
                setMessages((prevMessages) =>
                  prevMessages.map((msg) => {
                    if (msg.id === messageId) {
                      return {
                        ...msg,
                        text: "This message was deleted",
                        content: "This message was deleted",
                        file: undefined,
                        deleted: true,
                      };
                    }
                    return msg;
                  })
                );
              }
            } else if (message.type === "message_status_update") {
              const { messageId, status } = message.payload;
              setMessages((prevMessages) =>
                prevMessages.map((msg) =>
                  msg.id === messageId ? { ...msg, status } : msg
                )
              );
            } else if (message.type === "presence") {
              if (message.onlineUsers) {
                setOnlineUsers(message.onlineUsers);
              }
            } else if (message.type === "message_updated") {
              const updatedMessage = message.payload;
              setMessages((prevMessages) =>
                prevMessages.map((msg) =>
                  msg.id === updatedMessage.id
                    ? { ...msg, ...updatedMessage }
                    : msg
                )
              );
            } else if (message.type === "presence") {
              setOnlineUsers(message.onlineUsers);
            } else if (message.type === "call_invitation") {
              const { callId, callerName } = message;

              const callMessage: Message = { // Ensure this is of type Message
                id: callId, // Use callId as the unique message ID
                type: 'call_invitation',
                text: `${callerName} started a call.`,
                userId: message.sender?._id || 'system',
                fullName: callerName,
                createdAt: new Date().toISOString(),
                callId: callId, // Add callId directly
              } as any; // Cast as any to add callId if not in Message type

              setMessages((prev) => {
                // Avoid duplicates
                if (prev.some((m) => m.id === callMessage.id)) return prev;
                playSound("callRinging");
                return [...prev, callMessage];
              });
            } else if (message.type === 'call_join') {
              // Real-time notice that someone joined the call
              try {
                const callJoinMsg: Message = {
                  id: message.id || `${message.callId}-join-${message.callerName || message.sender?.fullName || 'unknown'}-${Date.now()}`,
                  type: 'call_join',
                  text: message.text || `${message.callerName || message.sender?.fullName || 'Someone'} joined the call.`,
                  userId: message.sender?._id || 'system',
                  fullName: message.callerName || message.sender?.fullName || 'Someone',
                  createdAt: message.timestamp || new Date().toISOString(),
                  callId: message.callId,
                } as any;

                setMessages((prev) => {
                  if (prev.some((m) => m.id === callJoinMsg.id)) return prev;
                  return [...(prev || []), callJoinMsg];
                });
              } catch (err) {
                console.error('Error handling call_join message:', err);
              }
            } else if (message.error) {
              console.error("WebSocket error:", message.error);
            }
          } catch (error) {
            console.error("Error processing WebSocket message:", error);
          }
        };

        currentWs.onerror = (event) => {
          // Generic error events don't have much info, so we'll log the close event for details.
          console.error(
            "WebSocket error event. See close event for details.",
            event
          );
        };

        currentWs.onclose = (event) => {
          console.log(
            `WebSocket disconnected: code=${event.code}, reason='${event.reason}', wasClean=${event.wasClean}`
          );

          // Don't retry on normal closure or if the component has unmounted.
          if (event.code === 1000 || ws.current !== currentWs) {
            return;
          }

          if (retryCount.current < maxRetries) {
            retryCount.current++;
            const delay = Math.min(
              1000 * Math.pow(2, retryCount.current),
              10000
            );
            console.log(
              `Connection failed. Retrying in ${delay}ms (attempt ${retryCount.current}/${maxRetries})...`
            );

            if (retryTimeout.current) {
              clearTimeout(retryTimeout.current);
            }

            retryTimeout.current = setTimeout(doConnect, delay);
          } else {
            console.error("Max retry attempts reached. Giving up.");
          }
        };
      } catch (error) {
        console.error("Error creating WebSocket:", error);
        retryCount.current++;

        if (retryTimeout.current) {
          clearTimeout(retryTimeout.current);
        }

        retryTimeout.current = setTimeout(
          doConnect,
          Math.min(1000 * Math.pow(2, retryCount.current), 10000)
        );
      }
    };

    doConnect();

    return () => {
      if (retryTimeout.current) {
        clearTimeout(retryTimeout.current);
      }
      if (currentWs) {
        currentWs.onclose = null; // Prevent onclose from triggering a retry on unmount
        currentWs.close();
        if (ws.current === currentWs) {
          ws.current = null;
        }
      }
    };
  }, [session, room, setMessages, playSound]);

  useEffect(() => {
    connect();
  }, [connect]);

  // Cleanup Pusher fallback on unmount or room change
  useEffect(() => {
    return () => {
      try {
        if (pusherChannelRef.current) {
          // unbind all events
          if (typeof pusherChannelRef.current.unbind_all === 'function') {
            pusherChannelRef.current.unbind_all();
          }
        }
        if (pusherRef.current) {
          try {
            pusherRef.current.disconnect();
          } catch (e) {
            console.warn('Error disconnecting pusher fallback', e);
          }
          pusherRef.current = null;
          pusherChannelRef.current = null;
        }
      } catch (err) {
        console.error('Error during pusher cleanup', err);
      }
    };
  }, [room]);

  const sendCombinedMessage = useCallback(
    async (
      text: string,
      uploadedFiles?: UploadResponse[],
      isVoiceMessage: boolean = false,
      replyTo?: Message, // Kept for text replies
      optimisticId?: string, // New param for optimistic replacement
      threadId?: string // Ensure threadId is accepted here
    ) => {
      if (!session?.user) {
        console.error("Cannot send message: user not authenticated");
        return;
      }

      // --- Optimistic Update for text messages ---
      // if (!optimisticId && !isVoiceMessage && (text || (uploadedFiles && uploadedFiles.length > 0))) {
      //   const tempId = `temp-text-${crypto.randomUUID()}`;
      //   const optimisticMessage: Message = {
      //       id: tempId,
      //       text: text,
      //       userId: (session.user as any)._id,
      //       fullName: session.user.name || "You",
      //       userImage: session.user.image,
      //       threadId: threadId,
      //       file: uploadedFiles,
      //       replyTo: replyTo as any,
      //       status: "sent",
      //       createdAt: new Date().toISOString(),
      //   };
      //   pendingMessageRef.current = { ...optimisticMessage, id: tempId }; // Use the tempId
      //   setMessages((prev) => [...prev, optimisticMessage]);
      //   optimisticId = tempId; // Use this ID for replacement
      // }
      // ------------------------------------------

      const filesWithThumbnails = uploadedFiles
        ? await Promise.all(
            uploadedFiles.map(async (file) => {
              if (file.type === "application/pdf") {
                try {
                  const res = await fetch(
                    `/api/pdf/thumbnail?url=${encodeURIComponent(file.url)}`
                  );
                  if (res.ok) {
                    const data: { thumbnailUrl: string } = await res.json();
                    return { ...file, thumbnailUrl: data.thumbnailUrl };
                  }
                } catch (error) {
                  console.error("Failed to fetch PDF thumbnail:", error);
                }
              }
              return file;
            })
          )
        : undefined;

      const payload = {
        type: "message",
        content: text || "", // may be empty if just files
        optimisticId: optimisticId, // Send the temp ID to the backend
        threadId: threadId, // Assign threadId to the payload
        files: filesWithThumbnails?.length ? filesWithThumbnails : undefined,
        replyTo: replyTo
          ? {
              id: replyTo.id,
              text: replyTo.text || "",
              fullName:
                replyTo.sender?.fullName || replyTo.fullName || "Unknown",
              file: replyTo.file,
              userId: replyTo.userId,
            }
          : undefined,
        room,
        timestamp: new Date().toISOString(),
      };

      _sendMessage(payload);
    },
    [session, room, _sendMessage, setMessages]
  );

  // Deprecated: use sendCombinedMessage instead
  const sendMessage = useCallback(
    (message: string) => sendCombinedMessage(message, []),
    [sendCombinedMessage],
  );
  const sendFile = useCallback(
    (file: File, fileInfo: UploadResponse) =>
      sendCombinedMessage(`File: ${fileInfo.name}`, [fileInfo], false),
    [sendCombinedMessage]
  );

  const sendTyping = (isTyping: boolean) => {
    if (
      ws.current &&
      ws.current.readyState === WebSocket.OPEN &&
      session?.user?.fullName
    ) {
      const payload = {
        type: "typing",
        isTyping,
        fullName: session.user.fullName,
        room,
      };
      ws.current.send(JSON.stringify(payload));
    }
  };

  const startCall = () => {
    if (
      ws.current &&
      ws.current.readyState === WebSocket.OPEN &&
      session?.user
    ) {
      const payload = {
        type: "call-start",
        room,
      };
      ws.current.send(JSON.stringify(payload));
    }
  };

  const sendReadReceipt = useCallback(
    (messageId: string) => {
      _sendMessage({
        type: "message_status_update",
        payload: {
          messageId,
          status: "read",
          room,
        },
      });
    },
    [room, _sendMessage]
  );

  const sendCallInvitation = useCallback(
    (roomId: string, callId: string) => {
      const payload = {
        type: "call_invitation",
        room: roomId,
        callId,
        callerName: session?.user?.fullName || "Someone",
        timestamp: new Date().toISOString(),
      };

      // Try sending over WebSocket (so realtime clients see it immediately).
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        try {
          ws.current.send(JSON.stringify(payload));
        } catch (err) {
          console.warn('sendCallInvitation: failed to send over WS', err);
        }
      }

      // Always POST to the worker as a reliable persistence path. We do this
      // even when WS send was attempted because the WS may be connected but
      // not yet authenticated on the DO side (race), which would cause the
      // DO to ignore or error on the WS message. The worker dedupes by id so
      // duplicate deliveries are harmless.
      const workerUrl = process.env.NODE_ENV === "development"
        ? "http://127.0.0.1:8787"
        : process.env.NEXT_PUBLIC_CLOUDFLARE_WORKER_URL;

      if (!workerUrl) {
        console.error('Worker URL not configured; cannot persist call_invitation');
        return;
      }

      const endpoint = `${workerUrl.replace(/\/$/, '')}/api/call-invitation?room=${encodeURIComponent(roomId)}`;
      fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
        .then(res => {
          if (!res.ok) {
            console.warn('sendCallInvitation: non-OK response from', endpoint, res.status);
          }
        })
        .catch(err => console.error('sendCallInvitation: failed POST to', endpoint, err));
    },
    [session?.user?.fullName]
  );

  const sendCallEnd = useCallback(
    async (callId: string, duration: string, targetRoom?: string) => {
      // Always send call_end via HTTP to the worker so the Durable Object can
      // persist the updated call state (callEnded/duration). The previous
      // code attempted to use WebSocket when in the same room, but the worker
      // only persisted call_end when received via HTTP/POST.
      const messageRoom = targetRoom || room;
      const workerUrl = process.env.NODE_ENV === "development"
        ? "http://127.0.0.1:8787"
        : process.env.NEXT_PUBLIC_CLOUDFLARE_WORKER_URL;

      if (!workerUrl) {
        console.error("Worker URL is not configured; cannot persist call_end");
        return;
      }

      const payload = { type: "call_end", callId, duration };

      // Try explicit REST endpoint first, then fallback to generic POST handler.
      const endpoints = [
        `${workerUrl.replace(/\/$/, '')}/api/call-end?room=${encodeURIComponent(messageRoom)}`,
        `${workerUrl}?room=${encodeURIComponent(messageRoom)}`,
      ];

      let succeeded = false;
      for (const endpoint of endpoints) {
        try {
          const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
          if (res.ok) {
            succeeded = true;
            break;
          } else {
            console.warn(`sendCallEnd: non-OK response from ${endpoint}:`, res.status, await res.text().catch(() => '<no-body>'));
          }
        } catch (error) {
          console.error(`sendCallEnd: failed POST to ${endpoint}:`, error);
        }
      }

      if (!succeeded) {
        console.error('sendCallEnd: all attempts to notify worker failed for callId', callId);
      }
    },
    [room]
  );

  // Notify the room that a user has joined a call and persist that join as a message
  const sendCallJoin = useCallback(
    (roomId: string, callId: string, callerName?: string) => {
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        const payload = {
          type: 'call_join',
          room: roomId,
          callId,
          callerName: callerName || session?.user?.fullName || session?.user?.name || 'Someone',
          timestamp: new Date().toISOString(),
        };
        ws.current.send(JSON.stringify(payload));
      } else {
        // As a fallback, attempt to POST to the worker so that the join is persisted
        const workerUrl = process.env.NODE_ENV === "development"
          ? "http://127.0.0.1:8787"
          : process.env.NEXT_PUBLIC_CLOUDFLARE_WORKER_URL;
        if (!workerUrl) return;
        fetch(`${workerUrl}?room=${encodeURIComponent(roomId)}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'call_join',
            callId,
            callerName: callerName || session?.user?.fullName || session?.user?.name || 'Someone',
            timestamp: new Date().toISOString(),
          }),
        }).catch((err) => console.error('Failed to POST call_join fallback', err));
      }
    },
    [session?.user?.fullName, session?.user?.name]
  );

  const uploadFile = useCallback(
    (
      file: File,
      onProgress: (percentage: number) => void,
      optimisticId?: string) => {
      return new Promise<UploadResponse>((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable) {
            const percentage = Math.round((event.loaded * 100) / event.total);
            onProgress(percentage);
          }
        });

        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText) as UploadResponse;
              // The upload is complete; resolve the promise with the file details.
              // The component will handle sending the message.
              resolve(response);
            } catch (error) {
              reject(new Error("Failed to parse upload response"));
            }
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        });

        xhr.addEventListener("error", () => {
          reject(new Error("File upload failed"));
        });

        const formData = new FormData();
        formData.append("file", file);

        const endpoint =
          file.type === "application/pdf" ? "/api/upload-pdf" : "/api/upload";
        xhr.open("POST", endpoint, true);
        xhr.send(formData);
      });
    },
    [sendCombinedMessage]
  );

  const deleteMessage = useCallback(
    (messageId: string) => {
      _sendMessage({
        type: "delete_message",
        payload: {
          messageId,
          room,
        },
      });
      toast.success("Message deleted.");
    },
    [room, _sendMessage]
  );

  const startThread = useCallback((message: Message) => {
    // This is a placeholder for your thread logic.
    // You would typically open a new view or sidebar here.
    console.log("Starting thread for message:", message.id);
    // For now, let's just log it.
    // You can later implement a separate state for the active thread,
    // fetch its messages, and display them in a new component.
    toast.info(`Replying in thread to ${message.fullName}`);
  }, []);

  const getCallById = useCallback(async (callId: string) => {
    try {
      const call = await fetchApi(`/api/calls/${callId}`);
      return call;
    } catch (error) {
      console.error("Failed to fetch call details:", error);
      toast.error("Failed to fetch call details.");
      return null;
    }
  }, []);

  return {
    messages,
    isMuted,
    isVideoOff,
    setMessages, // Make sure to return setMessages
    typingUsers,
    onlineUsers,
    sendCombinedMessage, // ✅ new function
    sendPayload,
    sendTyping,
    setIsMuted,
    setIsVideoOff,
    uploadFile,
    startCall,
    sendReadReceipt,
    deleteMessage,
    getWs,
    sendCallInvitation,
    sendCallEnd,
    sendCallJoin,
    getCallById,
  };

};
