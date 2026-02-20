import React from 'react';
import { theme } from '../styles/theme.js';

const styles = {
  scene: {
    perspective: '600px',
    cursor: 'pointer',
  },
  flipper: {
    position: 'relative',
    width: '100%',
    height: '100%',
    transformStyle: 'preserve-3d',
    transition: 'transform 0.6s ease',
  },
  flipperFlipped: {
    transform: 'rotateY(180deg)',
  },
  face: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backfaceVisibility: 'hidden',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: theme.colors.cardBack,
    border: `2px solid ${theme.colors.secondary}`,
    padding: '8px',
    overflow: 'hidden',
  },
  faceBack: {
    transform: 'rotateY(180deg)',
  },
  matched: {
    border: `2px solid ${theme.colors.success}`,
    boxShadow: `0 0 12px ${theme.colors.success}40`,
  },
};

export default function FlipCard({ front, back, flipped, matched, onClick, style }) {
  const sceneStyle = { ...styles.scene, ...style };
  const flipperStyle = {
    ...styles.flipper,
    ...(flipped ? styles.flipperFlipped : {}),
  };
  const faceStyle = {
    ...styles.face,
    ...(matched ? styles.matched : {}),
  };

  return (
    <div style={sceneStyle} onClick={onClick}>
      <div style={flipperStyle}>
        <div style={faceStyle}>
          {front}
        </div>
        <div style={{ ...faceStyle, ...styles.faceBack, ...(matched ? styles.matched : {}) }}>
          {back}
        </div>
      </div>
    </div>
  );
}
