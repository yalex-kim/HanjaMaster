import React from 'react';
import { theme } from '../styles/theme.js';
import { LEVEL_ORDER } from '../data/index.js';

const MODES = [
  { id: 'quiz', label: '한자 퀴즈', icon: '\uD83D\uDCDD', gradient: 'linear-gradient(135deg, #e94560, #c62a42)' },
  { id: 'write', label: '쓰기 연습', icon: '✍️', gradient: 'linear-gradient(135deg, #FF9966, #FF5E62)' },
  { id: 'battle', label: 'RPG 배틀', icon: '⚔️', gradient: 'linear-gradient(135deg, #4ade80, #22c55e)' },
  { id: 'review', label: '복습 퀴즈', icon: '\uD83D\uDD04', gradient: 'linear-gradient(135deg, #533483, #3d2561)' },
  { id: 'progress', label: '학습 현황', icon: '\uD83D\uDCCA', gradient: 'linear-gradient(135deg, #0f3460, #0a2647)' },
];

const styles = {
  container: {
    flex: 1,
    padding: '24px 16px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    overflowY: 'auto',       // 홈은 스크롤 허용 (콘텐츠가 길 수 있음)
    overflowX: 'hidden',
    boxSizing: 'border-box',
  },
  title: {
    fontFamily: theme.fonts.display,
    fontSize: 'clamp(26px, 8vw, 36px)',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: '4px',
    marginTop: '12px',
  },
  subtitle: {
    fontSize: '13px',
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: '16px',
  },
  sectionLabel: {
    fontSize: '14px',
    fontWeight: 600,
    color: theme.colors.textSecondary,
    alignSelf: 'flex-start',
    marginBottom: '10px',
    width: '100%',
  },
  levelRow: {
    display: 'flex',
    gap: '8px',
    overflowX: 'auto',
    width: '100%',
    paddingBottom: '4px',
    marginBottom: '14px',
    WebkitOverflowScrolling: 'touch',
    flexShrink: 0,
  },
  levelBtn: {
    flex: '0 0 auto',
    padding: '10px 18px',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    border: 'none',
    fontFamily: theme.fonts.sans,
    color: theme.colors.text,
    whiteSpace: 'nowrap',
    minHeight: theme.sizes.touchTarget,
    transition: 'background 0.2s, transform 0.15s',
  },
  modeGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px',
    width: '100%',
    marginBottom: '14px',
    flexShrink: 0,
  },
  modeCardWide: {
    gridColumn: '1 / -1',
  },
  modeCard: {
    borderRadius: '16px',
    padding: 'clamp(12px, 4vw, 24px) 12px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    border: 'none',
    minHeight: 'clamp(88px, 22vw, 120px)',
    boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
    transition: 'transform 0.15s',
    fontFamily: theme.fonts.sans,
  },
  modeIcon: {
    fontSize: 'clamp(24px, 7vw, 36px)',
    marginBottom: '6px',
  },
  modeLabel: {
    fontSize: 'clamp(12px, 3.5vw, 15px)',
    fontWeight: 700,
    color: theme.colors.text,
  },
  statsCard: {
    width: '100%',
    background: theme.colors.surface,
    borderRadius: '16px',
    padding: '20px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
  },
  statsTitle: {
    fontSize: '15px',
    fontWeight: 700,
    color: theme.colors.text,
    marginBottom: '16px',
  },
  statsRow: {
    display: 'flex',
    justifyContent: 'space-around',
  },
  statItem: {
    textAlign: 'center',
  },
  statValue: {
    fontSize: '24px',
    fontWeight: 700,
    color: theme.colors.accent,
    fontFamily: theme.fonts.display,
  },
  statLabel: {
    fontSize: '12px',
    color: theme.colors.textSecondary,
    marginTop: '4px',
  },
};

export default function HomeScreen({ targetLevel, onSelectTargetLevel, onSelectMode, stats }) {
  const { todayStudied = 0, todayCorrect = 0, bestStreak = 0 } = stats || {};
  const accuracy = todayStudied > 0 ? Math.round((todayCorrect / todayStudied) * 100) : 0;

  return (
    <div style={styles.container}>
      <div style={styles.title}>{'\uD55C\uC790 \uB9C8\uC2A4\uD130 \uD83D\uDC09'}</div>
      <div style={styles.subtitle}>급수별 한자를 재미있게 학습하세요</div>

      <div style={styles.sectionLabel}>목표 급수</div>
      <div style={styles.levelRow}>
        {LEVEL_ORDER.map((lv) => (
          <button
            key={lv}
            style={{
              ...styles.levelBtn,
              background: targetLevel === lv ? theme.colors.accent : theme.colors.surface,
              color: targetLevel === lv ? '#0a0a1a' : theme.colors.text,
            }}
            onClick={() => onSelectTargetLevel(lv)}
          >
            {lv}
          </button>
        ))}
      </div>

      <div style={styles.sectionLabel}>학습 모드</div>
      <div style={styles.modeGrid}>
        {MODES.map((mode, idx) => (
          <button
            key={mode.id}
            style={{
              ...styles.modeCard,
              background: mode.gradient,
              ...(idx === MODES.length - 1 && MODES.length % 2 !== 0 ? styles.modeCardWide : {}),
            }}
            onClick={() => onSelectMode(mode.id)}
          >
            <span style={styles.modeIcon}>{mode.icon}</span>
            <span style={styles.modeLabel}>{mode.label}</span>
          </button>
        ))}
      </div>

      <div style={styles.statsCard}>
        <div style={styles.statsTitle}>{'\uC624\uB298\uC758 \uD559\uC2B5'}</div>
        <div style={styles.statsRow}>
          <div style={styles.statItem}>
            <div style={styles.statValue}>{todayStudied}</div>
            <div style={styles.statLabel}>학습 수</div>
          </div>
          <div style={styles.statItem}>
            <div style={styles.statValue}>{accuracy}%</div>
            <div style={styles.statLabel}>정답률</div>
          </div>
          <div style={styles.statItem}>
            <div style={styles.statValue}>{bestStreak}</div>
            <div style={styles.statLabel}>최고 스트릭</div>
          </div>
        </div>
      </div>
    </div>
  );
}
