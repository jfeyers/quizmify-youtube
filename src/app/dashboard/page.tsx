import HistoryCard from "@/components/dashboard/HistoryCard";
import HotTopicsCard from "@/components/dashboard/HotTopicsCard";
import QuizMeCard from "@/components/dashboard/QuizMeCard";
import RecentActivityCard from "@/components/dashboard/RecentActivityCard";
import { getAuthSession } from "@/lib/nextauth";
import { redirect } from "next/navigation";
import React from "react";

type Props = {};
export const metadata = {
  title: "Dashboard | Quizmify",
};
const Dashboard = async (props: Props) => {
  const session = await getAuthSession();
  if (!session?.user) {
    return redirect("/");
  }
  return (
    <main className="p-8 mx-auto max-w-7x1">
      <div className="flex items-center">
        <h2 className="mr-2 text-3x1 font-bold tracking-tight">Dashboard</h2>
      </div>
      <div className="grid gap-4 mt-4 md:grid-cols-2">Test</div>
      <div className="grid gap-4 mt-4 md:grid-cols-2 lg:grid-cols-7">Test</div>
    </main>
  );
};

export default Dashboard;
