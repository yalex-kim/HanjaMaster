import { useReducer, useCallback } from 'react';

const initialState = {
  xp: 0,
  level: 1,
  streak: 0,
  bestStreak: 0,
  hearts: 5,
  totalStudied: 0,
  totalCorrect: 0,
  totalWrong: 0,
  todayStudied: 0,
  todayCorrect: 0,
  showLevelUp: false,
};

function gameReducer(state, action) {
  switch (action.type) {
    case 'ADD_XP': {
      const newXP = state.xp + action.amount;
      const requiredXP = state.level * 100;
      if (newXP >= requiredXP) {
        return {
          ...state,
          xp: newXP - requiredXP,
          level: state.level + 1,
          showLevelUp: true,
        };
      }
      return { ...state, xp: newXP };
    }
    case 'LOSE_HEART':
      return { ...state, hearts: Math.max(0, state.hearts - 1) };
    case 'RESET_HEARTS':
      return { ...state, hearts: 5 };
    case 'INCREMENT_STREAK': {
      const newStreak = state.streak + 1;
      return {
        ...state,
        streak: newStreak,
        bestStreak: Math.max(newStreak, state.bestStreak),
      };
    }
    case 'RESET_STREAK':
      return { ...state, streak: 0 };
    case 'ADD_STUDY_RESULT': {
      const isCorrect = action.correct;
      return {
        ...state,
        totalStudied: state.totalStudied + 1,
        todayStudied: state.todayStudied + 1,
        totalCorrect: state.totalCorrect + (isCorrect ? 1 : 0),
        totalWrong: state.totalWrong + (isCorrect ? 0 : 1),
        todayCorrect: state.todayCorrect + (isCorrect ? 1 : 0),
      };
    }
    case 'CLOSE_LEVEL_UP':
      return { ...state, showLevelUp: false };
    case 'LOAD_STATE':
      return { ...state, ...action.payload, showLevelUp: false };
    default:
      return state;
  }
}

export function useGameState(savedState) {
  const [state, dispatch] = useReducer(
    gameReducer,
    savedState ? { ...initialState, ...savedState, showLevelUp: false } : initialState
  );

  const addXP = useCallback((amount) => {
    dispatch({ type: 'ADD_XP', amount });
  }, []);

  const loseHeart = useCallback(() => {
    dispatch({ type: 'LOSE_HEART' });
  }, []);

  const resetHearts = useCallback(() => {
    dispatch({ type: 'RESET_HEARTS' });
  }, []);

  const incrementStreak = useCallback(() => {
    dispatch({ type: 'INCREMENT_STREAK' });
  }, []);

  const resetStreak = useCallback(() => {
    dispatch({ type: 'RESET_STREAK' });
  }, []);

  const addStudyResult = useCallback((correct) => {
    dispatch({ type: 'ADD_STUDY_RESULT', correct });
  }, []);

  const closeLevelUp = useCallback(() => {
    dispatch({ type: 'CLOSE_LEVEL_UP' });
  }, []);

  const loadState = useCallback((payload) => {
    dispatch({ type: 'LOAD_STATE', payload });
  }, []);

  return {
    state,
    addXP,
    loseHeart,
    resetHearts,
    incrementStreak,
    resetStreak,
    addStudyResult,
    closeLevelUp,
    loadState,
  };
}
