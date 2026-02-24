import React, { useState, useEffect } from 'react';
import { theme } from '../styles/theme.js';

const styles = {
  button: {
    position: 'fixed',
    bottom: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    background: theme.colors.primary,
    color: 'white',
    border: 'none',
    borderRadius: '24px',
    padding: '12px 24px',
    fontSize: '16px',
    fontWeight: 'bold',
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
    cursor: 'pointer',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    animation: 'slideUp 0.5s ease-out',
  },
  icon: {
    fontSize: '20px',
  },
};

export default function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    // 이미 닫았거나 거절했는지 확인
    const isDismissed = localStorage.getItem('pwa_install_dismissed');
    if (isDismissed) return;

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowButton(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleDismiss = (e) => {
    e.stopPropagation();
    localStorage.setItem('pwa_install_dismissed', 'true');
    setShowButton(false);
  };

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      localStorage.setItem('pwa_install_dismissed', 'true');
    }
    
    setDeferredPrompt(null);
    setShowButton(false);
  };

  if (!showButton) return null;

  return (
    <div style={styles.button} onClick={handleInstallClick}>
      <span style={styles.icon}>📲</span>
      앱 설치하기
      <span 
        onClick={handleDismiss}
        style={{
          marginLeft: '12px',
          padding: '4px 8px',
          fontSize: '18px',
          opacity: 0.7,
          borderLeft: '1px solid rgba(255,255,255,0.3)'
        }}
      >
        ✕
      </span>
    </div>
  );
}
