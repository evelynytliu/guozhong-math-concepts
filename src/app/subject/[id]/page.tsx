import { notFound } from "next/navigation";
import { subjects, getSubject } from "@/content/subjects";
import { contentForSubject } from "@/lib/subject-content";
import { SubjectView } from "@/components/subject-view";

export function generateStaticParams() {
  return subjects.map((s) => ({ id: s.id }));
}

export default function SubjectPage({ params }: { params: { id: string } }) {
  const subject = getSubject(params.id);
  if (!subject) notFound();
  const items = contentForSubject(subject.id);
  return <SubjectView subject={subject} items={items} />;
}
