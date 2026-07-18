"use client";

// 後製特效鏈——「遊戲質感」最大的單一來源。
// Bloom 讓火光/陽光/閃爍溢出柔和光暈，Vignette 聚焦視線，SMAA 抗鋸齒。
// 參數刻意保守（iPad 也要順跑）；DoF、SSAO 這類重效果先不用。

import * as React from "react";
import { EffectComposer, Bloom, Vignette, FXAA } from "@react-three/postprocessing";

export function PostFX() {
  return (
    <EffectComposer multisampling={0}>
      <Bloom mipmapBlur intensity={0.45} luminanceThreshold={0.92} luminanceSmoothing={0.12} />
      <Vignette eskil={false} offset={0.22} darkness={0.5} />
      <FXAA />
    </EffectComposer>
  );
}
