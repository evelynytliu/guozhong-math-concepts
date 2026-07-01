import { notFound } from "next/navigation";
import { getWord, wenyanWords } from "@/content/wenyan";
import { WenyanFlow } from "@/components/wenyan/wenyan-flow";

export function generateStaticParams() {
  return wenyanWords.map((w) => ({ id: w.id }));
}

export default function WenyanPage({ params }: { params: { id: string } }) {
  const word = getWord(params.id);
  if (!word) notFound();
  return <WenyanFlow word={word} />;
}
