import React, { useState, useCallback, useEffect } from 'react';
import { theme } from './styles/theme.js';
import { hanjaData, getAllHanja, getHanjaByLevels } from './data/index.js';
import { useGameState } from './hooks/useGameState.js';
import { useSound } from './hooks/useSound.js';
import { useStorage, KEYS } from './hooks/useStorage.js';
import TopBar from './components/TopBar.jsx';
import XPBar from './components/XPBar.jsx';
import LevelUpModal from './components/LevelUpModal.jsx';
import HomeScreen from './screens/HomeScreen.jsx';
import QuizScreen from './screens/QuizScreen.jsx';
import MatchScreen from './screens/MatchScreen.jsx';
import WriteScreen from './screens/WriteScreen.jsx';
import ReviewScreen from './screens/ReviewScreen.jsx';

const appStyles = {
  wrapper: {
    maxWidth: theme.sizes.maxWidth,
    margin: '0 auto',
    minHeight: '100vh',
    background: theme.colors.background,
    position: 'relative',
    overflow: 'hidden',
  },
};

function getPool(selectedLevel) {
  if (selectedLevel === '\uC804\uCCB4') {
    return getAllHanja();
  }
  return getHanjaByLevels([selectedLevel]);
}

function App() {
  const storage = useStorage();
  const savedState = storage.get(KEYS.USER_PROGRESS);
  const gameState = useGameState(savedState);
  const { playSound, soundEnabled, toggleSound } = useSound();
  const { state, closeLevelUp } = gameState;

  const [screen, setScreen] = useState('home');
  const [selectedLevel, setSelectedLevel] = useState('8\uAE09');

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

  const handleSelectLevel = useCallback((level) => {
    playSound('click');
    setSelectedLevel(level);
  }, [playSound]);

  const hanjaPool = getPool(selectedLevel);
  const requiredXP = state.level * 100;

  const renderScreen = () => {
    const sharedProps = {
      hanjaPool,
      onHome: goHome,
      gameState,
      playSound,
    };

    switch (screen) {
      case 'quiz':
        return <QuizScreen {...sharedProps} />;
      case 'match':
        return <MatchScreen {...sharedProps} />;
      case 'write':
        return <WriteScreen {...sharedProps} />;
      case 'review':
        return <ReviewScreen {...sharedProps} />;
      default:
        return (
          <HomeScreen
            selectedLevel={selectedLevel}
            onSelectLevel={handleSelectLevel}
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
