import React, { useState, useEffect, useCallback, useRef } from 'react';
import { theme } from '../styles/theme.js';
import { generateQuiz } from '../utils/quiz.js';

const styles = {
  container: {
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minHeight: '100vh',
    background: '#1a1a2e',
    overflowX: 'hidden',   // 가로 스크롤만 차단
    overflowY: 'auto',     // 선택지 잘림 방지: 세로 스크롤 허용
    position: 'relative',
  },
  header: {
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    zIndex: 10,
  },
  hpBarContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    width: '45%',
  },
  hpLabel: {
    fontSize: '24px',
  },
  hpBar: {
    flex: 1,
    height: '12px',
    background: '#333',
    borderRadius: '6px',
    overflow: 'hidden',
    border: '2px solid #555',
  },
  hpFill: (percent, color) => ({
    width: `${Math.max(0, percent)}%`,
    height: '100%',
    background: color,
    transition: 'width 0.3s ease',
  }),
  battleField: {
    flex: 1,
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative',
    marginBottom: '20px',
  },
  monsterArea: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    animation: 'float 3s ease-in-out infinite',
  },
  monsterEmoji: {
    fontSize: '120px',
    filter: 'drop-shadow(0 0 20px rgba(255,0,0,0.5))',
    transition: 'transform 0.1s',
  },
  monsterName: {
    color: '#ff4d4d',
    fontSize: '20px',
    fontWeight: 'bold',
    marginTop: '10px',
    textShadow: '0 0 10px black',
  },
  damageText: {
    position: 'absolute',
    color: '#ffeb3b',
    fontSize: '48px',
    fontWeight: 'bold',
    textShadow: '2px 2px 0 #000',
    animation: 'popAndFade 1s forwards',
    pointerEvents: 'none',
  },
  playerArea: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  playerEmoji: {
    fontSize: '80px',
    transition: 'transform 0.1s',
  },
  quizArea: {
    width: '100%',
    background: 'rgba(0,0,0,0.8)',
    borderRadius: '16px',
    padding: '16px',
    border: `2px solid ${theme.colors.secondary}`,
  },
  questionText: {
    fontSize: '24px',
    color: 'white',
    textAlign: 'center',
    marginBottom: '16px',
    fontWeight: 'bold',
  },
  optionsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '8px',
  },
  optionBtn: {
    padding: '16px',
    fontSize: '18px',
    borderRadius: '8px',
    border: 'none',
    background: theme.colors.surface,
    color: 'white',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'background 0.1s',
  },
  stageInfo: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    fontSize: '80px',
    fontWeight: 'bold',
    color: 'white',
    textShadow: '0 0 20px rgba(0,0,0,0.8)',
    zIndex: 100,
    animation: 'zoomIn 0.5s ease-out',
    pointerEvents: 'none',
  },
  resultOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.9)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 200,
  },
  resultTitle: {
    fontSize: '48px',
    color: '#ffd700',
    marginBottom: '20px',
    fontWeight: 'bold',
  },
  resultScore: {
    fontSize: '24px',
    color: 'white',
    marginBottom: '40px',
  },
  homeBtn: {
    padding: '16px 32px',
    fontSize: '20px',
    borderRadius: '12px',
    border: 'none',
    background: theme.colors.primary,
    color: 'white',
    cursor: 'pointer',
    fontWeight: 'bold',
  }
};

const MONSTERS = [
  { name: '먹물 슬라임', emoji: '⚫️', hp: 30, power: 5 },
  { name: '한자 박쥐', emoji: '🦇', hp: 50, power: 8 },
  { name: '독서 유령', emoji: '👻', hp: 80, power: 10 },
  { name: '강철 골렘', emoji: '🤖', hp: 120, power: 15 },
  { name: '마왕 드래곤', emoji: '🐲', hp: 200, power: 20 },
];

