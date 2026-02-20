import { useState, useCallback, useRef } from 'react';

export function useCanvas() {
  const [strokeCount, setStrokeCount] = useState(0);
  const pathsRef = useRef([]);
  const currentPathRef = useRef([]);
  const isDrawingRef = useRef(false);
  const ctxRef = useRef(null);
  const canvasInfoRef = useRef({ width: 280, height: 280, dpr: 1 });

  const initCanvas = useCallback((canvasRef, width = 280, height = 280) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    ctxRef.current = ctx;
    canvasInfoRef.current = { width, height, dpr };
    drawGrid(ctx, width, height);
    return ctx;
  }, []);

  const drawGrid = useCallback((ctx, w, h) => {
    ctx.save();
    ctx.strokeStyle = '#2a2a4e';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    // Vertical center line
    ctx.beginPath();
    ctx.moveTo(w / 2, 0);
    ctx.lineTo(w / 2, h);
    ctx.stroke();
    // Horizontal center line
    ctx.beginPath();
    ctx.moveTo(0, h / 2);
    ctx.lineTo(w, h / 2);
    ctx.stroke();
    ctx.restore();
  }, []);

  const getPos = useCallback((e, canvasRef) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  }, []);

  const startStroke = useCallback((e, canvasRef) => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    isDrawingRef.current = true;
    const pos = getPos(e, canvasRef);
    currentPathRef.current = [pos];
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    ctx.strokeStyle = '#e94560';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, [getPos]);

  const continueStroke = useCallback((e, canvasRef) => {
    if (!isDrawingRef.current) return;
    const ctx = ctxRef.current;
    if (!ctx) return;
    const pos = getPos(e, canvasRef);
    currentPathRef.current.push(pos);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  }, [getPos]);

  const endStroke = useCallback(() => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    if (currentPathRef.current.length > 1) {
      pathsRef.current = [...pathsRef.current, currentPathRef.current];
      setStrokeCount((c) => c + 1);
    }
    currentPathRef.current = [];
  }, []);

  const showHint = useCallback((ctx, char, w, h) => {
    if (!ctx) return;
    ctx.save();
    ctx.font = `${Math.min(w, h) * 0.7}px serif`;
    ctx.fillStyle = 'rgba(255, 215, 0, 0.25)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(char, w / 2, h / 2);
    ctx.restore();
  }, []);

  const clearCanvas = useCallback((ctx, canvasRef) => {
    if (!ctx || !canvasRef.current) return;
    const { width, height } = canvasInfoRef.current;
    ctx.clearRect(0, 0, width, height);
    drawGrid(ctx, width, height);
    pathsRef.current = [];
    currentPathRef.current = [];
    setStrokeCount(0);
  }, [drawGrid]);

  return {
    initCanvas,
    drawGrid,
    startStroke,
    continueStroke,
    endStroke,
    showHint,
    clearCanvas,
    strokeCount,
    paths: pathsRef.current,
  };
}
