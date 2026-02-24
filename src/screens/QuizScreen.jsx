import React, { useState, useEffect, useCallback, useRef } from 'react';
import { theme } from '../styles/theme.js';
import { generateQuiz } from '../utils/quiz.js';
import WritingCanvas from '../components/WritingCanvas.jsx';

const styles = {
  container: {
    flex: 1,               // 부모가 준 공간을 꽉 채움 (minHeight 제거)
    padding: '12px 16px 16px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    overflow: 'hidden',    // 스크롤 없이 내부에서 fit
    boxSizing: 'border-box',
  },
  progressBar: {
    flexShrink: 0,         // 고정 크기
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
    flexShrink: 0,         // 가변 크기 대신 고정/컨텐츠 크기 사용
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingTop: '20px',    // 상단바와의 간격 충분히 확보
    marginBottom: '12px',
    overflow: 'visible',   // 잘림 방지
  },
  hanjaDisplay: {
    fontSize: 'clamp(40px, 15vw, 72px)',  // 화면 크기에 따라 자동 축소
    fontFamily: theme.fonts.serif,
    color: theme.colors.text,
    marginBottom: '8px',
    textShadow: '0 2px 8px rgba(233,69,96,0.3)',
    lineHeight: 1.1,
  },
  meaningDisplay: {
    fontSize: 'clamp(18px, 6vw, 28px)',   // 화면 크기에 따라 자동 축소
    fontFamily: theme.fonts.serif,
    color: theme.colors.accent,
    marginBottom: '8px',
  },
  questionText: {
    fontSize: 'clamp(13px, 4vw, 16px)',
    color: theme.colors.textSecondary,
    marginBottom: '8px',
    textAlign: 'center',
  },
  optionsContainer: {
    flexShrink: 0,         // 선택지 영역은 줄어들지 않음 (항상 표시)
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  optionBtn: {
    width: '100%',
    minHeight: '48px',
    padding: '10px 16px',
    borderRadius: '12px',
    fontSize: 'clamp(14px, 4vw, 18px)',   // 화면 비율에 맞게 축소
    fontWeight: 600,
    cursor: 'pointer',
    border: `2px solid ${theme.colors.secondary}`,
    background: theme.colors.surface,
    color: theme.colors.text,
    fontFamily: theme.fonts.sans,
    textAlign: 'center',
    transition: 'all 0.2s',
  },
  nextBtn: {
    flexShrink: 0,         // 다음 버튼도 고정 크기 유지
    width: '100%',
    minHeight: '48px',
    padding: '12px 16px',
    borderRadius: '12px',
    fontSize: 'clamp(14px, 4vw, 18px)',
    fontWeight: 700,
    cursor: 'pointer',
    border: 'none',
    background: theme.colors.primary,
    color: theme.colors.text,
    fontFamily: theme.fonts.sans,
    textAlign: 'center',
    marginTop: '8px',
    boxShadow: '0 4px 12px rgba(233, 69, 96, 0.4)',
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
  '다음 한자를 바르게 써보세요!',
];

function getOptionLabel(item, type) {
  if (type === 0) return `${item.meaning} ${item.sound}`;
  if (type === 1) return item.char;
  return item.sound;
}

export default function QuizScreen({ hanjaPool, onHome, gameState, playSound, onCharResult, onWriteResult }) {
  const { state, addXP, loseHeart, incrementStreak, resetStreak, addStudyResult } = gameState;
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState(null); // Selected option index (or dummy for writing)
  const [isCorrect, setIsCorrect] = useState(null);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [earnedXP, setEarnedXP] = useState(0);
  const [finished, setFinished] = useState(false);

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

  // Handle User Answer
  const handleSelect = useCallback((option, idx) => {
    if (selected !== null) return; // Prevent multiple selections
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
    if (onCharResult) onCharResult(q.correct.char, correct);
    
    // Auto-advance removed based on user request.
    // User must click "Next" button.
  }, [selected, questions, currentIdx, playSound, incrementStreak, resetStreak, addXP, loseHeart, addStudyResult, state.streak, onCharResult]);

  // Handle Writing Completion — summary: { failed: bool, attempts: n }
  const handleWritingComplete = useCallback((summary) => {
    const correct = !summary.failed;
    const q = questions[currentIdx];
    // 획순 전용 오답 기록
    if (onWriteResult) onWriteResult(q.correct.char, correct);
    // 일반 결과도 반영 (XP, 하트 등)
    handleSelect(correct ? q.correct : null, -1);
  }, [handleSelect, questions, currentIdx, onWriteResult]);

  const handleNextQuestion = useCallback(() => {
    if (currentIdx + 1 >= questions.length) {
      setFinished(true);
    } else {
      setCurrentIdx((prev) => prev + 1);
      setSelected(null);
      setIsCorrect(null);
    }
  }, [currentIdx, questions.length]);

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
  const isWritingQuestion = q.type === 3;

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
        {isWritingQuestion ? (
           // Writing Question: Show Meaning+Sound, user writes Hanja
           <div style={styles.meaningDisplay}>{q.correct.meaning} {q.correct.sound}</div>
        ) : q.type === 1 ? (
          // Meaning/Sound Question: Show Hanja, pick Meaning/Sound
          <div style={styles.meaningDisplay}>{q.correct.meaning} {q.correct.sound}</div>
        ) : (
          // Hanja/Sound Question: Show Hanja, pick something else
          <div style={styles.hanjaDisplay}>{q.correct.char}</div>
        )}
        <div style={styles.questionText}>{QUESTION_LABELS[q.type]}</div>
      </div>

      {/* Answer Area */}
      {isWritingQuestion ? (
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
          {selected === null ? (
            <WritingCanvas
              char={q.correct.char}
              width={260}           // QuizScreen은 공간이 좀 더 있으므로 약간 조정
              height={260}
              onComplete={handleWritingComplete}
              autoQuiz={true}
              maxAttempts={3}
            />
          ) : (
            // Writing Finished State
            <div style={{ textAlign: 'center', padding: '20px' }}>
               <div style={{ fontSize: '64px', color: theme.colors.accent }}>{q.correct.char}</div>
               <div style={{ color: theme.colors.success, marginTop: '10px' }}>쓰기 성공!</div>
            </div>
          )}
        </div>
      ) : (
        // Multiple Choice Options — key={currentIdx} 로 문제 바뀔 때 버튼 완전 리마운트
        <div key={currentIdx} style={styles.optionsContainer}>
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
      )}

      {/* Manual Next Button & Feedback Box — 공간 확보를 위해 항상 렌더링하고 투명도로 조절 */}
      <div style={{
        width: '100%',
        flexShrink: 0,
        visibility: selected !== null ? 'visible' : 'hidden',
        opacity: selected !== null ? 1 : 0,
        transition: 'opacity 0.2s ease-in-out',
        pointerEvents: selected !== null ? 'auto' : 'none',
      }}>
        {/* Manual Next Button */}
        <button style={styles.nextBtn} onClick={handleNextQuestion}>
          다음 문제 ▶
        </button>

        {/* Feedback / Example Box */}
        {!isWritingQuestion && (
          <div style={{ 
            ...styles.exampleBox, 
            borderLeftColor: isCorrect ? theme.colors.success : theme.colors.accent,
            minHeight: '60px' // 피드백 박스 높이 고정 (내용에 따라 변동 최소화)
          }}>
            <div style={styles.exampleLabel}>
              {isCorrect ? '정답!' : '오답 노트'} : {q.correct.char} ({q.correct.meaning} {q.correct.sound})
            </div>
            {q.correct.examples && q.correct.examples.length > 0 ? (
              <div style={styles.exampleText}>
                예시: {q.correct.examples.slice(0, 2).join(', ')}
              </div>
            ) : (
              <div style={{ ...styles.exampleText, opacity: 0 }}>placeholder</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
