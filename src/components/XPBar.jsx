import React from 'react';
import { theme } from '../styles/theme.js';

const styles = {
  container: {
    width: '100%',
    height: '8px',
    background: theme.colors.secondary,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    background: `linear-gradient(90deg, ${theme.colors.accent}, #ffed4a)`,
    transition: 'width 0.5s ease-out',
    borderRadius: '0 4px 4px 0',
  },
};

export default function XPBar({ currentXP, requiredXP }) {
  const percent = requiredXP > 0 ? Math.min((currentXP / requiredXP) * 100, 100) : 0;

  return (
    <div style={styles.container}>
      <div style={{ ...styles.fill, width: `${percent}%` }} />
    </div>
  );
}
