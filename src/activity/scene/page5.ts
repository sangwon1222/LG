import * as PIXI from "pixi.js";
import gsap, { Power0 } from "gsap/all";
import { ResourceManager } from "../core/resourceManager";
import { SceneBase } from "../core/sceneBase";
import config from "../utill/config";
import { debugLine, getPos } from "../utill/gameUtil";

export class BoyBody extends PIXI.Container {
  private mSpine: PIXI.spine.Spine;
  private mHead: PIXI.Sprite;
  private mBody: PIXI.Sprite;
  private mRightArm: PIXI.Sprite;
  private mLeftArm: PIXI.Sprite;
  private mLeg: PIXI.Sprite;
  constructor() {
    super();
    // if (spine) {
    this.mSpine = new PIXI.spine.Spine(
      ResourceManager.Handle.getCommon("5_p_motion.json").spineData
    );
    this.mSpine.stateData.defaultMix = 0.5;
    this.mSpine.position.set(640, 400);
    this.addChild(this.mSpine);
    this.mSpine.state.setAnimation(0, "5_1", true);
    this.mSpine.state.timeScale = 0;

    // } else {
    //   // 오른쪽 팔
    //   this.mRightArm = new PIXI.Sprite(
    //     ResourceManager.Handle.getCommon("5_cha_arm.png").texture
    //   );
    //   this.mRightArm.anchor.set(0, 0.5);
    //   this.mRightArm.position.set(640 + 348, 416);

    //   // 왼쪽 팔
    //   this.mLeftArm = new PIXI.Sprite(
    //     ResourceManager.Handle.getCommon("5_cha_arm_l.png").texture
    //   );
    //   this.mLeftArm.anchor.set(1, 0);
    //   this.mLeftArm.position.set(640 + 290, 440);

    //   // 다리
    //   this.mLeg = new PIXI.Sprite(
    //     ResourceManager.Handle.getCommon("5_cha_leg.png").texture
    //   );
    //   this.mLeg.anchor.set(0, 1);
    //   this.mLeg.position.set(640 + 240, 740);
    //   // 몸통
    //   this.mBody = new PIXI.Sprite(
    //     ResourceManager.Handle.getCommon("5_cha_body.png").texture
    //   );
    //   this.mBody.anchor.set(0.5);
    //   this.mBody.position.set(640 + 348, 500);

    //   // 머리
    //   this.mHead = new PIXI.Sprite(
    //     ResourceManager.Handle.getCommon("5_cha_head.png").texture
    //   );
    //   this.mHead.anchor.set(0.5);
    //   this.mHead.position.set(640 + 300, 330);
    //   this.addChild(
    //     this.mRightArm,
    //     this.mLeftArm,
    //     this.mLeg,
    //     this.mBody,
    //     this.mHead
    //   );
    // }
  }
  startMotion() {
    // if (this.mHead) {
    //   gsap
    //     .to(this.mHead, { angle: 5, duration: 1, ease: Power0.easeNone })
    //     .repeat(-1)
    //     .yoyo(true);
    //   gsap
    //     .to(this.mRightArm, { angle: 5, duration: 1, ease: Power0.easeNone })
    //     .repeat(-1)
    //     .yoyo(true);
    //   gsap
    //     .to(this.mLeftArm, { angle: -5, duration: 1, ease: Power0.easeNone })
    //     .repeat(-1)
    //     .yoyo(true);
    //   gsap
    //     .to(this.mLeg, { angle: 1, duration: 1, ease: Power0.easeNone })
    //     .repeat(-1)
    //     .yoyo(true);
    // } else {
    this.mSpine.state.timeScale = 1;
    // }
  }

  chageMotion() {
    this.mSpine.state.setAnimation(0, "5_2", true);
  }
}
export class Page5 extends SceneBase {
  private mBG: PIXI.Sprite;

  private mBoy: BoyBody;
  private mTitleSprite: PIXI.Sprite;
  private mTitleSnd: PIXI.sound.Sound;

  private mStepSnd: PIXI.sound.Sound;

