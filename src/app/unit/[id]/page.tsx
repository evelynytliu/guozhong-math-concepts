import { notFound } from "next/navigation";
import { getUnit, units } from "@/content";
import { UnitFlow } from "@/components/unit-flow";

export function generateStaticParams() {
  return units.map((u) => ({ id: u.id }));
}

export default function UnitPage({ params }: { params: { id: string } }) {
  const unit = getUnit(params.id);
  if (!unit) notFound();
  return <UnitFlow unit={unit} />;
}
