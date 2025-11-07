import { toast } from "sonner";
import { useEffect, useState, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { playSound } from '@/lib/sound/soundGenerator';

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
  type?: 'message' | 'alert_notification';
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
  status?: 'sent' | 'delivered' | 'read';
}

// Allow messages to carry a single file or multiple files
export type MessageFile = UploadResponse | UploadResponse[] | undefined;

interface WebSocketMessage {
  type: 'typing' | 'message' | 'messages' | 'presence' | 'auth' | 'reaction' | 'alert_notification' | 'message_status_update';
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

export const uploadFile = (
  file: File,
  onProgress: (percentage: number) => void
): Promise<UploadResponse> => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) {
        const percentage = Math.round((event.loaded * 100) / event.total);
        onProgress(percentage);
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          resolve(response);
        } catch (error) {
          reject(new Error('Failed to parse upload response'));
        }
      } else {
        reject(new Error(`File upload failed with status: ${xhr.status}`));
      }
    });

    xhr.addEventListener('error', () => {
      reject(new Error('File upload failed'));
    });

    const formData = new FormData();
    formData.append('file', file);

    const endpoint = file.type === 'application/pdf' ? '/api/upload-pdf' : '/api/upload';
    xhr.open('POST', endpoint, true);
    xhr.send(formData);
  });
};

