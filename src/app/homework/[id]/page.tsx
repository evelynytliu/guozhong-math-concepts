import { notFound } from "next/navigation";
import { getHomework, homeworks } from "@/content/homework";
import { HomeworkFlow } from "@/components/homework/homework-flow";

export function generateStaticParams() {
  return homeworks.map((h) => ({ id: h.id }));
}

export default function HomeworkPage({ params }: { params: { id: string } }) {
  const hw = getHomework(params.id);
  if (!hw) notFound();
  return <HomeworkFlow homework={hw} />;
}
