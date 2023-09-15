import SignInButton from "@/components/SignInButton";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { prisma } from "@/lib/db";
import { getAuthSession } from "@/lib/nextauth";

export default async function Home() {
  const session = await getAuthSession();
  if (session?.user) {
    redirect("/dashboard");
  }
  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
      <Card className="w-[300px]">
        <CardHeader>
          <CardTitle>Welcome to Quizmify</CardTitle>
          <CardDescription>
            Quizmify is a quiz app that allows you to create and share quizzes
            with your friends.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SignInButton text="Sign in with Google" />
        </CardContent>
      </Card>
    </div>
  );
}
