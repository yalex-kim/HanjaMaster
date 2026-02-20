import React, { useState, useEffect, useCallback } from 'react';
import { theme } from '../styles/theme.js';
import { shuffle } from '../utils/shuffle.js';
import WritingCanvas from '../components/WritingCanvas.jsx';

const TOTAL_COUNT = 20;

const styles = {
  container: {
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minHeight: 'calc(100vh - 64px)',
  },
  progressText: {
    fontSize: '13px',
    color: theme.colors.textSecondary,
    marginBottom: '16px',
    width: '100%',
    textAlign: 'center',
  },
  charInfo: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '20px',
  },
  charDisplay: {
    fontSize: '48px',
    fontFamily: theme.fonts.serif,
    color: theme.colors.text,
    marginBottom: '8px',
  },
  charMeaning: {
    fontSize: '18px',
    color: theme.colors.accent,
    fontWeight: 600,
    marginBottom: '4px',
  },
  charLevel: {
    fontSize: '12px',
    color: theme.colors.textSecondary,
  },
  canvasArea: {
    marginBottom: '16px',
  },
  controls: {
    display: 'flex',
    gap: '8px',
    marginBottom: '20px',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  controlBtn: {
    padding: '10px 18px',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    border: 'none',
    fontFamily: theme.fonts.sans,
    color: theme.colors.text,
    minHeight: theme.sizes.touchTarget,
    minWidth: theme.sizes.touchTarget,
  },
  completeBtn: {
    background: theme.colors.success,
  },
  nextBtn: {
    background: theme.colors.primary,
  },
  resultContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 16px',
    textAlign: 'center',
    minHeight: 'calc(100vh - 64px)',
  },
  resultTitle: {
    fontSize: '28px',
    fontWeight: 700,
    fontFamily: theme.fonts.display,
    color: theme.colors.text,
    marginBottom: '12px',
  },
  resultEmoji: {
    fontSize: '48px',
    marginBottom: '16px',
  },
  resultDetail: {
    fontSize: '16px',
    color: theme.colors.textSecondary,
    marginBottom: '8px',
  },
  resultXP: {
    fontSize: '18px',
    fontWeight: 700,
    color: theme.colors.accent,
    marginBottom: '32px',
  },
  homeBtn: {
    padding: '14px 32px',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: 600,
    cursor: 'pointer',
    border: 'none',
    background: theme.colors.primary,
    color: theme.colors.text,
    fontFamily: theme.fonts.sans,
    minHeight: theme.sizes.touchTarget,
  },
};

export default function WriteScreen({ hanjaPool, onHome, gameState, playSound }) {
  const { addXP } = gameState;
  const [charList, setCharList] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [completed, setCompleted] = useState(0);
  const [totalXP, setTotalXP] = useState(0);
  const [finished, setFinished] = useState(false);
  const [canvasKey, setCanvasKey] = useState(0);

  useEffect(() => {
    const list = shuffle(hanjaPool).slice(0, TOTAL_COUNT);
    setCharList(list);
    setCurrentIdx(0);
    setCompleted(0);
    setTotalXP(0);
    setFinished(false);
    setCanvasKey(0);
  }, [hanjaPool]);

  const handleComplete = useCallback(() => {
    playSound('correct');
    const xpGain = 10;
    addXP(xpGain);
    setTotalXP((prev) => prev + xpGain);
    setCompleted((prev) => prev + 1);
  }, [playSound, addXP]);

  const handleNext = useCallback(() => {
    playSound('click');
    if (currentIdx + 1 >= charList.length) {
      setFinished(true);
    } else {
      setCurrentIdx((prev) => prev + 1);
      setCanvasKey((prev) => prev + 1);
    }
  }, [currentIdx, charList.length, playSound]);

  if (charList.length === 0) {
    return (
      <div style={styles.container}>
        <div style={{ color: theme.colors.textSecondary, fontSize: '16px', marginTop: '40px' }}>
          한자 데이터가 부족합니다
        </div>
      </div>
    );
  }

  if (finished) {
    return (
      <div style={styles.resultContainer}>
        <div style={styles.resultEmoji}>{'\u270D\uFE0F'}</div>
        <div style={styles.resultTitle}>쓰기 연습 완료!</div>
        <div style={styles.resultDetail}>{completed}자 완료</div>
        <div style={styles.resultXP}>+{totalXP} XP</div>
        <button style={styles.homeBtn} onClick={onHome}>홈으로</button>
      </div>
    );
  }

  const current = charList[currentIdx];

  return (
    <div style={styles.container}>
      <div style={styles.progressText}>
        {currentIdx + 1} / {charList.length}
      </div>

      <div style={styles.charInfo}>
        <div style={styles.charDisplay}>{current.char}</div>
        <div style={styles.charMeaning}>{current.meaning} {current.sound}</div>
        <div style={styles.charLevel}>{current.level}</div>
      </div>

      <div style={styles.canvasArea}>
        <WritingCanvas key={canvasKey} char={current.char} width={280} height={280} />
      </div>

      <div style={styles.controls}>
        <button
          style={{ ...styles.controlBtn, ...styles.completeBtn }}
          onClick={handleComplete}
        >
          {'\u2705'} 완료
        </button>
        <button
          style={{ ...styles.controlBtn, ...styles.nextBtn }}
          onClick={handleNext}
        >
          {'\u27A1\uFE0F'} 다음
        </button>
      </div>
    </div>
  );
}
