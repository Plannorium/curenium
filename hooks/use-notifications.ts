import { useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { Notification } from '@/app/(dashboard)/components/NotificationItem';
import Pusher from 'pusher-js';
import { toast } from 'sonner';

let retryCount = 0;
const maxRetries = 5;

export const useNotifications = () => {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [pusherInstance, setPusherInstance] = useState<Pusher | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const handleNewNotification = useCallback((data: any) => {
    // Ensure data is a valid object before processing
    if (!data || typeof data !== 'object') {
      console.error('Received invalid notification data:', data);
      return;
    }

    // Transform alert/notification data to Notification format
    const newNotification: Notification = {
      id: data._id, // Always use _id from the server
      title: data.title || (data.level ? `${data.level.toUpperCase()} Alert` : 'Notification'),
      message: data.message || data.text || '',
      read: data.read || false,
      createdAt: data.createdAt || new Date().toISOString(),
      type: data.type || 'system_alert',
      sender: data.createdBy && typeof data.createdBy === 'object' ? {
        _id: data.createdBy._id,
        fullName: data.createdBy.fullName,
        image: data.createdBy.image,
      } : data.sender, // Fallback to sender if createdBy is not present or not an object
    };

    // Do not add notifications without an ID.
    if (!newNotification.id) {
      console.error('Received notification without an ID:', data);
      return;
    }

    setNotifications((prev) => {
      // Do not add duplicate notifications
      if (prev.some((n) => n.id === newNotification.id)) {
        return prev;
      }
      return [newNotification, ...prev];
    });

    // Special handling for call invitations
    if (newNotification.type === 'call_invitation') {
      toast.info(`Incoming call from ${newNotification.sender?.fullName || 'Someone'}`, {
        description: 'Tap to join the call',
        action: {
          label: 'Join',
          onClick: () => {
            window.location.href = `/dashboard/chat?room=${data.room || 'general'}`;
          },
        },
        duration: 30000, // 30 seconds
      });
    }
    // Optional: play a sound
  }, [setNotifications]);

  useEffect(() => {
    if (!session?.user?.id || !session?.user?.token) return;

    // Load initial notifications from DB
    const loadInitialNotifications = async () => {
      try {
        const response = await fetch('/api/notifications');
        if (response.ok) {
          const dbNotifications: any[] = await response.json();
          const transformed = dbNotifications.map((n: any) => ({
            id: n._id, // Use _id directly
            title: n.title,
            message: n.message,
            read: n.read,
            createdAt: n.createdAt,
            type: n.type,
            sender: n.createdBy ? { // Prefer createdBy
              _id: n.createdBy._id,
              fullName: n.createdBy.fullName,
              image: n.createdBy.image,
            } : n.sender, // Fallback to sender
          }));
          setNotifications(transformed);
        }
      } catch (error) {
        console.error('Failed to load initial notifications:', error);
      }
    };

    loadInitialNotifications();

    let ws: WebSocket | null = null;
    let localRetryCount = 0;

    const connectWebSocket = () => {
      if (localRetryCount >= maxRetries) {
        console.error("Max retry attempts for notification socket reached");
        return;
      }

      const workerUrl =
        process.env.NODE_ENV === "development"
          ? "http://127.0.0.1:8787"
          : process.env.NEXT_PUBLIC_CLOUDFLARE_WORKER_URL || '';

      if (!workerUrl) {
        console.error("Worker URL is not configured for notifications.");
        return;
      }

      let wsUrl;
      try {
        // Normalize workerUrl: allow hostnames without protocol and default to https
        const normalized = /^https?:\/\//i.test(workerUrl) ? workerUrl : `https://${workerUrl}`;
        const url = new URL(normalized);
        const wsProtocol = url.protocol === "https:" ? "wss" : "ws";
        const tokenParam = session.user?.token ? `&token=${encodeURIComponent(session.user.token)}` : '';
        wsUrl = `${wsProtocol}://${url.host}/api/notifications/socket?user=${session.user.id}${tokenParam}`;
      } catch (error) {
        console.error("Invalid worker URL:", workerUrl, error);
        return;
      }

      // Quick HTTP probe to surface connectivity issues (will return 400 on non-upgrade)
      try {
        // Non-blocking HTTP probe so we don't make the connect function async.
        fetch(wsUrl.replace(/^wss?:/, 'https:'), { method: 'GET' })
          .then((probeRes) => console.log(`Worker probe status: ${probeRes.status} ${probeRes.statusText}`))
          .catch((probeError) => console.warn('Worker HTTP probe failed:', probeError));
      } catch (probeError) {
        // Defensive - fetch shouldn't throw synchronously, but log if it does.
        console.warn('Worker HTTP probe threw sync error:', probeError);
      }

      try {
        ws = new WebSocket(wsUrl);
      } catch (err) {
        console.error('Failed to create Notification WebSocket:', err);
        return;
      }
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("Notification WebSocket connected successfully", { userId: session.user.id });
        localRetryCount = 0;
        setIsConnected(true);
        // Authenticate the connection
        try {
          ws?.send(JSON.stringify({ type: "auth", token: session.user.token }));
        } catch (sendErr) {
          console.error('Failed to send auth message on open:', sendErr);
        }
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'new_notification') {
            handleNewNotification(data.payload);
          }
          if (data.type === 'initial_notifications') {
            setNotifications(data.payload);
          }
        } catch (error) {
          console.error("Error parsing notification message:", error);
        }
      };

      ws.onclose = (event) => {
        console.log("Notification WebSocket closed", {
          code: event.code,
          reason: event.reason,
          wasClean: event.wasClean,
        });
        setIsConnected(false);
        // Reconnect logic
        if (event.code !== 1000) { // 1000 is normal closure
          localRetryCount++;
          const delay = 1000 * Math.pow(2, localRetryCount);
          console.log(`Attempting to reconnect in ${delay}ms...`);
          setTimeout(connectWebSocket, delay);
        }
      };

      ws.onerror = (error) => {
        // The browser provides limited info on error events; log the whole event for inspection.
        console.error("Notification WebSocket error event:", error);
        setIsConnected(false);
      };
    };

    connectWebSocket();

    return () => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close(1000, 'Component unmounting');
      }
    };
  }, [session, handleNewNotification]);

  // Pusher fallback
  useEffect(() => {
    if (!session?.user?.id) return;

    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: 'us2',
      authEndpoint: '/api/pusher/auth',
      auth: {
        headers: {
          Authorization: `Bearer ${session.user.token}`,
        },
      },
    });

    const channel = pusher.subscribe(`private-user-${session.user.id}`);
    channel.bind('new-notification', (data) => {
      handleNewNotification(data);
    });

    setPusherInstance(pusher);

    return () => {
      pusher.disconnect();
    };
  }, [session, handleNewNotification]);

  const markAsRead = async (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
    // Persist to DB
    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId, read: true }),
      });
      if (!response.ok) {
        throw new Error('Failed to mark notification as read on the server');
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      // Optionally revert the state change
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: false } : n))
      );
    }
  };

  const markAllAsRead = async () => {
    const originalNotifications = notifications;
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    // Update DB
    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAll: true }),
      });
      if (!response.ok) {
        throw new Error('Failed to mark all notifications as read on the server');
      }
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      setNotifications(originalNotifications);
    }
  };

  return { notifications, isConnected, markAsRead, markAllAsRead };
};