export default function BattleScreen({ hanjaPool, onHome, playSound }) {
  const [stage, setStage] = useState(0);
  const [playerHP, setPlayerHP] = useState(100);
  const [monsterHP, setMonsterHP] = useState(30);
  const [maxMonsterHP, setMaxMonsterHP] = useState(30);
  const [question, setQuestion] = useState(null);
  const [damageEffect, setDamageEffect] = useState(null); // { value, target: 'monster' | 'player', x, y }
  const [shake, setShake] = useState(null); // 'monster' | 'player'
  const [gameState, setGameState] = useState('playing'); // playing, win, lose, stageClear
  const [combo, setCombo] = useState(0);

  // 문제 생성
  const generateQuestion = useCallback(() => {
    const q = generateQuiz(hanjaPool, 1)[0];
    setQuestion(q);
  }, [hanjaPool]);

  // 스테이지 초기화
  useEffect(() => {
    if (stage < MONSTERS.length) {
      const monster = MONSTERS[stage];
      setMaxMonsterHP(monster.hp);
      setMonsterHP(monster.hp);
      setGameState('playing');
      generateQuestion();
    } else {
      setGameState('win'); // All clear
    }
  }, [stage, generateQuestion]);

  // 공격 처리
  const handleAttack = useCallback((idx) => {
    if (gameState !== 'playing' || !question) return;

    const isCorrect = question.options[idx] === question.correct;
    const monster = MONSTERS[stage];

    if (isCorrect) {
      // 플레이어 공격
      playSound('correct');
      const baseDamage = 10;
      const comboBonus = combo * 2;
      const totalDamage = baseDamage + comboBonus;
      
      setMonsterHP(prev => Math.max(0, prev - totalDamage));
      setDamageEffect({ value: totalDamage, target: 'monster' });
      setShake('monster');
      setCombo(prev => prev + 1);

      // 몬스터 사망 체크
      if (monsterHP - totalDamage <= 0) {
        setTimeout(() => {
          playSound('levelup');
          setStage(prev => prev + 1);
          setGameState('stageClear'); // 잠시 대기 후 다음 스테이지
        }, 500);
      } else {
        setTimeout(generateQuestion, 500);
      }
    } else {
      // 몬스터 반격
      playSound('wrong');
      const damage = monster.power;
      
      setPlayerHP(prev => Math.max(0, prev - damage));
      setDamageEffect({ value: damage, target: 'player' });
      setShake('player');
      setCombo(0);

      // 플레이어 사망 체크
      if (playerHP - damage <= 0) {
        setGameState('lose');
      } else {
        setTimeout(generateQuestion, 500);
      }
    }

    // 이펙트 초기화
    setTimeout(() => {
      setDamageEffect(null);
      setShake(null);
    }, 500);

  }, [gameState, question, stage, monsterHP, playerHP, combo, playSound, generateQuestion]);

  // 렌더링
  if (gameState === 'win') {
    return (
      <div style={styles.resultOverlay}>
        <div style={styles.resultTitle}>🎉 전설의 마법사! 🎉</div>
        <div style={styles.resultScore}>모든 요괴를 봉인했습니다!</div>
        <button style={styles.homeBtn} onClick={onHome}>마을로 귀환</button>
      </div>
    );
  }

  if (gameState === 'lose') {
    return (
      <div style={styles.resultOverlay}>
        <div style={{...styles.resultTitle, color: '#ff4d4d'}}>💀 패배...</div>
        <div style={styles.resultScore}>{MONSTERS[stage].name}에게 당했습니다.</div>
        <button style={styles.homeBtn} onClick={onHome}>다시 도전</button>
      </div>
    );
  }

  const currentMonster = MONSTERS[stage] || MONSTERS[0];

  return (
    <div style={styles.container}>
      {/* Header (HP Bars) */}
      <div style={styles.header}>
        <div style={styles.hpBarContainer}>
          <span style={styles.hpLabel}>{currentMonster.emoji}</span>
          <div style={styles.hpBar}>
            <div style={styles.hpFill((monsterHP / maxMonsterHP) * 100, '#ff4d4d')} />
          </div>
        </div>
        <div style={{color: 'white', fontWeight: 'bold'}}>VS</div>
        <div style={{...styles.hpBarContainer, flexDirection: 'row-reverse'}}>
          <span style={styles.hpLabel}>🧙‍♂️</span>
          <div style={styles.hpBar}>
            <div style={styles.hpFill((playerHP / 100) * 100, '#4ade80')} />
          </div>
        </div>
      </div>

      {/* Battle Field */}
      <div style={styles.battleField}>
        {/* Monster */}
        <div style={{
          ...styles.monsterArea,
          transform: shake === 'monster' ? 'translateX(10px)' : 'none'
        }}>
          <div style={styles.monsterEmoji}>{currentMonster.emoji}</div>
          <div style={styles.monsterName}>{currentMonster.name}</div>
          {damageEffect?.target === 'monster' && (
            <div style={{...styles.damageText, top: '0', right: '-20px'}}>-{damageEffect.value}</div>
          )}
        </div>

        {/* Combo */}
        {combo > 1 && (
          <div style={{
            color: '#ffd700', fontSize: '24px', fontWeight: 'bold',
            textShadow: '0 0 10px orange', marginBottom: '10px'
          }}>
            {combo} COMBO! 🔥
          </div>
        )}

        {/* Player */}
        <div style={{
          ...styles.playerArea,
          transform: shake === 'player' ? 'translateX(-10px)' : 'none'
        }}>
          <div style={styles.playerEmoji}>🧙‍♂️</div>
          {damageEffect?.target === 'player' && (
            <div style={{...styles.damageText, top: '0', left: '-20px', color: '#ff4d4d'}}>-{damageEffect.value}</div>
          )}
        </div>
      </div>

      {/* Quiz Area */}
      {question && (
        <div style={styles.quizArea}>
          <div style={styles.questionText}>
            {question.type === 1 
              ? `${question.correct.meaning} ${question.correct.sound}`
              : question.correct.char}
            {question.type === 0 ? ' (뜻과 음)' : question.type === 2 ? ' (음)' : ''}
          </div>
          <div style={styles.optionsGrid}>
            {question.options.map((opt, idx) => (
              <button
                key={idx}
                style={styles.optionBtn}
                onClick={() => handleAttack(idx)}
              >
                {question.type === 0 
                  ? `${opt.meaning} ${opt.sound}` 
                  : (question.type === 1 ? opt.char : opt.sound)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Animations CSS */}
      <style>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
          100% { transform: translateY(0px); }
        }
        @keyframes popAndFade {
          0% { transform: scale(0.5); opacity: 0; }
          50% { transform: scale(1.5); opacity: 1; }
          100% { transform: scale(1); opacity: 0; top: -50px; }
        }
        @keyframes zoomIn {
          from { transform: translate(-50%, -50%) scale(0); }
          to { transform: translate(-50%, -50%) scale(1); }
        }
      `}</style>
    </div>
  );
}
