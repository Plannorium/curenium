"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

interface Alert {
  _id: string;
  level: 'critical' | 'urgent' | 'info';
  message: string;
  createdAt: string;
  createdBy: {
    _id: string;
    fullName: string;
    image: string;
  };
  patientId?: string;
}

interface WebSocketMessage {
  type: 'new_notification';
  payload: any;
}

export const useAlerts = () => {
  const { data: session } = useSession();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const ws = useRef<WebSocket | null>(null);

  const connect = useCallback(() => {
    if (!session?.user?.id) return;

    const workerUrl = process.env.NODE_ENV === 'development'
      ? 'http://127.0.0.1:8787'
      : process.env.NEXT_PUBLIC_CLOUDFLARE_WORKER_URL;

    if (!workerUrl) {
      console.error('Worker URL is not configured.');
      return;
    }

    const url = new URL(workerUrl);
    const wsProtocol = url.protocol === 'https:' ? 'wss' : 'ws';
    const wsUrl = `${wsProtocol}://${url.host}/api/notifications/socket?user=${session.user.id}`;

    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      console.log('WebSocket connected for alerts');
    };

    ws.current.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        if (message.type === 'new_notification' && message.payload) {
          if (message.payload.type === 'share.request') {
            toast.info(message.payload.title, {
              description: message.payload.message,
              action: {
                label: "View Patient",
                onClick: () => {
                  window.location.href = `/dashboard/ehr/patients/${message.payload.relatedId}`;
                },
              },
            });
          } else {
            setAlerts((prevAlerts) => [message.payload, ...prevAlerts]);
          }
        }
      } catch (e) {
        console.error("Failed to parse WebSocket message:", e);
      }
    };

    ws.current.onclose = () => {
      console.log('WebSocket disconnected for alerts');
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket error for alerts:', error);
    };

    return () => {
      ws.current?.close();
    };
  }, [session]);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const response = await fetch('/api/alerts');
        if (response.ok) {
          const data = await response.json() as Alert[];
          setAlerts(data);
        } else {
          console.error('Failed to fetch initial alerts');
        }
      } catch (error) {
        console.error('Error fetching initial alerts:', error);
      }
    };

    fetchAlerts();
    const disconnect = connect();

    return () => {
      if (disconnect) {
        disconnect();
      }
    };
  }, [connect]);

  return { alerts, setAlerts };
};