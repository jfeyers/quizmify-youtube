import { getAuthSession } from "@/lib/nextauth";
import { redirect } from "next/navigation";
import React from "react";
import QuizCreation from "../../components/forms/QuizCreation";

type Props = {};
export const metadata = { title: "Quiz | Quizmify" };
const QuizPage = async (props: Props) => {
  const session = await getAuthSession();
  if (!session?.user) {
    return redirect("/");
  }
  return <QuizCreation />;
};

export default QuizPage;
