import React, { useState, useEffect, useCallback, useRef } from 'react';
import { theme } from '../styles/theme.js';
import { shuffle } from '../utils/shuffle.js';
import FlipCard from '../components/FlipCard.jsx';

const styles = {
  container: {
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minHeight: 'calc(100vh - 64px)',
  },
  statsRow: {
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: '16px',
    fontSize: '14px',
    color: theme.colors.textSecondary,
  },
  statHighlight: {
    color: theme.colors.accent,
    fontWeight: 700,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '8px',
    width: '100%',
    maxWidth: '360px',
  },
  cardFront: {
    fontSize: '28px',
    color: theme.colors.textSecondary,
    fontWeight: 700,
    userSelect: 'none',
  },
  cardBackHanja: {
    fontSize: '32px',
    fontFamily: theme.fonts.serif,
    color: theme.colors.text,
    userSelect: 'none',
  },
  cardBackMeaning: {
    fontSize: '14px',
    fontWeight: 600,
    color: theme.colors.text,
    textAlign: 'center',
    lineHeight: '1.3',
    userSelect: 'none',
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
  resultStars: {
    fontSize: '48px',
    marginBottom: '16px',
  },
  resultTitle: {
    fontSize: '28px',
    fontWeight: 700,
    fontFamily: theme.fonts.display,
    color: theme.colors.text,
    marginBottom: '12px',
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
  resultBtns: {
    display: 'flex',
    gap: '12px',
    width: '100%',
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

function createCards(pool) {
  const selected = shuffle(pool).slice(0, 6);
  const cards = [];
  selected.forEach((hanja, i) => {
    cards.push({
      id: i * 2,
      pairId: i,
      type: 'hanja',
      content: hanja.char,
      flipped: false,
      matched: false,
    });
    cards.push({
      id: i * 2 + 1,
      pairId: i,
      type: 'meaning',
      content: `${hanja.meaning}\n${hanja.sound}`,
      flipped: false,
      matched: false,
    });
  });
  return shuffle(cards);
}

export default function MatchScreen({ hanjaPool, onHome, gameState, playSound }) {
  const { addXP } = gameState;
  const [cards, setCards] = useState([]);
  const [firstCard, setFirstCard] = useState(null);
  const [secondCard, setSecondCard] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [finished, setFinished] = useState(false);
  const [locked, setLocked] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    resetGame();
  }, [hanjaPool]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const resetGame = useCallback(() => {
    setCards(createCards(hanjaPool));
    setFirstCard(null);
    setSecondCard(null);
    setAttempts(0);
    setMatchedPairs(0);
    setFinished(false);
    setLocked(false);
  }, [hanjaPool]);

  const handleCardClick = useCallback((card) => {
    if (locked) return;
    if (card.flipped || card.matched) return;

    playSound('click');

    if (firstCard === null) {
      setFirstCard(card);
      setCards((prev) =>
        prev.map((c) => (c.id === card.id ? { ...c, flipped: true } : c))
      );
    } else if (secondCard === null && card.id !== firstCard.id) {
      setSecondCard(card);
      setLocked(true);
      setAttempts((a) => a + 1);
      setCards((prev) =>
        prev.map((c) => (c.id === card.id ? { ...c, flipped: true } : c))
      );

      const isMatch = firstCard.pairId === card.pairId;
      if (isMatch) {
        playSound('flip');
        const newMatchedPairs = matchedPairs + 1;
        setMatchedPairs(newMatchedPairs);
        setCards((prev) =>
          prev.map((c) =>
            c.pairId === card.pairId ? { ...c, matched: true, flipped: true } : c
          )
        );
        setFirstCard(null);
        setSecondCard(null);
        setLocked(false);

        if (newMatchedPairs === 6) {
          addXP(30);
          timerRef.current = setTimeout(() => setFinished(true), 600);
        }
      } else {
        timerRef.current = setTimeout(() => {
          setCards((prev) =>
            prev.map((c) => {
              if (c.id === firstCard.id || c.id === card.id) {
                return { ...c, flipped: false };
              }
              return c;
            })
          );
          setFirstCard(null);
          setSecondCard(null);
          setLocked(false);
        }, 800);
      }
    }
  }, [firstCard, secondCard, locked, matchedPairs, playSound, addXP]);

  if (hanjaPool.length < 6) {
    return (
      <div style={styles.container}>
        <div style={{ color: theme.colors.textSecondary, fontSize: '16px', marginTop: '40px' }}>
          한자 데이터가 부족합니다 (최소 6개 필요)
        </div>
      </div>
    );
  }

  if (finished) {
    const stars = attempts <= 8 ? 3 : attempts <= 12 ? 2 : 1;
    const starDisplay = Array(stars).fill('\u2B50').join('');

    return (
      <div style={styles.resultContainer}>
        <div style={styles.resultStars}>{starDisplay}</div>
        <div style={styles.resultTitle}>매칭 완료!</div>
        <div style={styles.resultDetail}>시도 횟수: {attempts}회</div>
        <div style={styles.resultXP}>+30 XP</div>
        <div style={styles.resultBtns}>
          <button style={styles.retryBtn} onClick={resetGame}>다시 하기</button>
          <button style={styles.homeBtn} onClick={onHome}>홈으로</button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.statsRow}>
        <span>시도: <span style={styles.statHighlight}>{attempts}</span>회</span>
        <span>매칭: <span style={styles.statHighlight}>{matchedPairs}</span>/6</span>
      </div>
      <div style={styles.grid}>
        {cards.map((card) => {
          const cardHeight = 'calc((min(100vw, 430px) - 48px) / 3 * 1.2)';
          const backContent =
            card.type === 'hanja' ? (
              <span style={styles.cardBackHanja}>{card.content}</span>
            ) : (
              <span style={styles.cardBackMeaning}>
                {card.content.split('\n').map((line, i) => (
                  <span key={i}>
                    {line}
                    {i === 0 && <br />}
                  </span>
                ))}
              </span>
            );

          return (
            <FlipCard
              key={card.id}
              front={<span style={styles.cardFront}>?</span>}
              back={backContent}
              flipped={card.flipped || card.matched}
              matched={card.matched}
              onClick={() => handleCardClick(card)}
              style={{ width: '100%', height: cardHeight }}
            />
          );
        })}
      </div>
    </div>
  );
}
