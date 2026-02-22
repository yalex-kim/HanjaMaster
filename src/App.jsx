import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { theme } from './styles/theme.js';
import { getHanjaUpToLevel } from './data/index.js';
import { useGameState } from './hooks/useGameState.js';
import { useSound } from './hooks/useSound.js';
import { useStorage, KEYS } from './hooks/useStorage.js';
import TopBar from './components/TopBar.jsx';
import XPBar from './components/XPBar.jsx';
import LevelUpModal from './components/LevelUpModal.jsx';
import HomeScreen from './screens/HomeScreen.jsx';
import QuizScreen from './screens/QuizScreen.jsx';
import ReviewScreen from './screens/ReviewScreen.jsx';
import ProgressScreen from './screens/ProgressScreen.jsx';
import WriteScreen from './screens/WriteScreen.jsx';

const appStyles = {
  wrapper: {
    width: '100%',
    maxWidth: theme.sizes.maxWidth,
    margin: '0 auto',
    minHeight: '100vh',
    background: theme.colors.background,
    position: 'relative',
    overflow: 'hidden',
  },
};

function App() {
  const storage = useStorage();
  const savedState = storage.get(KEYS.USER_PROGRESS);
  const gameState = useGameState(savedState);
  const { playSound } = useSound();
  const { state, closeLevelUp } = gameState;

  const [screen, setScreen] = useState('home');
  const savedTarget = storage.get(KEYS.SETTINGS);
  const [targetLevel, setTargetLevel] = useState(
    (savedTarget && savedTarget.targetLevel) || '6급'
  );
  const [charMastery, setCharMastery] = useState(
    () => storage.get(KEYS.CHAR_MASTERY) || {}
  );

  useEffect(() => {
    storage.set(KEYS.USER_PROGRESS, {
      xp: state.xp,
      level: state.level,
      streak: state.streak,
      bestStreak: state.bestStreak,
      hearts: state.hearts,
      totalStudied: state.totalStudied,
      totalCorrect: state.totalCorrect,
      totalWrong: state.totalWrong,
      todayStudied: state.todayStudied,
      todayCorrect: state.todayCorrect,
    });
  }, [state, storage]);

  useEffect(() => {
    storage.set(KEYS.CHAR_MASTERY, charMastery);
  }, [charMastery, storage]);

  useEffect(() => {
    storage.set(KEYS.SETTINGS, { targetLevel });
  }, [targetLevel, storage]);

  useEffect(() => {
    if (state.showLevelUp) {
      playSound('levelup');
    }
  }, [state.showLevelUp, playSound]);

  const goHome = useCallback(() => {
    playSound('click');
    setScreen('home');
  }, [playSound]);

  const handleSelectMode = useCallback((mode) => {
    playSound('click');
    setScreen(mode);
  }, [playSound]);

  const handleSelectTargetLevel = useCallback((level) => {
    playSound('click');
    setTargetLevel(level);
  }, [playSound]);

  const handleCharResult = useCallback((char, correct) => {
    setCharMastery((prev) => {
      const existing = prev[char] || { correct: 0, wrong: 0 };
      return {
        ...prev,
        [char]: {
          correct: existing.correct + (correct ? 1 : 0),
          wrong: existing.wrong + (correct ? 0 : 1),
        },
      };
    });
  }, []);

  const targetPool = useMemo(() => getHanjaUpToLevel(targetLevel), [targetLevel]);
  const requiredXP = state.level * 100;

  const renderScreen = () => {
    const sharedProps = {
      hanjaPool: targetPool,
      onHome: goHome,
      gameState,
      playSound,
      onCharResult: handleCharResult,
      charMastery, // 복습 모드 등에서 통계 활용
    };

    switch (screen) {
      case 'quiz':
        return <QuizScreen {...sharedProps} />;
      case 'write':
        return <WriteScreen {...sharedProps} />;
      case 'review':
        return <ReviewScreen {...sharedProps} />;
      case 'progress':
        return <ProgressScreen targetPool={targetPool} charMastery={charMastery} />;
      default:
        return (
          <HomeScreen
            targetLevel={targetLevel}
            onSelectTargetLevel={handleSelectTargetLevel}
            onSelectMode={handleSelectMode}
            stats={state}
          />
        );
    }
  };

  return (
    <div style={appStyles.wrapper}>
      {screen !== 'home' && (
        <TopBar
          level={state.level}
          streak={state.streak}
          hearts={state.hearts}
          onHome={goHome}
        />
      )}
      {screen !== 'home' && (
        <XPBar currentXP={state.xp} requiredXP={requiredXP} />
      )}
      {renderScreen()}
      {state.showLevelUp && (
        <LevelUpModal level={state.level} onClose={closeLevelUp} />
      )}
    </div>
  );
}

export default App;
