import React from 'react';
import { theme } from '../styles/theme.js';

const styles = {
  container: {
    height: theme.sizes.topBarHeight,
    background: theme.colors.surface,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 16px',
    width: '100%',
    boxSizing: 'border-box',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
  },
  left: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  homeButton: {
    minWidth: theme.sizes.touchTarget,
    minHeight: theme.sizes.touchTarget,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    borderRadius: '8px',
    color: theme.colors.text,
  },
  level: {
    fontSize: '16px',
    fontWeight: 700,
    color: theme.colors.accent,
    fontFamily: theme.fonts.display,
  },
  center: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '16px',
    fontWeight: 600,
    color: theme.colors.primary,
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '16px',
    color: theme.colors.primary,
  },
};

export default function TopBar({ level, streak, hearts, onHome }) {
  return (
    <div style={styles.container}>
      <div style={styles.left}>
        <button style={styles.homeButton} onClick={onHome} aria-label="홈으로">
          {'🏠'}
        </button>
        <span style={styles.level}>Lv.{level}</span>
      </div>
      <div style={styles.center}>
        <span>{'🔥'}</span>
        <span>{streak}</span>
      </div>
      <div style={styles.right}>
        <span>{'❤️'}</span>
        <span>{'\u00D7'}{hearts}</span>
      </div>
    </div>
  );
}
