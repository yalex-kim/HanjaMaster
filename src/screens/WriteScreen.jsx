import React, { useState, useEffect } from 'react';
import { theme } from '../styles/theme.js';
import WritingCanvas from '../components/WritingCanvas.jsx';

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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentItem, setCurrentItem] = useState(hanjaPool[0]);

  useEffect(() => {
    // 셔플된 풀이나 순차적 풀 사용
    setCurrentItem(hanjaPool[currentIndex % hanjaPool.length]);
  }, [currentIndex, hanjaPool]);

  const handleNext = () => {
    playSound('click');
    setCurrentIndex((prev) => (prev + 1) % hanjaPool.length);
  };

  const handleComplete = (summary) => {
    // 쓰기 성공 시 처리 (예: 효과음, 경험치 등)
    // summary: { totalMistakes, ... }
    if (summary.totalMistakes < 3) {
      playSound('correct');
      // 결과 기록 (쓰기는 정답/오답 개념이 모호하지만 완료하면 성공으로 간주)
      if (onCharResult) onCharResult(currentItem.char, true);
    } else {
      // 실수가 많으면 별도 효과음?
      playSound('wrong'); 
    }
  };

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
        다음 한자 (Next) ▶
      </button>
      
      <button style={styles.homeBtn} onClick={onHome}>
        홈으로 나가기
      </button>
    </div>
  );
}
