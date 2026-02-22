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
    marginBottom: '10px',
    width: '100%',
    textAlign: 'center',
  },
  statsBadge: {
    background: theme.colors.surface,
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '13px',
    fontWeight: 'bold',
    color: theme.colors.accent,
    marginBottom: '16px',
    border: `1px solid ${theme.colors.secondary}`,
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

export default function ReviewScreen({ hanjaPool, onHome, gameState, playSound, onCharResult, charMastery }) {
  const { addXP } = gameState;
  const [charList, setCharList] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState([]);
  const [unknown, setUnknown] = useState([]);
  const [finished, setFinished] = useState(false);
  const [reviewMode, setReviewMode] = useState('smart'); // 'smart' (틀린거 위주) or 'all'

  const initReview = useCallback((pool, mode = 'smart') => {
    let list = [];

    if (mode === 'smart' && charMastery) {
      // 1. 틀린 적이 있는 한자 (오답 횟수 내림차순)
      const wrongItems = pool.filter(item => {
        const stats = charMastery[item.char];
        return stats && stats.wrong > 0;
      }).sort((a, b) => {
        const statsA = charMastery[a.char];
        const statsB = charMastery[b.char];
        // 틀린 횟수가 많을수록, 정답률이 낮을수록 우선
        const rateA = statsA.correct / (statsA.correct + statsA.wrong);
        const rateB = statsB.correct / (statsB.correct + statsB.wrong);
        if (rateA !== rateB) return rateA - rateB; // 낮은 정답률 우선
        return statsB.wrong - statsA.wrong; // 많은 오답 우선
      });

      // 2. 아직 안 풀어본 한자 or 정답률이 낮은 한자 섞기
      const otherItems = pool.filter(item => !wrongItems.includes(item));
      const shuffledOthers = shuffle(otherItems);

      // 3. 조합 (틀린거 우선, 모자르면 나머지 채우기)
      // 틀린 문제가 너무 많으면 그것만으로 20개 채움
      list = [...wrongItems, ...shuffledOthers].slice(0, TOTAL_COUNT);
      
      // 마지막으로 순서를 살짝 섞어줌 (너무 정렬되어 있으면 지루함)
      // 단, 틀린게 너무 뒤로 가지 않게 가중치 셔플을 하거나 그냥 둠. 
      // 여기선 학습 효과를 위해 그냥 둠 (틀린거 먼저 빡세게!)
    } else {
      list = shuffle(pool).slice(0, TOTAL_COUNT);
    }

    setCharList(list);
    setCurrentIdx(0);
    setFlipped(false);
    setKnown([]);
    setUnknown([]);
    setFinished(false);
    setReviewMode(mode);
  }, [charMastery]);

  useEffect(() => {
    initReview(hanjaPool, 'smart');
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
    if (onCharResult) onCharResult(charList[currentIdx].char, true);
    setKnown((prev) => [...prev, charList[currentIdx]]);
    goNext();
  }, [playSound, addXP, charList, currentIdx, goNext, onCharResult]);

  const handleDontKnow = useCallback(() => {
    playSound('click');
    if (onCharResult) onCharResult(charList[currentIdx].char, false);
    setUnknown((prev) => [...prev, charList[currentIdx]]);
    goNext();
  }, [playSound, charList, currentIdx, goNext, onCharResult]);

  const handleFlip = useCallback(() => {
    playSound('flip');
    setFlipped((prev) => !prev);
  }, [playSound]);

  const handleRetryUnknown = useCallback(() => {
    if (unknown.length > 0) {
      // 틀린 것만 다시 복습 (단순 셔플)
      const list = shuffle(unknown);
      setCharList(list);
      setCurrentIdx(0);
      setFlipped(false);
      setKnown([]);
      setUnknown([]);
      setFinished(false);
    }
  }, [unknown]);

  // 통계 표시용 헬퍼
  const getStatsText = (char) => {
    const stats = charMastery[char];
    if (!stats) return '학습 기록 없음';
    const total = stats.correct + stats.wrong;
    if (total === 0) return '학습 기록 없음';
    const percent = Math.round((stats.correct / total) * 100);
    return `정답률 ${percent}% (${stats.correct}/${total})`;
  };

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
              틀린 문제 다시 보기
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

      <div style={styles.statsBadge}>
        {getStatsText(current.char)}
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
