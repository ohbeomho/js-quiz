import { useCallback, useRef, useState } from "react";
import quizList from "../public/quiz.json";

export default function() {
  const [idx, setIdx] = useState(-1);
  const [answer, setAnswer] = useState<number[]>([]);
  const timerRef = useRef<number>(null);

  const nextQuiz = useCallback(() => {
    setIdx((prevIdx) => prevIdx + 1);
    // 20 second time limit
    timerRef.current = setTimeout(() => { }, 1000 * 20);
  }, [timerRef.current]);
  const answerQuiz = useCallback(() => {
    if (answer.length !== quizList[idx].answer.length) {
      // Show error message
      return;
    }

    clearTimeout(timerRef.current!);

    answer.sort((a, b) => a - b);
    let correct = true;
    for (let i = 0; i < answer.length; i++) {
      if (answer[i] !== quizList[idx].answer[i]) {
        correct = false;
        break;
      }
    }

    if (correct) {
      // Correct answer
    } else {
      // Wrong answer
    }

    setAnswer([]);
  }, [idx, answer, timerRef.current]);

  return <div></div>;
}
