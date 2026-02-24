import React, { useRef, useEffect, useState, useCallback } from 'react';
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
  },
  attemptsRow: {
    display: 'flex',
    gap: '6px',
    alignItems: 'center',
    fontSize: '13px',
    color: theme.colors.textSecondary,
  },
  heartFull:  { color: theme.colors.primary, fontSize: '16px' },
  heartEmpty: { color: '#555',               fontSize: '16px' },
};

/**
 * Props
 *  char            – 한자 문자
 *  width / height  – 캔버스 크기 (기본 280)
 *  onComplete      – 퀴즈 종료 콜백 ({ failed: bool, attempts: n })
 *  maxAnimateCount – 획순 보기 최대 횟수 (null = 무제한)
 *  autoQuiz        – true 이면 로드 직후 퀴즈 모드 자동 시작
 *  maxAttempts     – 최대 시도 횟수 (기본 3). autoQuiz 전용.
 */
export default function WritingCanvas({
  char,
  width = 280,
  height = 280,
  onComplete,
  maxAnimateCount = null,
  autoQuiz = false,
  maxAttempts = 3,
}) {
  const writerRef        = useRef(null);
  const writerInstance   = useRef(null);
  const attemptsLeftRef  = useRef(maxAttempts); // ref 로 관리 (콜백 클로저 문제 방지)
  const quizActiveRef    = useRef(false);

  const [status,       setStatus]       = useState({ text: '준비', type: 'normal' });
  const [isQuizMode,   setIsQuizMode]   = useState(false);
  const [animateCount, setAnimateCount] = useState(0);
  const [attemptsLeft, setAttemptsLeft] = useState(maxAttempts); // 화면 표시용

  // ── 퀴즈 시작 (내부 함수) ──────────────────────────────────────────
  const startQuiz = useCallback(() => {
    if (!writerInstance.current) return;
    quizActiveRef.current = true;
    setIsQuizMode(true);
    setStatus({ text: '획순대로 써보세요!', type: 'normal' });

    writerInstance.current.quiz({
      drawingWidth: 20,
      onMistake: () => {
        if (!quizActiveRef.current) return;

        const remaining = attemptsLeftRef.current - 1;
        attemptsLeftRef.current = remaining;
        setAttemptsLeft(remaining);
        quizActiveRef.current = false;

        if (remaining > 0) {
          // 틀렸으니 처음부터 재시작
          setStatus({ text: `틀렸어요! 처음부터 다시 (${remaining}번 남음)`, type: 'error' });
          writerInstance.current.cancelQuiz();

          setTimeout(() => {
            attemptsLeftRef.current = remaining; // 유지
            startQuiz();
          }, 1200);
        } else {
          // 3회 모두 소진 → 오답 처리
          setStatus({ text: '아쉬워요... 다음엔 꼭!', type: 'error' });
          writerInstance.current.cancelQuiz();
          // 정답 획순 보여주기
          setTimeout(() => {
            writerInstance.current.animateCharacter();
          }, 400);
          if (onComplete) onComplete({ failed: true, attempts: maxAttempts });
        }
      },
      onCorrectStroke: (strokeData) => {
        setStatus({ text: `좋아요! (${strokeData.strokeNum}/${strokeData.totalStrokes})`, type: 'normal' });
      },
      onComplete: () => {
        quizActiveRef.current = false;
        setStatus({ text: '참 잘했어요! 🎉', type: 'success' });
        const usedAttempts = maxAttempts - attemptsLeftRef.current + 1;
        if (onComplete) onComplete({ failed: false, attempts: usedAttempts });
      },
    });
  }, [onComplete, maxAttempts]);

  // ── HanziWriter 인스턴스 초기화 ────────────────────────────────────
  useEffect(() => {
    if (!writerRef.current || !char) return;

    setAnimateCount(0);
    attemptsLeftRef.current = maxAttempts;
    setAttemptsLeft(maxAttempts);
    quizActiveRef.current = false;
    writerRef.current.innerHTML = '';

    try {
      writerInstance.current = HanziWriter.create(writerRef.current, char, {
        width,
        height,
        padding: 20,
        showOutline: true,
        strokeAnimationSpeed: 1,
        delayBetweenStrokes: 200,
        strokeColor: '#ffffff',
        outlineColor: '#555555',
        radicalColor: theme.colors.accent,
        drawingWidth: 20,
        googlePolyfill: true,
        charDataLoader: (char, onLoad) => {
          fetch(`https://cdn.jsdelivr.net/npm/hanzi-writer-data@2.0/${char}.json`)
            .then(res => res.json())
            .then(data => {
              onLoad(data);
              // 로드 완료 후 autoQuiz 이면 자동 시작
              if (autoQuiz) {
                setTimeout(() => startQuiz(), 300);
              } else {
                setStatus({ text: '따라 써보세요!', type: 'normal' });
              }
            })
            .catch(() => setStatus({ text: '데이터 로드 실패', type: 'error' }));
        },
      });
    } catch (err) {
      console.error(err);
      setStatus({ text: '오류 발생', type: 'error' });
    }
  }, [char, width, height, autoQuiz]); // startQuiz 는 의도적으로 제외 (초기화 한 번만)

  // ── 수동 획순 보기 ─────────────────────────────────────────────────
  const handleAnimate = () => {
    if (!writerInstance.current) return;
    if (maxAnimateCount !== null && animateCount >= maxAnimateCount) {
      setStatus({ text: `획순 보기는 ${maxAnimateCount}회만 가능합니다!`, type: 'error' });
      return;
    }
    setIsQuizMode(false);
    quizActiveRef.current = false;
    writerInstance.current.animateCharacter({
      onComplete: () => {
        setStatus({ text: '획순 보기 완료', type: 'normal' });
        setAnimateCount(prev => prev + 1);
      },
    });
  };

  // ── 수동 퀴즈 시작 (autoQuiz 아닐 때 버튼용) ───────────────────────
  const handleQuiz = () => {
    attemptsLeftRef.current = maxAttempts;
    setAttemptsLeft(maxAttempts);
    startQuiz();
  };

  // ── 렌더 ──────────────────────────────────────────────────────────
  return (
    <div style={styles.container}>
      <div ref={writerRef} style={{ ...styles.writerWrapper, width, height }} />

      {/* autoQuiz 모드일 때만 힌트 및 시도 횟수 표시 */}
      {autoQuiz && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <div style={styles.attemptsRow}>
            {Array.from({ length: maxAttempts }).map((_, i) => (
              <span key={i} style={i < attemptsLeft ? styles.heartFull : styles.heartEmpty}>
                {i < attemptsLeft ? '❤️' : '🖤'}
              </span>
            ))}
            <span style={{ marginLeft: 4 }}>기회 남음</span>
          </div>

          {/* 복습 퀴즈용 힌트 버튼 (maxAnimateCount가 있을 때만) */}
          {maxAnimateCount !== null && (
            <button
              style={{
                ...styles.button,
                background: theme.colors.secondary,
                fontSize: '12px',
                padding: '4px 12px',
                opacity: animateCount >= maxAnimateCount ? 0.5 : 1
              }}
              onClick={handleAnimate}
              disabled={animateCount >= maxAnimateCount}
            >
              💡 획순 힌트 ({maxAnimateCount - animateCount}회 남음)
            </button>
          )}
        </div>
      )}

      <div style={styles.status}>
        <span style={status.type === 'success' ? styles.success : status.type === 'error' ? styles.error : {}}>
          {status.text}
        </span>
      </div>

      {/* autoQuiz 모드가 아닐 때만 수동 버튼 표시 */}
      {!autoQuiz && (
        <div style={styles.controls}>
          <button
            style={{
              ...styles.button,
              ...styles.animateBtn,
              opacity: (maxAnimateCount !== null && animateCount >= maxAnimateCount) ? 0.5 : 1,
              cursor:  (maxAnimateCount !== null && animateCount >= maxAnimateCount) ? 'not-allowed' : 'pointer',
            }}
            onClick={handleAnimate}
            disabled={maxAnimateCount !== null && animateCount >= maxAnimateCount}
          >
            {maxAnimateCount !== null
              ? `▶ 획순 보기 (${maxAnimateCount - animateCount}회 남음)`
              : '▶ 획순 보기'}
          </button>
          <button style={{ ...styles.button, ...styles.quizBtn }} onClick={handleQuiz}>
            ✍️ 따라 쓰기
          </button>
        </div>
      )}
    </div>
  );
}
