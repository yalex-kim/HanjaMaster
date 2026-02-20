import React, { useRef, useEffect, useCallback } from 'react';
import { theme } from '../styles/theme.js';
import { useCanvas } from '../hooks/useCanvas.js';

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
  },
  canvas: {
    background: theme.colors.surface,
    borderRadius: '12px',
    border: `2px solid ${theme.colors.secondary}`,
    touchAction: 'none',
    cursor: 'crosshair',
  },
  controls: {
    display: 'flex',
    gap: '8px',
  },
  button: {
    minWidth: theme.sizes.touchTarget,
    minHeight: theme.sizes.touchTarget,
    padding: '8px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    border: 'none',
    fontFamily: theme.fonts.sans,
    color: theme.colors.text,
  },
  clearBtn: {
    background: theme.colors.secondary,
  },
  hintBtn: {
    background: theme.colors.cardBack,
    border: `1px solid ${theme.colors.accent}`,
    color: theme.colors.accent,
  },
  strokeInfo: {
    fontSize: '14px',
    color: theme.colors.textSecondary,
  },
};

export default function WritingCanvas({ char, width = 280, height = 280, onStrokeComplete }) {
  const canvasRef = useRef(null);
  const {
    initCanvas,
    startStroke,
    continueStroke,
    endStroke,
    showHint,
    clearCanvas,
    strokeCount,
  } = useCanvas();

  const ctxRef = useRef(null);

  useEffect(() => {
    const ctx = initCanvas(canvasRef, width, height);
    ctxRef.current = ctx;
  }, [initCanvas, width, height]);

  const handlePointerDown = useCallback((e) => {
    e.preventDefault();
    startStroke(e, canvasRef);
  }, [startStroke]);

  const handlePointerMove = useCallback((e) => {
    e.preventDefault();
    continueStroke(e, canvasRef);
  }, [continueStroke]);

  const handlePointerUp = useCallback(() => {
    endStroke();
    if (onStrokeComplete) onStrokeComplete(strokeCount + 1);
  }, [endStroke, onStrokeComplete, strokeCount]);

  const handleClear = useCallback(() => {
    clearCanvas(ctxRef.current, canvasRef);
  }, [clearCanvas]);

  const handleHint = useCallback(() => {
    if (ctxRef.current && char) {
      showHint(ctxRef.current, char, width, height);
    }
  }, [showHint, char, width, height]);

  return (
    <div style={styles.container}>
      <canvas
        ref={canvasRef}
        style={{ ...styles.canvas, width, height }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      />
      <div style={styles.controls}>
        <button
          style={{ ...styles.button, ...styles.clearBtn }}
          onClick={handleClear}
        >
          지우기
        </button>
        <button
          style={{ ...styles.button, ...styles.hintBtn }}
          onClick={handleHint}
        >
          힌트
        </button>
      </div>
      <span style={styles.strokeInfo}>
        획수: {strokeCount}
      </span>
    </div>
  );
}
