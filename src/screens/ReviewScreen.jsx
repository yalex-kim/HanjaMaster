import React, { useState, useEffect, useCallback } from 'react';
import { theme } from '../styles/theme.js';
import { shuffle } from '../utils/shuffle.js';

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
    marginBottom: '20px',
    width: '100%',
    textAlign: 'center',
  },
  cardWrapper: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: '24px',
    perspective: '600px',
  },
  card: {
    width: '100%',
    maxWidth: '340px',
    minHeight: '280px',
    borderRadius: '20px',
    background: theme.colors.surface,
    boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '32px 24px',
    cursor: 'pointer',
    transition: 'transform 0.5s ease',
    transformStyle: 'preserve-3d',
    position: 'relative',
    userSelect: 'none',
  },
  cardFlipped: {
    transform: 'rotateY(180deg)',
  },
  cardFace: {
    backfaceVisibility: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: '32px 24px',
    borderRadius: '20px',
  },
  cardBack: {
    transform: 'rotateY(180deg)',
  },
  frontChar: {
    fontSize: '80px',
    fontFamily: theme.fonts.serif,
    color: theme.colors.text,
    marginBottom: '12px',
  },
  frontHint: {
    fontSize: '14px',
    color: theme.colors.textSecondary,
  },
  backMeaning: {
    fontSize: '28px',
    fontWeight: 700,
    color: theme.colors.accent,
    marginBottom: '8px',
    fontFamily: theme.fonts.sans,
  },
  backLevel: {
    fontSize: '13px',
    color: theme.colors.textSecondary,
    marginBottom: '16px',
  },
  backExamples: {
    fontSize: '15px',
    color: theme.colors.text,
    textAlign: 'center',
    lineHeight: '1.6',
  },
  actions: {
    display: 'flex',
    gap: '12px',
    width: '100%',
    maxWidth: '340px',
  },
  knowBtn: {
    flex: 1,
    padding: '14px',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: 600,
    cursor: 'pointer',
    border: 'none',
    background: theme.colors.success,
    color: '#fff',
    fontFamily: theme.fonts.sans,
    minHeight: theme.sizes.touchTarget,
  },
  dontKnowBtn: {
    flex: 1,
    padding: '14px',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: 600,
    cursor: 'pointer',
    border: 'none',
    background: theme.colors.error,
    color: '#fff',
    fontFamily: theme.fonts.sans,
    minHeight: theme.sizes.touchTarget,
  },
  resultContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '32px 16px',
    textAlign: 'center',
    minHeight: 'calc(100vh - 64px)',
  },
  resultEmoji: {
    fontSize: '48px',
    marginBottom: '16px',
  },
  resultTitle: {
    fontSize: '28px',
    fontWeight: 700,
    fontFamily: theme.fonts.display,
    color: theme.colors.text,
    marginBottom: '20px',
  },
  resultStats: {
    display: 'flex',
    gap: '24px',
    marginBottom: '24px',
  },
  resultStatItem: {
    textAlign: 'center',
  },
  resultStatValue: {
    fontSize: '28px',
    fontWeight: 700,
    fontFamily: theme.fonts.display,
  },
  resultStatLabel: {
    fontSize: '13px',
    color: theme.colors.textSecondary,
    marginTop: '4px',
  },
  unknownSection: {
    width: '100%',
    maxWidth: '340px',
    marginBottom: '24px',
  },
  unknownTitle: {
    fontSize: '15px',
    fontWeight: 700,
    color: theme.colors.text,
    marginBottom: '12px',
    textAlign: 'left',
  },
  unknownItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 14px',
    background: theme.colors.surface,
    borderRadius: '10px',
    marginBottom: '6px',
  },
  unknownChar: {
    fontSize: '24px',
    fontFamily: theme.fonts.serif,
    color: theme.colors.text,
  },
  unknownMeaning: {
    fontSize: '14px',
    color: theme.colors.textSecondary,
  },
  resultBtns: {
    display: 'flex',
    gap: '12px',
    width: '100%',
    maxWidth: '340px',
  },
  retryBtn: {
    flex: 1,
    padding: '14px',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: 600,
    cursor: 'pointer',
    border: `2px solid ${theme.colors.primary}`,
    background: 'transparent',
    color: theme.colors.primary,
    fontFamily: theme.fonts.sans,
    minHeight: theme.sizes.touchTarget,
  },
  homeBtn: {
    flex: 1,
    padding: '14px',
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

export default function ReviewScreen({ hanjaPool, onHome, gameState, playSound }) {
  const { addXP } = gameState;
  const [charList, setCharList] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState([]);
  const [unknown, setUnknown] = useState([]);
  const [finished, setFinished] = useState(false);
  const [reviewMode, setReviewMode] = useState('all');

  const initReview = useCallback((pool) => {
    const list = shuffle(pool).slice(0, TOTAL_COUNT);
    setCharList(list);
    setCurrentIdx(0);
    setFlipped(false);
    setKnown([]);
    setUnknown([]);
    setFinished(false);
  }, []);

  useEffect(() => {
    initReview(hanjaPool);
  }, [hanjaPool, initReview]);

  const goNext = useCallback(() => {
    if (currentIdx + 1 >= charList.length) {
      setFinished(true);
    } else {
      setCurrentIdx((prev) => prev + 1);
      setFlipped(false);
    }
  }, [currentIdx, charList.length]);

  const handleKnow = useCallback(() => {
    playSound('correct');
    addXP(3);
    setKnown((prev) => [...prev, charList[currentIdx]]);
    goNext();
  }, [playSound, addXP, charList, currentIdx, goNext]);

  const handleDontKnow = useCallback(() => {
    playSound('click');
    setUnknown((prev) => [...prev, charList[currentIdx]]);
    goNext();
  }, [playSound, charList, currentIdx, goNext]);

  const handleFlip = useCallback(() => {
    playSound('flip');
    setFlipped((prev) => !prev);
  }, [playSound]);

  const handleRetryUnknown = useCallback(() => {
    if (unknown.length > 0) {
      setReviewMode('unknown');
      initReview(unknown);
    }
  }, [unknown, initReview]);

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
        <div style={styles.resultEmoji}>{'\uD83D\uDCD6'}</div>
        <div style={styles.resultTitle}>복습 완료!</div>
        <div style={styles.resultStats}>
          <div style={styles.resultStatItem}>
            <div style={{ ...styles.resultStatValue, color: theme.colors.success }}>
              {known.length}
            </div>
            <div style={styles.resultStatLabel}>알아요</div>
          </div>
          <div style={styles.resultStatItem}>
            <div style={{ ...styles.resultStatValue, color: theme.colors.error }}>
              {unknown.length}
            </div>
            <div style={styles.resultStatLabel}>모르겠어요</div>
          </div>
        </div>

        {unknown.length > 0 && (
          <div style={styles.unknownSection}>
            <div style={styles.unknownTitle}>모르는 한자</div>
            {unknown.map((h, i) => (
              <div key={i} style={styles.unknownItem}>
                <span style={styles.unknownChar}>{h.char}</span>
                <span style={styles.unknownMeaning}>{h.meaning} {h.sound}</span>
              </div>
            ))}
          </div>
        )}

        <div style={styles.resultBtns}>
          {unknown.length > 0 && (
            <button style={styles.retryBtn} onClick={handleRetryUnknown}>
              모르는 한자 복습
            </button>
          )}
          <button style={styles.homeBtn} onClick={onHome}>홈으로</button>
        </div>
      </div>
    );
  }

  const current = charList[currentIdx];

  return (
    <div style={styles.container}>
      <div style={styles.progressText}>
        {currentIdx + 1} / {charList.length}
      </div>

      <div style={styles.cardWrapper} onClick={handleFlip}>
        <div style={{ ...styles.card, ...(flipped ? styles.cardFlipped : {}) }}>
          <div style={styles.cardFace}>
            <div style={styles.frontChar}>{current.char}</div>
            <div style={styles.frontHint}>탭하여 뒤집기</div>
          </div>
          <div style={{ ...styles.cardFace, ...styles.cardBack }}>
            <div style={styles.backMeaning}>{current.meaning} {current.sound}</div>
            <div style={styles.backLevel}>{current.level}</div>
            {current.examples && current.examples.length > 0 && (
              <div style={styles.backExamples}>
                {current.examples.join(', ')}
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={styles.actions}>
        <button style={styles.knowBtn} onClick={handleKnow}>
          {'알아요 \u2705'}
        </button>
        <button style={styles.dontKnowBtn} onClick={handleDontKnow}>
          {'모르겠어요 \u274C'}
        </button>
      </div>
    </div>
  );
}
