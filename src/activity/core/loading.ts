import gsap from "gsap/all";
import * as PIXI from "pixi.js";
window.PIXI = PIXI;
import config from "../utill/config";
import { ResourceManager } from "./resourceManager";

export class Loading extends PIXI.Container {
  private mDotGroup: Array<PIXI.Graphics>;
  constructor() {
    super();
  }

  async onInit() {
    const bg = new PIXI.Graphics();
    bg.beginFill(0x000000, 0.8);
    bg.drawRect(0, 0, config.w, config.h);
    bg.endFill();
    this.addChild(bg);
    bg.alpha = 0;
    bg.interactive = true;
    gsap.to(bg, { alpha: 1, duration: 0.5 }).eventCallback("onComplete", () => {
      this.start();
    });
  }
  start() {
    this.mDotGroup = [];
    const x = [config.w / 2 - 50, config.w / 2, config.w / 2 + 50];
    for (let i = 0; i < 3; i++) {
      const dot = new PIXI.Graphics();
      dot.beginFill(0xffffff, 1);
      dot.drawCircle(0, 0, 10);
      dot.endFill();
      dot.pivot.set(dot.width / 2, dot.height / 2);
      dot.position.set(x[i], config.h / 2);
      this.addChild(dot);
      this.mDotGroup.push(dot);
      const timeline = gsap.timeline({ repeat: -1 });
      if (i == 0) {
        timeline.to(dot, { y: dot.y - 60, duration: 0.5 });
        timeline.to(dot, { y: dot.y, duration: 0.5, ease: "bounce" });
        timeline.to(dot, { y: dot.y, duration: 1 });
      }
      if (i == 1) {
        timeline.to(dot, { y: dot.y, duration: 0.5 });
        timeline.to(dot, { y: dot.y - 60, duration: 0.5 });
        timeline.to(dot, { y: dot.y, duration: 0.5, ease: "bounce" });
        timeline.to(dot, { y: dot.y, duration: 0.5 });
      }
      if (i == 2) {
        timeline.to(dot, { y: dot.y, duration: 1 });
        timeline.to(dot, { y: dot.y - 60, duration: 0.5 });
        timeline.to(dot, { y: dot.y, duration: 0.5, ease: "bounce" });
      }
    }
  }

  onEnd() {
    if (this.mDotGroup) {
      for (const dot of this.mDotGroup) {
        gsap.killTweensOf(dot);
      }
    }
    this.removeChildren();
  }
}
