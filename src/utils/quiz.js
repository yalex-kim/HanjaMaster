import { shuffle } from './shuffle.js';

/**
 * Generate quiz questions from a pool of HanjaChar objects.
 * @param {Array} pool - Array of HanjaChar objects
 * @param {number} count - Number of questions to generate (default 10)
 * @returns {Array} Array of { correct, type, options }
 *   type: 0 = 한자→뜻음, 1 = 뜻음→한자, 2 = 한자→음
 */
export function generateQuiz(pool, count = 10) {
  if (pool.length < 4) return [];

  const selected = shuffle(pool).slice(0, Math.min(count, pool.length));

  return selected.map((correct) => {
    const type = Math.floor(Math.random() * 3);

    // Pick 3 wrong answers from pool (excluding the correct one)
    const others = pool.filter((item) => item !== correct);
    const wrongAnswers = shuffle(others).slice(0, 3);

    // Combine correct + wrong, then shuffle
    const options = shuffle([correct, ...wrongAnswers]);

    return { correct, type, options };
  });
}
