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
    // Connect to SSE stream if supported and in browser
    if (typeof window === 'undefined') return;

    if (typeof EventSource !== 'undefined') {
      try {
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
              try {
                if (typeof window !== 'undefined' && 'Notification' in window && window.Notification && window.Notification.permission === 'granted') {
                  const aType = data?.alert?.alertType || data?.alert?.alert_type || 'EMERGENCY';
                  new window.Notification(`🚨 Emergency Alert: ${aType.toUpperCase()}`, {
                    body: data?.alert?.message || 'New emergency alert broadcasted.',
                  });
                }
              } catch { /* ignore notification errors */ }
            } else if (data.type === 'alert_resolved') {
              setActiveAlerts(prev => prev.filter(a => a.id !== data.alertId));
            }
          } catch { /* ignore parse errors */ }
        };

        es.onerror = () => {
          // Auto-reconnect handled by browser or serverless fallback
        };
      } catch {
        // SSE not supported or network blocked
      }
    }

    // Safely request notification permission only if API is supported
    try {
      if (typeof window !== 'undefined' && 'Notification' in window && window.Notification && window.Notification.permission === 'default') {
        window.Notification.requestPermission().catch(() => {});
      }
    } catch {
      // Ignore unsupported Notification errors on iOS Safari / WebViews
    }

    return () => {
      try {
        if (eventSourceRef.current) {
          eventSourceRef.current.close();
        }
      } catch { /* ignore */ }
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
