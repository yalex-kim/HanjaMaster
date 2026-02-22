import React, { useState, useEffect, useCallback } from 'react';
import { theme } from '../styles/theme.js';
import WritingCanvas from '../components/WritingCanvas.jsx';
import { shuffle } from '../utils/shuffle.js';

const styles = {
  container: {
    padding: '24px 16px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minHeight: '80vh',
  },
  card: {
    background: theme.colors.surface,
    borderRadius: '16px',
    padding: '24px',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '20px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
  },
  meaning: {
    fontSize: '24px',
    color: theme.colors.text,
    marginBottom: '8px',
    fontWeight: 'bold',
  },
  sound: {
    fontSize: '18px',
    color: theme.colors.textSecondary,
    marginBottom: '24px',
  },
  nextBtn: {
    background: theme.colors.primary,
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    padding: '12px 24px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '20px',
    width: '100%',
    fontFamily: theme.fonts.sans,
  },
  homeBtn: {
    background: 'transparent',
    border: `1px solid ${theme.colors.textSecondary}`,
    color: theme.colors.textSecondary,
    padding: '8px 16px',
    borderRadius: '8px',
    marginTop: '12px',
    cursor: 'pointer',
  }
};

export default function WriteScreen({ hanjaPool, onHome, playSound, onCharResult }) {
  const [shuffledPool, setShuffledPool] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentItem, setCurrentItem] = useState(null);

  // 초기화 및 랜덤 셔플
  useEffect(() => {
    setShuffledPool(shuffle([...hanjaPool]));
    setCurrentIndex(0);
  }, [hanjaPool]);

  // 현재 아이템 설정
  useEffect(() => {
    if (shuffledPool.length > 0) {
      setCurrentItem(shuffledPool[currentIndex % shuffledPool.length]);
    }
  }, [currentIndex, shuffledPool]);

  const handleNext = () => {
    playSound('click');
    // 무한 루프처럼 셔플된 풀을 순환 (랜덤성 유지)
    setCurrentIndex((prev) => prev + 1);
  };

  const handleComplete = (summary) => {
    // 쓰기 성공 시 처리
    if (summary.totalMistakes < 3) {
      playSound('correct');
      if (onCharResult) onCharResult(currentItem.char, true);
    } else {
      playSound('wrong'); 
    }
  };

  if (!currentItem) return <div>Loading...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.meaning}>{currentItem.meaning}</div>
        <div style={styles.sound}>{currentItem.sound}</div>
        
        <WritingCanvas 
          char={currentItem.char} 
          width={300} 
          height={300} 
          onComplete={handleComplete}
        />
      </div>

      <button style={styles.nextBtn} onClick={handleNext}>
        다음 한자 (랜덤) ▶
      </button>
      
      <button style={styles.homeBtn} onClick={onHome}>
        홈으로 나가기
      </button>
    </div>
  );
}
