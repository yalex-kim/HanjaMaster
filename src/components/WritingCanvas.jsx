import React, { useRef, useEffect, useState } from 'react';
import HanziWriter from 'hanzi-writer';
import { theme } from '../styles/theme.js';

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
  },
  writerWrapper: {
    background: theme.colors.surface,
    borderRadius: '12px',
    border: `2px solid ${theme.colors.secondary}`,
    overflow: 'hidden',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
  },
  controls: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  button: {
    minWidth: theme.sizes.touchTarget,
    padding: '8px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    border: 'none',
    fontFamily: theme.fonts.sans,
    color: theme.colors.text,
    transition: 'all 0.2s',
  },
  animateBtn: {
    background: theme.colors.primary,
    color: 'white',
  },
  quizBtn: {
    background: theme.colors.accent,
    color: 'white',
  },
  outlineBtn: {
    background: theme.colors.secondary,
  },
  status: {
    height: '24px',
    fontSize: '14px',
    fontWeight: 'bold',
    color: theme.colors.textSecondary,
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  success: {
    color: theme.colors.success,
  },
  error: {
    color: theme.colors.error,
  }
};

export default function WritingCanvas({ char, width = 280, height = 280, onComplete, maxAnimateCount = null }) {
  const writerRef = useRef(null);
  const writerInstance = useRef(null);
  const [status, setStatus] = useState({ text: '준비', type: 'normal' });
  const [isQuizMode, setIsQuizMode] = useState(false);
  const [animateCount, setAnimateCount] = useState(0);

  useEffect(() => {
    // 한자가 바뀌면 카운트 초기화
    setAnimateCount(0);
  }, [char]);

  useEffect(() => {
    if (!writerRef.current || !char) return;

    // 기존 인스턴스 정리 없음 (HanziWriter는 DOM을 직접 조작하므로 innerHTML 초기화가 편함)
    writerRef.current.innerHTML = '';

    try {
      writerInstance.current = HanziWriter.create(writerRef.current, char, {
        width,
        height,
        padding: 20,
        showOutline: true,
        strokeAnimationSpeed: 1,
        delayBetweenStrokes: 200,
        strokeColor: '#ffffff', // 획 색상 (흰색)
        outlineColor: '#555555', // 배경 힌트 색상 (회색)
        radicalColor: theme.colors.accent, // 부수 색상 (강조)
        drawingWidth: 20, // 획 굵기 (기본값보다 훨씬 두껍게 설정)
        googlePolyfill: true, // 구글 폰트 데이터 백업 사용
        charDataLoader: (char, onComplete) => {
          fetch(`https://cdn.jsdelivr.net/npm/hanzi-writer-data@2.0/${char}.json`)
            .then(res => res.json())
            .then(onComplete)
            .catch(() => {
              setStatus({ text: '데이터 로드 실패', type: 'error' });
            });
        }
      });

      // 로드 완료 후 퀴즈 모드 자동 시작 (선택 사항)
      // writerInstance.current.quiz();
      setStatus({ text: '따라 써보세요!', type: 'normal' });

    } catch (err) {
      console.error(err);
      setStatus({ text: '오류 발생', type: 'error' });
    }

  }, [char, width, height]);

  const handleAnimate = () => {
    if (!writerInstance.current) return;
    
    // 최대 횟수 제한 체크
    if (maxAnimateCount !== null && animateCount >= maxAnimateCount) {
      setStatus({ text: `획순 보기는 ${maxAnimateCount}회만 가능합니다!`, type: 'error' });
      return;
    }

    setIsQuizMode(false);
    writerInstance.current.animateCharacter({
      onComplete: () => {
        setStatus({ text: '획순 보기 완료', type: 'normal' });
        setAnimateCount(prev => prev + 1);
      }
    });
  };

  const handleQuiz = () => {
    if (!writerInstance.current) return;
    setIsQuizMode(true);
    setStatus({ text: '쓰기 연습 시작!', type: 'normal' });
    
    writerInstance.current.quiz({
      onMistake: (strokeData) => {
        setStatus({ text: '앗! 다시 그어보세요.', type: 'error' });
      },
      onCorrectStroke: (strokeData) => {
        setStatus({ text: `좋아요! (${strokeData.strokeNum}/${strokeData.totalStrokes})`, type: 'normal' });
      },
      onComplete: (summary) => {
        setStatus({ text: '참 잘했어요! 🎉', type: 'success' });
        if (onComplete) onComplete(summary);
      }
    });
  };

  const toggleOutline = () => {
    if (!writerInstance.current) return;
    const data = writerInstance.current._options; // 내부 옵션 접근 (API에 hideOutline/showOutline이 있음)
    // HanziWriter API: hideOutline(), showOutline()
    // 현재 상태를 알기 어려우므로 토글 로직 구현
    // 간단히: 항상 껐다 켰다 하기보다 버튼을 분리하거나 상태관리 필요.
    // 여기서는 "힌트 끄기/켜기"로 구현
    // _options.showOutline은 초기값일 뿐.
    
    // 강제로 show/hide
    // writerInstance.current.hideOutline();
    // writerInstance.current.showOutline();
  };

  return (
    <div style={styles.container}>
      <div ref={writerRef} style={{ ...styles.writerWrapper, width, height }} />
      
      <div style={styles.status}>
        <span style={status.type === 'success' ? styles.success : status.type === 'error' ? styles.error : {}}>
          {status.text}
        </span>
      </div>

      <div style={styles.controls}>
        <button 
          style={{ 
            ...styles.button, 
            ...styles.animateBtn,
            opacity: (maxAnimateCount !== null && animateCount >= maxAnimateCount) ? 0.5 : 1,
            cursor: (maxAnimateCount !== null && animateCount >= maxAnimateCount) ? 'not-allowed' : 'pointer'
          }} 
          onClick={handleAnimate}
          disabled={maxAnimateCount !== null && animateCount >= maxAnimateCount}
        >
          {maxAnimateCount !== null ? `▶ 획순 보기 (${maxAnimateCount - animateCount}회 남음)` : '▶ 획순 보기'}
        </button>
        <button style={{ ...styles.button, ...styles.quizBtn }} onClick={handleQuiz}>
          ✍️ 따라 쓰기
        </button>
      </div>
    </div>
  );
}
