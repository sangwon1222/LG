import gsap from "gsap/all";
import { ResourceManager } from "../core/resourceManager";

export class DeepPressAffor extends PIXI.Container {
  private mHand: PIXI.Sprite;
  private mHandMotion: gsap.core.Timeline;
  private mWaveMotion: gsap.core.Timeline;

  private mWave: PIXI.Sprite;
  private mWaveMask: PIXI.Graphics;

  constructor() {
    super();
  }

  createObject(): Promise<void> {
    return new Promise<void>((resolve) => {
      this.removeChildren();
      this.mHand = new PIXI.Sprite(
        ResourceManager.Handle.getCommon("affordance_hand.png").texture
      );
      this.mHand.anchor.set(0.5);
      this.mHand.y = 20;

      this.mWave = new PIXI.Sprite(
        ResourceManager.Handle.getCommon("affordance_wave.png").texture
      );
      this.mWave.position.set(-10, -40);

      this.mWaveMask = new PIXI.Graphics();
      this.mWaveMask.beginFill(0xff0000, 0.2);
      this.mWaveMask.drawCircle(0, 0, this.mWave.width * 0.5);
      this.mWaveMask.endFill();
      this.mWaveMask.position.set(-10, -20);

      this.mWave.mask = this.mWaveMask;

      this.addChild(this.mHand, this.mWave, this.mWaveMask);

      this.mWave.anchor.set(0.5);
      this.visible = false;
      resolve();
    });
  }

  async start() {
    await this.resetAffor();

    this.visible = true;

    if (this.mHandMotion) {
      this.mHandMotion.kill();
    }

    this.mHand.scale.set(1);
    this.mWaveMask.scale.set(0);

    this.mHandMotion = gsap.timeline({ repeat: -1 });
    this.mHandMotion.to(this.mHand.scale, {
      x: 0.8,
      y: 0.8,
      duration: 0.5,
    });
    this.mHandMotion.to(this.mHand.scale, { x: 0.8, y: 0.8, duration: 2 });
    this.mHandMotion.to(this.mHand.scale, { x: 1, y: 1, duration: 0.5 });

    this.mWaveMotion = gsap.timeline({ repeat: -1 });
    this.mWaveMotion.to(this.mWaveMask.scale, {
      x: 1,
      y: 1,
      duration: 2,
    });
    this.mWaveMotion.to(this.mWaveMask.scale, {
      x: 1,
      y: 1,
      duration: 1,
    });
  }

  async resetAffor() {
    if (this.mHandMotion) {
      this.mHandMotion.kill();
    }
    if (this.mWaveMotion) {
      this.mWaveMotion.kill();
    }
    this.removeChildren();

    await this.createObject();
  }

  endAffor() {
    if (this.mHandMotion) {
      this.mHandMotion.kill();
    }
    if (this.mWaveMotion) {
      this.mWaveMotion.kill();
    }
    this.removeChildren();
  }
}