  constructor() {
    super("page5");
  }
  async onInit() {
    this.mBG = new PIXI.Sprite(
      ResourceManager.Handle.getCommon("page5.png").texture
    );
    this.mBoy = new BoyBody();

    this.addChild(this.mBG, this.mBoy);
  }
  async onStart() {
    window.onkeydown = async (evt: KeyboardEvent) => {
      if (evt.key == "+") {
        window.onkeydown = () => null;
        await gsap.globalTimeline.clear();
        await this.registEvent();
      }
    };
    if (window["bgm"].paused) window["bgm"].play({ loop: true });
    this.mStepSnd = ResourceManager.Handle.getCommon("05_sfx_1.mp3").sound;
    this.mTitleSnd = ResourceManager.Handle.getCommon("05_nar_1.mp3").sound;
    this.mStepSnd.volume = 0.5;

    this.stepSound();

    this.mBoy.startMotion();

    await this.showTitle();

    await this.registEvent();
  }

  showTitle(): Promise<void> {
    return new Promise<void>((resolve) => {
      this.mTitleSprite = new PIXI.Sprite(
        ResourceManager.Handle.getCommon("page5_title.png").texture
      );
      this.mTitleSprite.position.set(208, 712);
      getPos(this.mTitleSprite);
      this.mTitleSprite.interactive = true;
      this.mTitleSprite.buttonMode = true;

      const mask = new PIXI.Graphics();
      mask.beginFill(0x000000, 1);
      mask.drawRect(0, 0, this.mTitleSprite.width, this.mTitleSprite.height);
      mask.endFill();
      mask.position.set(
        this.mTitleSprite.x - this.mTitleSprite.width,
        this.mTitleSprite.y
      );

      this.addChild(this.mTitleSprite, mask);
      this.mTitleSprite.mask = mask;

      gsap.to(mask, { x: this.mTitleSprite.x, duration: 2 }).delay(1);
      gsap.delayedCall(1, () => {
        this.mTitleSnd.play();
        gsap.delayedCall(this.mTitleSnd.duration, () => {
          resolve();
        });
      });
    });
  }

  stepSound() {
    if (!this.mStepSnd) {
      this.stepSound = () => null;
      return;
    }
    const vList = [0.2, 0.4, 0.6, 0.8, 1];
    const random = Math.floor(Math.random() * 5);
    const volumeValue = vList[random];
    this.mStepSnd.volume = volumeValue;
    this.mStepSnd.play();
    gsap.delayedCall(2.5, () => {
      this.stepSound();
    });
  }

  async registEvent() {
    let affordance = new PIXI.spine.Spine(
      ResourceManager.Handle.getCommon("circle.json").spineData
    );
    this.addChild(affordance);
    affordance.position.set(976, 534);
    affordance.state.setAnimation(0, "animation", true);

    this.mBoy.interactive = true;
    this.mBoy.buttonMode = true;

    this.mBoy.once("pointertap", () => {
      this.removeChild(affordance);
      affordance = null;
      window["clickSnd"].play();
      gsap.delayedCall(1, () => {
        this.mBoy.chageMotion();
        this.startSnow();
      });
    });
  }

  startSnow() {
    const snow1 = new PIXI.Sprite(
      ResourceManager.Handle.getCommon("page5_snow.png").texture
    );
    const snow2 = new PIXI.Sprite(
      ResourceManager.Handle.getCommon("page5_snow.png").texture
    );
    const snow3 = new PIXI.Sprite(
      ResourceManager.Handle.getCommon("page5_snow.png").texture
    );
    this.addChild(snow1, snow2, snow3);
    snow1.y = -800;
    snow2.y = -800;
    snow3.y = -800;
    gsap.to(snow1, { y: 800, duration: 12, ease: Power0.easeNone }).repeat(-1);
    gsap.to(snow2, { y: 800, duration: 24, ease: Power0.easeNone }).repeat(-1);
    gsap.to(snow3, { y: 800, duration: 48, ease: Power0.easeNone }).repeat(-1);

    gsap.delayedCall(5, async () => {
      this.mStepSnd = null;
      await this.goScene("page6");
    });
  }
}
