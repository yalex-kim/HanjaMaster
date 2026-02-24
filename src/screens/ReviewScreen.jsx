import React, { useState, useEffect, useCallback, useRef } from 'react';
import { theme } from '../styles/theme.js';
import { shuffle } from '../utils/shuffle.js';
import WritingCanvas from '../components/WritingCanvas.jsx';

// 복습 퀴즈는 최대 20문제까지
const MAX_REVIEW_COUNT = 20;

const styles = {
  container: {
    flex: 1,
    padding: '12px 16px 16px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    overflow: 'hidden',
    boxSizing: 'border-box',
  },
  progressBar: {
    flexShrink: 0,
    width: '100%',
    height: '6px',
    background: theme.colors.surface,
    borderRadius: '3px',
    marginBottom: '8px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    background: '#8b5cf6', // 복습은 보라색
    borderRadius: '3px',
    transition: 'width 0.3s ease',
  },
  progressText: {
    fontSize: '13px',
    color: theme.colors.textSecondary,
    marginBottom: '8px',
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
  },
  statsBadge: {
    flexShrink: 0,
    background: theme.colors.surface,
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '13px',
    fontWeight: 'bold',
    color: '#8b5cf6',
    marginBottom: '8px',
    border: `1px solid ${theme.colors.secondary}`,
  },
  questionArea: {
    flex: '1 1 0',
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: '8px',
    overflow: 'hidden',
  },
  hanjaDisplay: {
    fontSize: 'clamp(40px, 15vw, 72px)',
    fontFamily: theme.fonts.serif,
    color: theme.colors.text,
    marginBottom: '8px',
    textShadow: '0 2px 8px rgba(139, 92, 246, 0.3)',
    lineHeight: 1.1,
  },
  meaningDisplay: {
    fontSize: 'clamp(18px, 6vw, 28px)',
    fontFamily: theme.fonts.serif,
    color: '#8b5cf6',
    paddingTop: '20px',    // 상단 여백 충분히
    marginBottom: '12px',
  },
  questionText: {
    fontSize: 'clamp(13px, 4vw, 16px)',
    color: theme.colors.textSecondary,
    marginBottom: '8px',
    textAlign: 'center',
  },
  optionsContainer: {
    flexShrink: 0,
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
    fontSize: 'clamp(14px, 4vw, 18px)',
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
    flexShrink: 0,
    width: '100%',
    minHeight: '48px',
    padding: '10px 16px',
    borderRadius: '12px',
    fontSize: 'clamp(14px, 4vw, 18px)',
    fontWeight: 700,
    cursor: 'pointer',
    border: 'none',
    background: '#8b5cf6',
    color: 'white',
    fontFamily: theme.fonts.sans,
    textAlign: 'center',
    marginTop: '8px',
    boxShadow: '0 4px 12px rgba(139, 92, 246, 0.4)',
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
    borderLeft: `3px solid #8b5cf6`,
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
  emptyContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
    textAlign: 'center',
    padding: '24px',
  },
  emptyEmoji: {
    fontSize: '64px',
    marginBottom: '24px',
  },
  emptyTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: '12px',
  },
  emptyDesc: {
    fontSize: '16px',
    color: theme.colors.textSecondary,
    lineHeight: '1.5',
    marginBottom: '32px',
  },
  resultContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 16px',
    textAlign: 'center',
  },
  resultScore: {
    fontSize: '48px',
    fontWeight: 700,
    color: '#8b5cf6',
    fontFamily: theme.fonts.display,
    marginBottom: '8px',
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
    marginBottom: '32px',
  },
  homeBtn: {
    width: '100%',
    maxWidth: '300px',
    padding: '14px',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: 600,
    cursor: 'pointer',
    border: 'none',
    background: '#8b5cf6',
    color: 'white',
    fontFamily: theme.fonts.sans,
    minHeight: theme.sizes.touchTarget,
  },
};

const QUESTION_LABELS = [
  '이 한자의 뜻과 음은?',
  '이 뜻음에 해당하는 한자는?',
  '이 한자의 음(소리)은?',
  '이 한자를 획순대로 써보세요!', // type 3 = 획순 쓰기
];

function getOptionLabel(item, type) {
  if (type === 0) return `${item.meaning} ${item.sound}`;
  if (type === 1) return item.char;
  return item.sound;
}

