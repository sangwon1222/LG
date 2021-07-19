import gsap from "gsap/all";
import { ResourceManager } from "../core/resourceManager";

export class DirectionAffor extends PIXI.Container {
  private mHand: PIXI.Sprite;
  private mArrow: PIXI.Sprite;
  constructor() {
    super();
  }
  createObject(): Promise<void> {
    return new Promise<void>((resolve) => {
      this.removeChildren();
      this.mHand = new PIXI.Sprite(
        ResourceManager.Handle.getCommon("affordance_hand.png").texture
      );
      this.mHand.scale.set(0.9);
      this.mHand.anchor.set(0.5);
      this.mHand.y = 120;

      this.mArrow = new PIXI.Sprite(
        ResourceManager.Handle.getCommon("affordance_arrow.png").texture
      );
      this.mArrow.angle = -45;

      this.addChild(this.mArrow, this.mHand);
      resolve();
    });
  }

  async start(xValue: number, yValue: number, duration: number) {
    await this.createObject();

    gsap
      .to(this.mHand, {
        x: this.mHand.x + xValue,
        y: this.mHand.y + yValue,
        duration: duration,
      })
      .repeat(-1);
  }

  async endAffor() {
    gsap.killTweensOf(this.mHand);
    this.removeChildren();
  }
}
