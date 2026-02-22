import { shuffle } from './shuffle.js';

/**
 * Generate quiz questions from a pool of HanjaChar objects.
 * @param {Array} pool - Array of HanjaChar objects
 * @param {number} count - Number of questions to generate (default 10)
 * @returns {Array} Array of { correct, type, options }
 *   type: 0 = 한자→뜻음, 1 = 뜻음→한자, 2 = 한자→음, 3 = 뜻음→쓰기(New!)
 */
export function generateQuiz(pool, count = 10) {
  if (pool.length < 4) return [];

  const selected = shuffle(pool).slice(0, Math.min(count, pool.length));

  return selected.map((correct) => {
    // 0,1,2: 객관식, 3: 쓰기 문제 (확률 25%? 아니면 조정 가능)
    // 쓰기 문제는 Canvas가 필요하므로 특별 처리가 필요함.
    const type = Math.floor(Math.random() * 4); // 0~3

    // Pick 3 wrong answers from pool (excluding the correct one)
    const others = pool.filter((item) => item !== correct);
    const wrongAnswers = shuffle(others).slice(0, 3);

    // Combine correct + wrong, then shuffle
    const options = shuffle([correct, ...wrongAnswers]);

    return { correct, type, options };
  });
}
