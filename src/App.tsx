import { useCallback, useRef, useState } from "react";
import quizList from "../public/quiz.json";
import Markdown from "react-markdown";
import styled from "styled-components";
import memoize from "fast-memoize";

const Quiz = styled.div``;

const Option = styled.button.attrs<{ $selected?: boolean; $correct?: boolean }>(
  { $selected: false, $correct: false }
)``;

export default function () {
  const [idx, setIdx] = useState(-1);
  const [answer, setAnswer] = useState<number[]>([]);
  const [solving, setSolving] = useState(false);
  const timerRef = useRef<number>(null);

  const nextQuiz = useCallback(() => {
    setIdx((prevIdx) => prevIdx + 1);
    setSolving(() => true);
    // 20 second time limit
    timerRef.current = setTimeout(() => setSolving(() => false), 1000 * 20);
  }, []);
  const answerQuiz = useCallback(() => {
    if (answer.length !== quizList[idx].answer.length) {
      // Show error message
      return;
    }

    clearTimeout(timerRef.current!);
    setSolving(() => false);

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

    setAnswer(() => []);
  }, [idx, answer]);
  const toggleAnswer = useCallback(
    memoize((optionIdx: number) => () => {
      setAnswer((prevAnswer) => {
        prevAnswer.includes(optionIdx)
          ? prevAnswer.splice(prevAnswer.indexOf(optionIdx), 1)
          : prevAnswer.push(optionIdx);
        return prevAnswer;
      });
    }),
    []
  );

  return (
    <>
      {idx < 0 ? (
        <div>
          <h1>JavaScript Quiz</h1>
          <p>간단한 JavaScript 퀴즈를 풀어보세요!</p>
          <small style={{ color: "gray" }}>
            각 문제는 20초의 시간 제한이 있습니다.
          </small>
        </div>
      ) : idx < quizList.length ? (
        <Quiz>
          <h2>{quizList[idx].text}</h2>
          {quizList[idx].option_list.map((option, i) => (
            <Option
              key={i}
              onClick={toggleAnswer(i)}
              $selected={answer.includes(i)}
              $correct={!solving && quizList[idx].answer.includes(i)}
            >
              {option}
            </Option>
          ))}
          {!solving && <Markdown>{quizList[idx].description}</Markdown>}
        </Quiz>
      ) : (
        <div>
          <h1>Results</h1>
        </div>
      )}
    </>
    // TODO: Show results
  );
}
