import React from 'react';
import { theme } from '../styles/theme.js';

const styles = {
  container: {
    padding: '24px 16px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minHeight: 'calc(100vh - 64px)',
  },
  title: {
    fontSize: '22px',
    fontWeight: 700,
    fontFamily: theme.fonts.display,
    color: theme.colors.text,
    marginBottom: '24px',
  },
  card: {
    width: '100%',
    background: theme.colors.surface,
    borderRadius: '16px',
    padding: '24px 20px',
    marginBottom: '16px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
  },
  cardLabel: {
    fontSize: '14px',
    color: theme.colors.textSecondary,
    marginBottom: '12px',
  },
  fractionRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '8px',
    marginBottom: '12px',
  },
  fractionBig: {
    fontSize: '36px',
    fontWeight: 700,
    fontFamily: theme.fonts.display,
    color: theme.colors.accent,
  },
  fractionSmall: {
    fontSize: '20px',
    fontWeight: 600,
    color: theme.colors.textSecondary,
  },
  progressBarOuter: {
    width: '100%',
    height: '14px',
    background: theme.colors.secondary,
    borderRadius: '7px',
    overflow: 'hidden',
  },
  progressBarInner: {
    height: '100%',
    background: `linear-gradient(90deg, ${theme.colors.accent}, #ffed4a)`,
    borderRadius: '7px',
    transition: 'width 0.5s ease-out',
  },
  percentText: {
    fontSize: '14px',
    color: theme.colors.textSecondary,
    marginTop: '8px',
    textAlign: 'right',
  },
  accuracyValue: {
    fontSize: '48px',
    fontWeight: 700,
    fontFamily: theme.fonts.display,
    color: theme.colors.success,
    textAlign: 'center',
  },
  accuracyNote: {
    fontSize: '13px',
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: '4px',
  },
  emptyText: {
    fontSize: '15px',
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: '8px',
  },
};

export default function ProgressScreen({ targetPool, charMastery }) {
  const totalChars = targetPool.length;
  const studiedChars = targetPool.filter(h => charMastery[h.char]).length;
  const percent = totalChars > 0 ? Math.round((studiedChars / totalChars) * 100) : 0;

  let totalCorrect = 0;
  let totalWrong = 0;
  targetPool.forEach(h => {
    const m = charMastery[h.char];
    if (m) {
      totalCorrect += m.correct || 0;
      totalWrong += m.wrong || 0;
    }
  });
  const totalAttempts = totalCorrect + totalWrong;
  const accuracy = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;

  return (
    <div style={styles.container}>
      <div style={styles.title}>학습 현황</div>

      <div style={styles.card}>
        <div style={styles.cardLabel}>학습한 한자</div>
        <div style={styles.fractionRow}>
          <span style={styles.fractionBig}>{studiedChars}</span>
          <span style={styles.fractionSmall}>/ {totalChars}</span>
        </div>
        <div style={styles.progressBarOuter}>
          <div style={{ ...styles.progressBarInner, width: `${percent}%` }} />
        </div>
        <div style={styles.percentText}>{percent}%</div>
      </div>

      <div style={styles.card}>
        <div style={styles.cardLabel}>전체 정답률</div>
        {totalAttempts > 0 ? (
          <>
            <div style={styles.accuracyValue}>{accuracy}%</div>
            <div style={styles.accuracyNote}>
              {totalCorrect}개 정답 / {totalAttempts}개 문제
            </div>
          </>
        ) : (
          <div style={styles.emptyText}>아직 학습 기록이 없습니다</div>
        )}
      </div>
    </div>
  );
}
