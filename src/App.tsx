import { useCallback, useRef, useState } from "react";
import quizList from "./assets/quiz.json";
import Markdown from "react-markdown";
import styled, { keyframes } from "styled-components";
import memoize from "fast-memoize";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleCheck,
  faCircleXmark
} from "@fortawesome/free-solid-svg-icons";

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

const List = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0.5rem;
`;

const QuizOption = styled.button.attrs<{
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

export default function() {
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

          <h2>
            {!solving && (
              <FontAwesomeIcon
                icon={result[result.length - 1] ? faCircleCheck : faCircleXmark}
              />
            )}
            &nbsp;
            {quizList[idx].text}
          </h2>
          <List>
            {quizList[idx].option_list.map((option, i) => (
              <li key={i}>
                <QuizOption
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
                </QuizOption>
              </li>
            ))}
          </List>
          {!solving && (
            <>
              <h3>정답</h3>
              <List>
                {quizList[idx].option_list.map((option, i) => (
                  <li key={i}>
                    <QuizOption
                      $correct={quizList[idx].answer.includes(i)}
                      style={{ pointerEvents: "none" }}
                    >
                      {option}
                    </QuizOption>
                  </li>
                ))}
              </List>
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
          <List>
            {result.map((isCorrect, i) => (
              <li key={i}>
                <FontAwesomeIcon
                  icon={isCorrect ? faCircleCheck : faCircleXmark}
                />
                &nbsp;
                <span style={{ color: isCorrect ? "ligntgreen" : "red" }}>
                  {i + 1}번 문제
                </span>
                &nbsp;
                {!isCorrect && (
                  <>
                    정답:&nbsp;
                    {quizList[i].answer
                      .map(
                        (answer) =>
                          `${answer + 1}번: ${quizList[i].option_list[answer]}`
                      )
                      .join(", ")}
                  </>
                )}
              </li>
            ))}
          </List>
        </div>
      )}
    </>
  );
}