export default function ReviewScreen({ hanjaPool, onHome, gameState, playSound, onCharResult, onWriteResult, charMastery }) {
  const { addXP } = gameState;
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [finished, setFinished] = useState(false);
  
  // 데이터 로딩 상태 (처음 한번만 실행)
  const [isLoaded, setIsLoaded] = useState(false);

  // 문제 생성 로직
  useEffect(() => {
    if (isLoaded) return;

    // 1a. 일반 오답 항목
    const wrongItems = hanjaPool.filter(item => {
      const stats = charMastery[item.char];
      return stats && stats.wrong > 0;
    });

    // 1b. 획순 오답 항목 (writeWrong > 0)
    const writeWrongItems = hanjaPool.filter(item => {
      const stats = charMastery[item.char];
      return stats && (stats.writeWrong || 0) > 0;
    });

    if (wrongItems.length === 0 && writeWrongItems.length === 0) {
      setQuestions([]);
      setIsLoaded(true);
      return;
    }

    // 2. 정답률 낮은 순 정렬
    wrongItems.sort((a, b) => {
      const sA = charMastery[a.char];
      const sB = charMastery[b.char];
      const rA = sA.correct / (sA.correct + sA.wrong);
      const rB = sB.correct / (sB.correct + sB.wrong);
      if (rA !== rB) return rA - rB;
      return sB.wrong - sA.wrong;
    });

    // 3. 일반 객관식 문제 (최대 15개)
    const mcItems = wrongItems.slice(0, 15);
    const mcQuestions = mcItems.map(correct => {
      const type = Math.floor(Math.random() * 3); // 0~2
      const others = hanjaPool.filter(item => item.char !== correct.char);
      const wrongAnswers = shuffle(others).slice(0, 3);
      const options = shuffle([correct, ...wrongAnswers]);
      return { correct, type, options };
    });

    // 4. 획순 쓰기 문제 (최대 5개, writeWrong 많은 순)
    writeWrongItems.sort((a, b) => {
      const wA = (charMastery[a.char].writeWrong || 0);
      const wB = (charMastery[b.char].writeWrong || 0);
      return wB - wA;
    });
    const writeItems = writeWrongItems.slice(0, 5);
    const writeQuestions = writeItems.map(correct => ({
      correct,
      type: 3, // 획순 쓰기
      options: [],
    }));

    // 5. 두 유형 합쳐서 셔플
    const allQuestions = shuffle([...mcQuestions, ...writeQuestions])
      .slice(0, MAX_REVIEW_COUNT);

    setQuestions(allQuestions);
    setIsLoaded(true);
  }, [hanjaPool, charMastery, isLoaded]);

  // 통계 텍스트 생성
  const getStatsText = (char) => {
    const stats = charMastery[char];
    if (!stats) return '';
    const total = stats.correct + stats.wrong;
    const percent = Math.round((stats.correct / total) * 100);
    return `정답률 ${percent}% (${stats.correct}/${total})`;
  };

  const handleSelect = useCallback((option, idx) => {
    if (selected !== null) return;
    const q = questions[currentIdx];
    const correct = option === q.correct;
    setSelected(idx);
    setIsCorrect(correct);

    if (correct) {
      playSound('correct');
      setTotalCorrect(prev => prev + 1);
      addXP(5); // 복습은 점수 조금 적게? (5점)
    } else {
      playSound('wrong');
    }

    // 결과 기록 (복습 퀴즈도 통계에 반영!)
    if (onCharResult) onCharResult(q.correct.char, correct);

  }, [selected, questions, currentIdx, playSound, addXP, onCharResult]);

  const handleNextQuestion = useCallback(() => {
    if (currentIdx + 1 >= questions.length) {
      setFinished(true);
    } else {
      setCurrentIdx(prev => prev + 1);
      setSelected(null);
      setIsCorrect(null);
    }
  }, [currentIdx, questions.length]);

  // 획순 쓰기 문제 완료 핸들러 (복습 화면용)
  const handleWritingComplete = useCallback((summary) => {
    const correct = !summary.failed;
    const q = questions[currentIdx];
    if (onWriteResult) onWriteResult(q.correct.char, correct);
    if (onCharResult)  onCharResult(q.correct.char, correct);
    if (correct) {
      playSound('correct');
      addXP(8);
      setTotalCorrect(prev => prev + 1);
    } else {
      playSound('wrong');
    }
    setIsCorrect(correct);
    setSelected(-1); // 완료 표시 (선택지 없는 쓰기 문제용)
  }, [questions, currentIdx, onWriteResult, onCharResult, playSound, addXP]);

  // 복습할 게 없을 때
  if (isLoaded && questions.length === 0) {
    return (
      <div style={styles.emptyContainer}>
        <div style={styles.emptyEmoji}>🎉</div>
        <div style={styles.emptyTitle}>완벽합니다!</div>
        <div style={styles.emptyDesc}>
          틀린 문제가 하나도 없어요.<br/>
          한자 퀴즈에 도전해서 실력을 뽐내보세요!
        </div>
        <button style={styles.homeBtn} onClick={onHome}>홈으로</button>
      </div>
    );
  }

  // 로딩 중
  if (!isLoaded || questions.length === 0) {
    return <div style={{...styles.container, justifyContent: 'center'}}>Loading...</div>;
  }

  // 결과 화면
  if (finished) {
    const accuracy = Math.round((totalCorrect / questions.length) * 100);
    return (
      <div style={styles.resultContainer}>
        <div style={styles.resultScore}>{totalCorrect} / {questions.length}</div>
        <div style={styles.resultTitle}>복습 완료!</div>
        <div style={styles.resultDetail}>
          정답률 {accuracy}%<br/>
          약점을 보완하셨네요! 👏
        </div>
        <button style={styles.homeBtn} onClick={onHome}>홈으로</button>
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
      </div>

      <div style={styles.statsBadge}>
        {getStatsText(q.correct.char)}
      </div>

      {/* 획순 쓰기 문제 */}
      {q.type === 3 ? (
        <>
          {/* 질문 헤더 — 고정 크기 */}
          <div style={{ flexShrink: 0, textAlign: 'center', marginBottom: '8px', width: '100%' }}>
            <div style={styles.meaningDisplay}>{q.correct.meaning} {q.correct.sound}</div>
            <div style={styles.questionText}>{QUESTION_LABELS[3]}</div>
          </div>
          {/* 캔버스 or 결과 — 남은 공간 차지 */}
          <div style={{ flex: '1 1 0', minHeight: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '20px' }}>
            {selected === null ? (
              <WritingCanvas
                char={q.correct.char}
                width={200}
                height={200}
                onComplete={handleWritingComplete}
                autoQuiz={true}
                maxAttempts={3}
              />
            ) : (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <div style={{ fontSize: 'clamp(48px, 15vw, 72px)', color: theme.colors.accent }}>{q.correct.char}</div>
                <div style={{ color: isCorrect ? theme.colors.success : theme.colors.error, marginTop: '8px', fontWeight: 700, fontSize: '18px' }}>
                  {isCorrect ? '✅ 성공!' : '❌ 실패...'}
                </div>
              </div>
            )}
          </div>
          {selected !== null && (
            <button style={styles.nextBtn} onClick={handleNextQuestion}>
              다음 문제 ▶
            </button>
          )}
        </>
      ) : (
        /* 일반 객관식 문제 */
        <>
          <div style={styles.questionArea}>
            {q.type === 1 ? (
              <div style={styles.meaningDisplay}>{q.correct.meaning} {q.correct.sound}</div>
            ) : (
              <div style={styles.hanjaDisplay}>{q.correct.char}</div>
            )}
            <div style={styles.questionText}>{QUESTION_LABELS[q.type]}</div>
          </div>

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

          {/* Manual Next Button & Feedback Box — 공간 확보 */}
          <div style={{
            width: '100%',
            flexShrink: 0,
            visibility: selected !== null ? 'visible' : 'hidden',
            opacity: selected !== null ? 1 : 0,
            transition: 'opacity 0.2s ease-in-out',
            pointerEvents: selected !== null ? 'auto' : 'none',
          }}>
            <button style={styles.nextBtn} onClick={handleNextQuestion}>
              다음 문제 ▶
            </button>

            {selected !== null && !isCorrect && (
              <div style={{ 
                ...styles.exampleBox, 
                borderLeftColor: theme.colors.error,
                minHeight: '60px'
              }}>
                <div style={styles.exampleLabel}>
                  정답: {q.correct.char} ({q.correct.meaning} {q.correct.sound})
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
        </>
      )}
    </div>
  );
}