export const useChat = (room: string) => {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const ws = useRef<WebSocket | null>(null);
  const retryCount = useRef(0);
  const retryTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingMessageRef = useRef<Message | null>(null);

  const _sendMessage = useCallback((payload: any) => {
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
      console.error('Cannot send message: WebSocket not connected.');
      return;
    }
    try {
      ws.current.send(JSON.stringify(payload));
      console.log("Sent message:", payload);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }, []);

  const sendPayload = useCallback((payload: any) => {
    // wrapper that exposes raw payload sending to callers
    _sendMessage(payload);
    playSound('messageSent');
  }, [_sendMessage]);

  useEffect(() => {


    const maxRetries = 3;
    let currentWs: WebSocket | null = null;

    const connect = () => {
      if (retryCount.current >= maxRetries) {
        console.error('Max retry attempts reached');
        return;
      }

      if (!session || !room) return;

      setMessages([]); // Clear messages when room changes
      setTypingUsers([]); // Clear typing users when room changes
      
      const workerUrl = process.env.NODE_ENV === 'development'
        ? 'http://127.0.0.1:8787'
        : process.env.NEXT_PUBLIC_CLOUDFLARE_WORKER_URL;

      if (!workerUrl) {
        console.error('Worker URL is not configured.');
        return;
      }

      let wsUrl;
      try {
        const url = new URL(workerUrl);
        const wsProtocol = url.protocol === 'https:' ? 'wss' : 'ws';
        wsUrl = `${wsProtocol}://${url.host}/api/chat/socket?room=${room}`;
      } catch (error) {
        console.error('Invalid worker URL:', workerUrl, error);
        return;
      }
      
      console.log(`Connecting to WebSocket: ${wsUrl}, Attempt: ${retryCount.current + 1}`);
      console.log('Worker URL:', workerUrl);
      
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
              type: 'auth',
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

            if (
              pendingMessageRef.current &&
              message.type === "message" &&
              message.sender?._id === (session?.user as any)?._id && // Compare IDs
              !message.threadId && // Ensure it's not a thread message from another user
              pendingMessageRef.current.text === message.content // Match content
            ) {
              const pendingMessage = pendingMessageRef.current;
              setMessages((prevMessages) =>
                prevMessages.map((m) =>
                  m.id === pendingMessage.id
                    ? { ...m, id: message.id, createdAt: message.createdAt }
                    : m
                )
              );
              pendingMessageRef.current = null; // Clear after handling
              return; // Stop further processing for this message
            }

            if (message.type === 'typing') {
              if (message.isTyping) {
                setTypingUsers(prev => [...new Set([...prev, message.fullName])]);
              } else {
                setTypingUsers(prev => prev.filter(user => user !== message.fullName));
              }
            } else if (message.type === 'message') {
              // Ensure message has required fields before adding
              if (message.sender) {
                const newMessage: Message = {
                  id: message.id || crypto.randomUUID(),
                  userId: message.sender._id,
                  threadId: message.threadId || null, // Map threadId from incoming message
                  fullName: message.sender.fullName,
                  userImage: message.sender.image || undefined,
                  text: message.content || '', // Use content from the message
                  file: message.files || message.file, // support files[] or file
                  sender: message.sender, // Preserve the sender object
                  replyTo: message.replyTo
                    ? {
                        id: message.replyTo.id,
                        text: message.replyTo.text || message.replyTo.content || '',
                        fullName: message.replyTo.fullName || message.replyTo.sender?.fullName || (message.replyTo as any).userName || 'Unknown',
                        file: message.replyTo.file,
                      }
                    : undefined,
                  createdAt: message.timestamp || new Date().toISOString(),
                };
                console.log('Adding new message:', newMessage);
                console.log('Message files:', message.files);
                console.log('Message file:', message.file);
                setMessages(prevMessages => {
                  if (prevMessages.some(m => m.id === message.id)) {
                    console.log('Message already exists, skipping');
                    return prevMessages;
                  }
                  playSound('notification');
                  return [...(prevMessages || []), newMessage];
                });
                
                // Remove the sender from typing users
                if (message.sender.fullName) {
                  setTypingUsers(prev => prev.filter(user => user !== message.sender.fullName));
                }
              } else if (message.type === 'alert_notification' && message.alert) {
                const alertMessage: Message = {
                  id: message.alert._id || crypto.randomUUID(),
                  type: 'alert_notification',
                  alert: message.alert,
                  text: message.alert.message,
                  userId: message.alert.createdBy._id, // Not strictly needed but good for consistency
                  fullName: message.alert.createdBy.fullName,
                };
                setMessages(prev => [...(prev || []), alertMessage]);
              } else {
                console.warn('Received incomplete message:', message);
              }
            } else if (message.type === 'messages') {
              const historicalMessages = (message.messages || [])
                .filter(Boolean)
                .map((msg: any) => ({
                  id: msg.id || crypto.randomUUID(),
                  userId: msg.sender?._id,
                  fullName: msg.sender?.fullName,
                  threadId: msg.threadId || null, // Map threadId from historical messages
                  userImage: msg.sender?.image,
                  text: msg.content || '',
                  file: msg.files || msg.file,
                  sender: msg.sender, // Preserve the sender object
                  createdAt: msg.createdAt || msg.timestamp,
                  reactions: msg.reactions,
                  replyTo: msg.replyTo ? {
                    id: msg.replyTo.id,
                    text: msg.replyTo.text || msg.replyTo.content || '',
                    fullName: msg.replyTo.fullName || (msg.replyTo as any).userName || 'Unknown',
                    file: msg.replyTo.file,
                  } : undefined,
                }));
              setMessages(historicalMessages);
            } else if (message.type === 'reaction') {
              if (message.payload) {
                const { messageId, emoji, userId, fullName } = message.payload;
                setMessages(prevMessages =>
                  prevMessages.map(msg => {
                    if (msg.id === messageId) {
                      const reactions = msg.reactions || {};
                      const users = reactions[emoji] || [];
                      const userIndex = users.findIndex(u => u.userId === userId);
              
                      let newUsers;
                      if (userIndex > -1) {
                        // User has already reacted with this emoji, so remove it
                        newUsers = users.filter(u => u.userId !== userId);
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
              }
              } else if (message.type === 'message_status_update') {
              const { messageId, status } = message.payload;
              setMessages(prevMessages =>
                prevMessages.map(msg =>
                  msg.id === messageId ? { ...msg, status } : msg
                )
              );
            } else if (message.type === 'presence') {
              if (message.onlineUsers) {
                setOnlineUsers(message.onlineUsers);
              }
            } else if (message.error) {
              console.error('WebSocket error:', message.error);
            }
          } catch (error) {
            console.error('Error processing WebSocket message:', error);
          }
        };

        currentWs.onerror = (event) => {
          // Generic error events don't have much info, so we'll log the close event for details.
          console.error("WebSocket error event. See close event for details.", event);
        };

        currentWs.onclose = (event) => {
          console.log(`WebSocket disconnected: code=${event.code}, reason='${event.reason}', wasClean=${event.wasClean}`);
          
          // Don't retry on normal closure or if the component has unmounted.
          if (event.code === 1000 || ws.current !== currentWs) {
            return;
          }

          if (retryCount.current < maxRetries) {
            retryCount.current++;
            const delay = Math.min(1000 * Math.pow(2, retryCount.current), 10000);
            console.log(`Connection failed. Retrying in ${delay}ms (attempt ${retryCount.current}/${maxRetries})...`);
            
            if (retryTimeout.current) {
              clearTimeout(retryTimeout.current);
            }
            
            retryTimeout.current = setTimeout(connect, delay);
          } else {
            console.error("Max retry attempts reached. Giving up.");
          }
        };

      } catch (error) {
        console.error('Error creating WebSocket:', error);
        retryCount.current++;
        
        if (retryTimeout.current) {
          clearTimeout(retryTimeout.current);
        }
        
        retryTimeout.current = setTimeout(() => {
          connect();
        }, Math.min(1000 * Math.pow(2, retryCount.current), 10000));
      }
    };

    connect();

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
    };``
  }, [session, room, _sendMessage]);

  const sendCombinedMessage = useCallback(
    async (
      text: string,
      uploadedFiles?: UploadResponse[],
      replyTo?: Message,
      threadId?: string // Ensure threadId is accepted here
    ) => {
      if (!session?.user) {
        console.error("Cannot send message: user not authenticated");
        return;
      }

      // --- Optimistic Update ---
      if (threadId) {
        const optimisticMessage: Message = {
          id: `temp-${crypto.randomUUID()}`,
          text: text,
          userId: (session.user as any)._id, // Correctly use _id
          fullName: session.user.name || "You",
          userImage: session.user.image,
          threadId: threadId,
          file: uploadedFiles,
          replyTo: replyTo,
          status: "sent",
          createdAt: new Date().toISOString(),
        };
        pendingMessageRef.current = optimisticMessage;
        setMessages((prev) => [...prev, optimisticMessage]);
      }
      // -------------------------

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
  const sendMessage = useCallback((message: string) => sendCombinedMessage(message, []), [sendCombinedMessage]);
  const sendFile = useCallback((file: File, fileInfo: UploadResponse) => sendCombinedMessage(`File: ${fileInfo.name}`, [fileInfo]), [sendCombinedMessage]);

  const sendTyping = (isTyping: boolean) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN && session?.user?.fullName) {
      const payload = {
        type: 'typing',
        isTyping,
        fullName: session.user.fullName,
        room,
      };
      ws.current.send(JSON.stringify(payload));
    }
  };

  const startCall = () => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN && session?.user) {
      const payload = {
        type: 'call-start',
        room,
      };
      ws.current.send(JSON.stringify(payload));
    }
  };

  const sendReadReceipt = useCallback((messageId: string) => {
    _sendMessage({
      type: 'message_status_update',
      payload: {
        messageId,
        status: 'read',
        room,
      }
    });
  }, [room, _sendMessage]);

  const deleteMessage = useCallback(async (messageId: string) => {
    try {
      const res = await fetch('/api/chat/messages', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messageId }),
      });

      if (res.ok) {
        // Optimistically update the message to show it's deleted.
        setMessages(prevMessages => prevMessages.map(m => {
          if (m.id === messageId) {
            return {
              ...m,
              text: 'This message has been deleted.',
              file: undefined,
              deleted: {
                by: 'user', // This will be updated by the websocket event later for admin deletions
                at: new Date().toISOString()
              }
            };
          }
          return m;
        }));
      } else {
        const errorData: any = await res.json();
        console.error('Failed to delete message:', errorData.error);
        toast.error('Failed to delete message');
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error('An error occurred while deleting the message');
    }
  }, []);

  const startThread = useCallback((message: Message) => {
    // This is a placeholder for your thread logic.
    // You would typically open a new view or sidebar here.
    console.log('Starting thread for message:', message.id);
    // For now, let's just log it.
    // You can later implement a separate state for the active thread,
    // fetch its messages, and display them in a new component.
    toast.info(`Replying in thread to ${message.fullName}`);
  }, []);



  return {
    messages,
    typingUsers,
    onlineUsers,
    sendCombinedMessage, // ✅ new function
    sendPayload,
    sendTyping,
    uploadFile,
    startCall,
    sendReadReceipt,
    deleteMessage,
  };
};