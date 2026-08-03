import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

export interface EmergencyAlert {
  id: string;
  alertType: 'panic' | 'fire' | 'medical' | 'security';
  message: string;
  location?: string;
  triggeredBy: string;
  tenantName: string;
  broadcastTo: string;
  createdAt: string;
}

interface AlertContextValue {
  activeAlerts: EmergencyAlert[];
  dismissAlert: (id: string) => void;
  clearAll: () => void;
}

const AlertContext = createContext<AlertContextValue | null>(null);

export function AlertProvider({ children }: { children: React.ReactNode }) {
  const [activeAlerts, setActiveAlerts] = useState<EmergencyAlert[]>([]);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    // Connect to SSE stream
    const es = new EventSource('/api/alerts/stream');
    eventSourceRef.current = es;

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'emergency_alert') {
          setActiveAlerts(prev => {
            const exists = prev.some(a => a.id === data.alert.id);
            if (exists) return prev;
            return [data.alert, ...prev].slice(0, 5); // max 5 active banners
          });
          // Browser notification if supported
          if (Notification.permission === 'granted') {
            new Notification(`🚨 Emergency Alert: ${data.alert.alertType.toUpperCase()}`, {
              body: data.alert.message,
            });
          }
        } else if (data.type === 'alert_resolved') {
          setActiveAlerts(prev => prev.filter(a => a.id !== data.alertId));
        }
      } catch { /* ignore parse errors */ }
    };

    es.onerror = () => {
      // Auto-reconnect handled by browser
    };

    // Request notification permission
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => {
      es.close();
    };
  }, []);

  const dismissAlert = (id: string) => {
    setActiveAlerts(prev => prev.filter(a => a.id !== id));
  };

  const clearAll = () => setActiveAlerts([]);

  return (
    <AlertContext.Provider value={{ activeAlerts, dismissAlert, clearAll }}>
      {children}
    </AlertContext.Provider>
  );
}

export function useAlerts() {
  const ctx = useContext(AlertContext);
  if (!ctx) throw new Error('useAlerts must be used within AlertProvider');
  return ctx;
}
