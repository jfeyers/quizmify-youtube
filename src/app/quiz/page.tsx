import { getAuthSession } from "@/lib/nextauth";
import { redirect } from "next/navigation";
import React from "react";
import QuizCreation from "../../components/forms/QuizCreation";

interface Props {
  searchParams: {
    topic?: string;
  };
}
export const metadata = {
  title: "Quiz | Quizmify",
  description: "Quiz yourself on anything!",
};
const QuizPage = async ({ searchParams }: Props) => {
  const session = await getAuthSession();
  if (!session?.user) {
    return redirect("/");
  }
  return <QuizCreation topic={searchParams.topic ?? ""} />;
};

export default QuizPage;
