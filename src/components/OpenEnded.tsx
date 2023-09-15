"use client";
import { cn, formatTimeDelta } from "@/lib/utils";
import { Game, Question } from "@prisma/client";
import { differenceInSeconds } from "date-fns";
import { BarChart, ChevronRight, Loader2, Timer } from "lucide-react";
import React from "react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button, buttonVariants } from "./ui/button";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import axios from "axios";
import { useToast } from "./ui/use-toast";
import Link from "next/link";
import { checkAnswerSchema, endGameSchema } from "@/schemas/question";
import keyword_extractor from "keyword-extractor";

type Props = {
  game: Game & { questions: Pick<Question, "id" | "question" | "answer">[] };
};

const OpenEnded = ({ game }: Props) => {
  const blank = "_____";
  const [hasEnded, setHasEnded] = React.useState(false);
  const [questionIndex, setQuestionIndex] = React.useState(0);
  const [blankAnswer, setBlankAnswer] = React.useState("");
  const [averagePercentage, setAveragePercentage] = React.useState(0);
  const currentQuestion = React.useMemo(() => {
    return game.questions[questionIndex];
  }, [questionIndex, game.questions]);

  const { toast } = useToast();
  const [now, setNow] = React.useState(new Date());
  const { mutate: checkAnswer, isLoading: isChecking } = useMutation({
    mutationFn: async () => {
      let filledAnswer = blankAnswer;
      document.querySelectorAll("#user-blank-input").forEach((input) => {
        const inputConverted = input as HTMLInputElement;
        filledAnswer = filledAnswer.replace("_____", inputConverted.value);
        inputConverted.value = "";
      });
      const payload: z.infer<typeof checkAnswerSchema> = {
        questionId: currentQuestion.id,
        userAnswer: filledAnswer,
      };
      const response = await axios.post(`/api/checkAnswer`, payload);
      console.debug(response.data);
      return response.data;
    },
  });
  React.useEffect(() => {
    if (!hasEnded) {
      const interval = setInterval(() => {
        setNow(new Date());
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [hasEnded]);

  const handleSetBlankAnswer = (answer: string) => {
    setBlankAnswer(answer);
  };

  const { mutate: endGame } = useMutation({
    mutationFn: async () => {
      const payload: z.infer<typeof endGameSchema> = {
        gameId: game.id,
      };
      const response = await axios.post(`/api/endGame`, payload);
      return response.data;
    },
  });

  const handleNext = React.useCallback(() => {
    checkAnswer(undefined, {
      onSuccess: ({ percentageSimilar }) => {
        console.debug(percentageSimilar);
        toast({
          title: `Your answer is ${percentageSimilar}% similar to the correct answer`,
        });
        setAveragePercentage((prev) => {
          return (prev + percentageSimilar) / (questionIndex + 1);
        });
        if (questionIndex === game.questions.length - 1) {
          endGame();
          setHasEnded(true);
          return;
        }
        setQuestionIndex((prev) => prev + 1);
      },
      onError: (error) => {
        console.error(error);
        toast({
          title: "Something went wrong",
          variant: "destructive",
        });
      },
    });
  }, [checkAnswer, questionIndex, toast, game.questions.length, endGame]);

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key;
      if (key === "Enter") {
        handleNext();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleNext]);

  const keywords = React.useMemo(() => {
    const words = keyword_extractor.extract(currentQuestion.answer, {
      language: "english",
      remove_digits: true,
      return_changed_case: false,
      remove_duplicates: false,
    });
    // mix the keywords and pick 2
    const shuffled = words.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 2);
  }, [currentQuestion.answer]);

  const answerWithBlanks = React.useMemo(() => {
    const answerWithBlanks = keywords.reduce((acc, curr) => {
      return acc.replaceAll(curr, blank);
    }, currentQuestion.answer);
    setBlankAnswer(answerWithBlanks);
    return answerWithBlanks;
  }, [currentQuestion.answer, keywords, setBlankAnswer]);

  if (hasEnded) {
    return (
      <div className="absolute flex flex-col justify-center -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
        <div className="px-4 py-2 mt-2 font-semibold text-white bg-green-500 rounded-md whitespace-nowrap">
          You Completed in{" "}
          {formatTimeDelta(differenceInSeconds(now, game.timeStarted))}
        </div>
        <Link
          href={`/statistics/${game.id}`}
          className={cn(buttonVariants({ size: "lg" }), "mt-2")}
        >
          View Statistics
          <BarChart className="w-4 h-4 ml-2" />
        </Link>
      </div>
    );
  }

  return (
    <div className="absolute -translate-x-1/2 -translate-y-1/2 md:w-[80vw] max-w-4xl w-[90vw] top-1/2 left-1/2">
      <div className="flex flex-row justify-between">
        <div className="flex flex-col">
          {/* topic */}
          <p>
            <span className="text-slate-400">Topic</span> &nbsp;
            <span className="px-2 py-1 text-white rounded-lg bg-slate-800">
              {game.topic}
            </span>
          </p>
          <div className="flex self-start mt-3 text-slate-400">
            <Timer className="mr-2" />
            {formatTimeDelta(differenceInSeconds(now, game.timeStarted))}
          </div>
        </div>
      </div>
      <Card className="w-full mt-4">
        <CardHeader className="flex flex-row items-center">
          <CardTitle className="mr-5 text-center divide-y divide-zinc-600/50">
            <div>{questionIndex + 1}</div>
            <div className="text-base text-slate-400">
              {game.questions.length}
            </div>
          </CardTitle>
          <CardDescription className="flex-grow text-lg">
            {currentQuestion?.question}
          </CardDescription>
        </CardHeader>
      </Card>
      <div className="flex flex-col items-center justify-center w-full mt-4">
        <div className="flex justify-start w-full mt-4">
          <div className="text-xl font-semibold">
            {answerWithBlanks.split(blank).map((part, index) => {
              return (
                <React.Fragment key={index}>
                  {part}
                  {index === answerWithBlanks.split(blank).length - 1 ? (
                    ""
                  ) : (
                    <input
                      id="user-blank-input"
                      className="text-center border-b-2 border-black dark:border-white w-28 focus:border-2 focus:border-b-4 focus:outline-none"
                      type="text"
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
        <Button
          variant="outline"
          className="mt-4"
          disabled={isChecking || hasEnded}
          onClick={() => {
            handleNext();
          }}
        >
          {isChecking && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Next <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default OpenEnded;
