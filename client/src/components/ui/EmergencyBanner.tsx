import React from 'react';
import { useAlerts } from '../../context/AlertContext';

const alertConfig: Record<string, { emoji: string; label: string; color: string }> = {
  panic:    { emoji: '🆘', label: 'PANIC ALERT', color: '#B91C1C' },
  fire:     { emoji: '🔥', label: 'FIRE ALERT', color: '#C2410C' },
  medical:  { emoji: '🚑', label: 'MEDICAL EMERGENCY', color: '#7C3AED' },
  security: { emoji: '🚔', label: 'SECURITY ALERT', color: '#B45309' },
};

export default function EmergencyBanner() {
  const { activeAlerts, dismissAlert } = useAlerts();

  if (activeAlerts.length === 0) return null;

  // Show the most recent alert in the banner
  const alert = activeAlerts[0];
  const cfg = alertConfig[alert.alertType] || alertConfig.security;

  return (
    <div className="emergency-banner" role="alert" aria-live="assertive">
      <div className="pulse-dot" />
      <span style={{ fontSize: '1.4rem' }}>{cfg.emoji}</span>
      <div className="banner-text">
        <div className="banner-title">
          {cfg.label} — {alert.tenantName}
        </div>
        <div className="banner-message">
          {alert.message}
          {alert.location && ` • Location: ${alert.location}`}
          {' • '}Triggered by: {alert.triggeredBy}
        </div>
      </div>
      {activeAlerts.length > 1 && (
        <span style={{ fontSize: 'var(--font-xs)', color: '#FCA5A5', fontWeight: 600 }}>
          +{activeAlerts.length - 1} more
        </span>
      )}
      <button className="dismiss-btn" onClick={() => dismissAlert(alert.id)}>
        Dismiss
      </button>
    </div>
  );
}
