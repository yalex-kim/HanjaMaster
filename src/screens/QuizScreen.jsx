import React, { useState, useEffect, useCallback, useRef } from 'react';
import { theme } from '../styles/theme.js';
import { generateQuiz } from '../utils/quiz.js';

const styles = {
  container: {
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minHeight: 'calc(100vh - 64px)',
  },
  progressBar: {
    width: '100%',
    height: '6px',
    background: theme.colors.surface,
    borderRadius: '3px',
    marginBottom: '8px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    background: theme.colors.accent,
    borderRadius: '3px',
    transition: 'width 0.3s ease',
  },
  progressText: {
    fontSize: '13px',
    color: theme.colors.textSecondary,
    marginBottom: '24px',
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
  },
  questionArea: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: '20px',
  },
  hanjaDisplay: {
    fontSize: '72px',
    fontFamily: theme.fonts.serif,
    color: theme.colors.text,
    marginBottom: '12px',
    textShadow: '0 2px 8px rgba(233,69,96,0.3)',
  },
  meaningDisplay: {
    fontSize: '28px',
    fontFamily: theme.fonts.serif,
    color: theme.colors.accent,
    marginBottom: '12px',
  },
  questionText: {
    fontSize: '16px',
    color: theme.colors.textSecondary,
    marginBottom: '24px',
    textAlign: 'center',
  },
  optionsContainer: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  optionBtn: {
    width: '100%',
    minHeight: '56px',
    padding: '14px 16px',
    borderRadius: '12px',
    fontSize: '18px',
    fontWeight: 600,
    cursor: 'pointer',
    border: `2px solid ${theme.colors.secondary}`,
    background: theme.colors.surface,
    color: theme.colors.text,
    fontFamily: theme.fonts.sans,
    textAlign: 'center',
    transition: 'all 0.2s',
  },
  feedbackCorrect: {
    background: theme.colors.success + '20',
    borderColor: theme.colors.success,
    color: theme.colors.success,
  },
  feedbackWrong: {
    background: theme.colors.error + '20',
    borderColor: theme.colors.error,
    color: theme.colors.error,
  },
  feedbackReveal: {
    borderColor: theme.colors.success,
    background: theme.colors.success + '10',
  },
  exampleBox: {
    width: '100%',
    background: theme.colors.surface,
    borderRadius: '12px',
    padding: '12px 16px',
    marginTop: '12px',
    borderLeft: `3px solid ${theme.colors.accent}`,
  },
  exampleLabel: {
    fontSize: '12px',
    color: theme.colors.textSecondary,
    marginBottom: '4px',
  },
  exampleText: {
    fontSize: '14px',
    color: theme.colors.text,
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
  resultScore: {
    fontSize: '48px',
    fontWeight: 700,
    color: theme.colors.accent,
    fontFamily: theme.fonts.display,
    marginBottom: '8px',
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

const QUESTION_LABELS = [
  '이 한자의 뜻과 음은?',
  '이 뜻음에 해당하는 한자는?',
  '이 한자의 음(소리)은?',
];

function getOptionLabel(item, type) {
  if (type === 0) return `${item.meaning} ${item.sound}`;
  if (type === 1) return item.char;
  return item.sound;
}

export default function QuizScreen({ hanjaPool, onHome, gameState, playSound }) {
  const { state, addXP, loseHeart, incrementStreak, resetStreak, addStudyResult } = gameState;
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [earnedXP, setEarnedXP] = useState(0);
  const [finished, setFinished] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    const q = generateQuiz(hanjaPool, 10);
    setQuestions(q);
    setCurrentIdx(0);
    setSelected(null);
    setIsCorrect(null);
    setTotalCorrect(0);
    setEarnedXP(0);
    setFinished(false);
  }, [hanjaPool]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleSelect = useCallback((option, idx) => {
    if (selected !== null) return;
    const q = questions[currentIdx];
    const correct = option === q.correct;
    setSelected(idx);
    setIsCorrect(correct);

    if (correct) {
      playSound('correct');
      incrementStreak();
      const xpGain = 10 + state.streak * 2;
      addXP(xpGain);
      setEarnedXP((prev) => prev + xpGain);
      setTotalCorrect((prev) => prev + 1);
      addStudyResult(true);
    } else {
      playSound('wrong');
      resetStreak();
      loseHeart();
      addStudyResult(false);
    }

    timerRef.current = setTimeout(() => {
      if (currentIdx + 1 >= questions.length) {
        setFinished(true);
      } else {
        setCurrentIdx((prev) => prev + 1);
        setSelected(null);
        setIsCorrect(null);
      }
    }, 1500);
  }, [selected, questions, currentIdx, playSound, incrementStreak, resetStreak, addXP, loseHeart, addStudyResult, state.streak]);

  const handleRetry = useCallback(() => {
    const q = generateQuiz(hanjaPool, 10);
    setQuestions(q);
    setCurrentIdx(0);
    setSelected(null);
    setIsCorrect(null);
    setTotalCorrect(0);
    setEarnedXP(0);
    setFinished(false);
  }, [hanjaPool]);

  if (questions.length === 0) {
    return (
      <div style={styles.container}>
        <div style={{ color: theme.colors.textSecondary, fontSize: '16px', marginTop: '40px' }}>
          한자 데이터가 부족합니다 (최소 4개 필요)
        </div>
      </div>
    );
  }

  if (finished) {
    const accuracy = Math.round((totalCorrect / questions.length) * 100);
    const stars = accuracy >= 90 ? 3 : accuracy >= 70 ? 2 : 1;
    const starDisplay = Array(stars).fill('\u2B50').join('');

    return (
      <div style={styles.resultContainer}>
        <div style={styles.resultStars}>{starDisplay}</div>
        <div style={styles.resultTitle}>퀴즈 완료!</div>
        <div style={styles.resultScore}>{totalCorrect}/{questions.length}</div>
        <div style={styles.resultDetail}>정답률 {accuracy}%</div>
        <div style={styles.resultXP}>+{earnedXP} XP</div>
        <div style={styles.resultBtns}>
          <button style={styles.retryBtn} onClick={handleRetry}>다시 도전</button>
          <button style={styles.homeBtn} onClick={onHome}>홈으로</button>
        </div>
      </div>
    );
  }

  const q = questions[currentIdx];
  const progressPercent = ((currentIdx) / questions.length) * 100;

  return (
    <div style={styles.container}>
      <div style={styles.progressBar}>
        <div style={{ ...styles.progressFill, width: `${progressPercent}%` }} />
      </div>
      <div style={styles.progressText}>
        <span>{currentIdx + 1} / {questions.length}</span>
        <span>{'\uD83D\uDD25'} {state.streak}</span>
      </div>

      <div style={styles.questionArea}>
        {q.type === 1 ? (
          <div style={styles.meaningDisplay}>{q.correct.meaning} {q.correct.sound}</div>
        ) : (
          <div style={styles.hanjaDisplay}>{q.correct.char}</div>
        )}
        <div style={styles.questionText}>{QUESTION_LABELS[q.type]}</div>
      </div>

      <div style={styles.optionsContainer}>
        {q.options.map((opt, idx) => {
          let btnStyle = { ...styles.optionBtn };
          if (selected !== null) {
            if (opt === q.correct) {
              btnStyle = { ...btnStyle, ...styles.feedbackCorrect };
            } else if (idx === selected && !isCorrect) {
              btnStyle = { ...btnStyle, ...styles.feedbackWrong };
            }
          }
          return (
            <button
              key={idx}
              style={btnStyle}
              onClick={() => handleSelect(opt, idx)}
              disabled={selected !== null}
            >
              {getOptionLabel(opt, q.type)}
            </button>
          );
        })}
      </div>

      {selected !== null && !isCorrect && (
        <div style={styles.exampleBox}>
          <div style={styles.exampleLabel}>
            정답: {q.correct.char} ({q.correct.meaning} {q.correct.sound})
          </div>
          {q.correct.examples && q.correct.examples.length > 0 && (
            <div style={styles.exampleText}>
              예시: {q.correct.examples.slice(0, 2).join(', ')}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
