// /history/[sceneId] — 單一 3D 場景的遊玩頁（全螢幕播放器）。

import { notFound } from "next/navigation";
import { getHistoryScene, historyScenes } from "@/content/history";
import { ScenePlayer } from "@/components/history/scene-player";

export function generateStaticParams() {
  return historyScenes.map((s) => ({ sceneId: s.id }));
}

export default function HistoryScenePage({
  params,
}: {
  params: { sceneId: string };
}) {
  const scene = getHistoryScene(params.sceneId);
  if (!scene) notFound();
  return <ScenePlayer scene={scene} />;
}
