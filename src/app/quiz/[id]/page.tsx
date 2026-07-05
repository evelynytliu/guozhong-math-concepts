import { notFound } from "next/navigation";
import { getQuiz, quizzes } from "@/content/quizzes";
import { QuizPlayer } from "@/components/quiz-player";

export function generateStaticParams() {
  return quizzes.map((q) => ({ id: q.id }));
}

export default function QuizPage({ params }: { params: { id: string } }) {
  const quiz = getQuiz(params.id);
  if (!quiz) notFound();
  return <QuizPlayer quiz={quiz} />;
}
