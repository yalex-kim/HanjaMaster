import React from 'react';
import { theme } from '../styles/theme.js';

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    animation: 'fadeIn 0.3s ease',
  },
  modal: {
    background: theme.colors.surface,
    borderRadius: '20px',
    padding: '40px 32px',
    textAlign: 'center',
    maxWidth: '320px',
    width: '90%',
    animation: 'bounceIn 0.5s ease',
    position: 'relative',
    overflow: 'hidden',
  },
  emoji: {
    fontSize: '64px',
    marginBottom: '16px',
    display: 'block',
  },
  title: {
    fontSize: '28px',
    fontWeight: 700,
    fontFamily: theme.fonts.display,
    color: theme.colors.accent,
    marginBottom: '8px',
  },
  levelText: {
    fontSize: '20px',
    color: theme.colors.text,
    marginBottom: '24px',
  },
  button: {
    background: theme.colors.primary,
    color: theme.colors.text,
    border: 'none',
    borderRadius: '12px',
    padding: '14px 32px',
    fontSize: '16px',
    fontWeight: 600,
    cursor: 'pointer',
    minWidth: theme.sizes.touchTarget,
    minHeight: theme.sizes.touchTarget,
    fontFamily: theme.fonts.sans,
  },
  confetti: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
    overflow: 'hidden',
  },
};

function ConfettiPiece({ index }) {
  const colors = ['#ffd700', '#e94560', '#4ade80', '#60a5fa', '#f472b6'];
  const color = colors[index % colors.length];
  const left = `${10 + (index * 17) % 80}%`;
  const delay = `${(index * 0.15) % 1}s`;
  const size = 6 + (index % 4) * 2;

  const style = {
    position: 'absolute',
    width: `${size}px`,
    height: `${size}px`,
    background: color,
    borderRadius: index % 2 === 0 ? '50%' : '2px',
    left,
    top: '-10px',
    animation: `confettiFall 1.5s ${delay} ease-in forwards`,
  };

  return <div style={style} />;
}

export default function LevelUpModal({ level, onClose }) {
  return (
    <div style={styles.overlay} onClick={onClose}>
      <style>{`
        @keyframes confettiFall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(300px) rotate(720deg); opacity: 0; }
        }
      `}</style>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.confetti}>
          {Array.from({ length: 12 }, (_, i) => (
            <ConfettiPiece key={i} index={i} />
          ))}
        </div>
        <span style={styles.emoji}>{'🎉'}</span>
        <div style={styles.title}>레벨 업!</div>
        <div style={styles.levelText}>Level {level}</div>
        <button style={styles.button} onClick={onClose}>
          계속하기
        </button>
      </div>
    </div>
  );
}
