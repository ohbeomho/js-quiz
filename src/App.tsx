import { useCallback, useRef, useState } from "react";
import quizList from "./assets/quiz.json";
import Markdown from "react-markdown";
import styled, { keyframes } from "styled-components";
import memoize from "fast-memoize";

const Shrink = keyframes`
0% {
  width: 100%;
}
100% {
  width: 0%;
}
`;

const ProgressBar = styled.div`
  background-color: white;
  width: 100%;
  height: 0.5rem;
  position: absolute;
  top: -1rem;
  left: 0;
  animation: ${Shrink} 20s forwards linear;
`;

const Quiz = styled.div`
  text-align: left;
  position: relative;
`;

const OptionList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0.5rem;
`;

const Option = styled.button.attrs<{
  $selected?: boolean;
  $correct?: boolean;
}>({})`
  background-color: ${({ $selected, $correct }) =>
    $selected
      ? "skyblue"
      : $correct === undefined
        ? "white"
        : $correct
          ? "lightgreen"
          : "red"};
`;

export default function () {
  const [idx, setIdx] = useState(-1);
  const [answers, setAnswers] = useState<number[]>([]);
  const [result, setResult] = useState<boolean[]>([]);
  const [solving, setSolving] = useState(false);
  const timerRef = useRef<number>(null);

  const nextQuiz = useCallback(() => {
    setIdx((prevIdx) => prevIdx + 1);
    setSolving(() => true);
    setAnswers(() => []);
    // 20 second time limit
    timerRef.current = setTimeout(() => setSolving(() => false), 1000 * 20);
  }, [timerRef.current]);
  const answerQuiz = useCallback(() => {
    if (answers.length !== quizList[idx].answer.length) return;

    clearTimeout(timerRef.current!);
    setSolving(() => false);

    const correct = answers
      .sort((a, b) => a - b)
      .every((answer, i) => answer === quizList[idx].answer[i]);

    setResult((result) => [...result, correct]);
  }, [idx, answers, timerRef.current]);
  const toggleAnswer = useCallback(
    memoize((optionIdx: number) => () => {
      setAnswers((prevAnswers) => {
        const newAnswers = prevAnswers.includes(optionIdx)
          ? prevAnswers.filter((answer) => answer !== optionIdx)
          : [...prevAnswers, optionIdx];

        if (newAnswers.length > quizList[idx].answer.length) return prevAnswers;
        return newAnswers;
      });
    }),
    [idx]
  );

  return (
    <>
      {idx < 0 ? (
        <div>
          <h1>JavaScript Quiz</h1>
          <p>간단한 JavaScript 퀴즈를 풀어보세요!</p>
          <p>
            <small style={{ color: "gray" }}>
              각 문제는 20초의 시간 제한이 있습니다.
            </small>
          </p>
          <button onClick={nextQuiz}>시작</button>
        </div>
      ) : idx < quizList.length ? (
        <Quiz>
          {solving && <ProgressBar />}
          <h2>{quizList[idx].text}</h2>
          <OptionList>
            {quizList[idx].option_list.map((option, i) => (
              <li key={i}>
                <Option
                  onClick={toggleAnswer(i)}
                  $selected={solving && answers.includes(i)}
                  $correct={
                    solving || !answers.includes(i)
                      ? undefined
                      : quizList[idx].answer.includes(i)
                  }
                  disabled={!solving}
                >
                  {option}
                </Option>
              </li>
            ))}
          </OptionList>
          {!solving && (
            <>
              <h3>정답</h3>
              <OptionList>
                {quizList[idx].option_list.map((option, i) => (
                  <li key={i}>
                    <Option
                      $correct={quizList[idx].answer.includes(i)}
                      style={{ pointerEvents: "none" }}
                    >
                      {option}
                    </Option>
                  </li>
                ))}
              </OptionList>
              <h3>해설</h3>
              <Markdown>{quizList[idx].description}</Markdown>
              <br />
              <button onClick={nextQuiz}>
                {idx === quizList.length - 1 ? "결과 보기" : "다음 문제"}
              </button>
            </>
          )}
          {solving && (
            <button
              onClick={answerQuiz}
              disabled={answers.length !== quizList[idx].answer.length}
            >
              확인
            </button>
          )}
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
