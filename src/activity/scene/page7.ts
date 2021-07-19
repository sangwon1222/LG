import gsap from "gsap/all";
import { ResourceManager } from "../core/resourceManager";
import { SceneBase } from "../core/sceneBase";
import config from "../utill/config";

export class Page7 extends SceneBase {
  private mBG: PIXI.Sprite;

  private mSpine: PIXI.spine.Spine;
  private mRainAry: Array<PIXI.Sprite>;

  private mTitleAry: Array<PIXI.Sprite>;
  private mTitleSndAry: Array<PIXI.sound.Sound>;

  constructor() {
    super("page7");
  }
  async onInit() {
    this.removeChildren();
    this.mBG = new PIXI.Sprite(
      ResourceManager.Handle.getCommon("page7.png").texture
    );
    this.addChild(this.mBG);
    this.mSpine = new PIXI.spine.Spine(
      ResourceManager.Handle.getCommon("7_p_motion.json").spineData
    );
    this.mSpine.stateData.defaultMix = 0.5;
    this.mSpine.position.set(640, 402);
    this.addChild(this.mSpine);
  }
  async onStart() {
    if (window["bgm"].paused) window["bgm"].play({ loop: true });
    window.onkeydown = async (evt: KeyboardEvent) => {
      if (evt.key == "+") {
        window.onkeydown = () => null;
        await gsap.globalTimeline.clear();
        await this.createRain();
        await this.registEvent();
      }
    };

    this.mSpine.state.setAnimation(0, "7_1", true);
    //이미지 아래 설명 글
    await this.createImgText();
    await this.titleInteractive();
    await this.createRain();
    this.registEvent();
  }

  async registEvent() {
    let affordance = new PIXI.spine.Spine(
      ResourceManager.Handle.getCommon("circle.json").spineData
    );
    this.addChild(affordance);
    affordance.position.set(890, 560);
    affordance.state.setAnimation(0, "animation", true);
    affordance.zIndex = 6;

    this.mSpine.interactive = true;
    this.mSpine.buttonMode = true;
    this.mSpine.once("pointertap", () => {
      window["clickSnd"].play();
      this.removeChild(affordance);
      affordance = null;

      let rainSnd = ResourceManager.Handle.getCommon("07_sfx_1.mp3").sound;
      rainSnd.play({ loop: true });
      this.mSpine.state.addListener({
        complete: async (event) => {
          const name = event.animation.name;
          if (name == "7_2") {
            this.rainDrop();
            this.mSpine.state.setAnimation(0, "7_3", true);
            gsap.delayedCall(4, async () => {
              rainSnd.stop();
              rainSnd = null;
              await this.goScene("page8");
            });
          }
        },
      });
      this.mSpine.state.setAnimation(0, "7_2", false);
    });
  }

  createRain(): Promise<void> {
    return new Promise<void>((resolve) => {
      this.mRainAry = [];
      this.sortableChildren = true;
      this.mSpine.zIndex = 3;

      for (let i = 0; i < 4; i++) {
        const rain = new PIXI.Sprite();
        i % 2 == 0
          ? (rain.texture = ResourceManager.Handle.getCommon(
              "7_rain.png"
            ).texture)
          : (rain.texture = ResourceManager.Handle.getCommon(
              "7_rain_b.png"
            ).texture);
        this.addChild(rain);
        rain.position.set(700 + 200, -800);
        rain.zIndex = (i % 2) + 2;
        this.mRainAry.push(rain);
      }
      resolve();
    });
  }
  //비가 온다.
  rainDrop() {
    let i = 0;
    for (const rain of this.mRainAry) {
      const mask = new PIXI.Graphics();
      mask.beginFill(0x000000, 1);
      mask.drawRect(0, 0, config.w / 2, config.h);
      mask.endFill();
      mask.x = config.w / 2;
      this.addChild(mask);
      rain.mask = mask;
      gsap
        .to(rain, { x: 400, y: 800, duration: 4 })
        .repeat(-1)
        .delay(i);
      i += 1;
    }
  }

  // 이미지 아래 설명 글
  createImgText(): Promise<void> {
    return new Promise<void>((resolve) => {
      const titlePos = [
        { x: 260, y: 370 },
        { x: 270, y: 740 },
        { x: 640 + 200, y: 100 },
      ];
      this.mTitleAry = [];
      this.mTitleSndAry = [];

      for (let i = 1; i <= 3; i++) {
        const title = new PIXI.Sprite(
          ResourceManager.Handle.getCommon(`page7_title${i}.png`).texture
        );
        title.anchor.set(0.5);
        title.position.set(titlePos[i - 1].x, titlePos[i - 1].y);
        title.alpha = 0;
        this.mTitleAry.push(title);
        this.addChild(title);
        if (i == 3) title.zIndex = 7;

        const snd = ResourceManager.Handle.getCommon(`07_nar_${i}.mp3`).sound;
        this.mTitleSndAry.push(snd);
      }

      let delay = 0;
      for (let i = 0; i < this.mTitleSndAry.length; i++) {
        gsap.delayedCall(delay, () => {
          this.mTitleSndAry[i].play();
          if (i == 2) {
            gsap.delayedCall(this.mTitleSndAry[i].duration, () => {
              resolve();
            });
          }
        });
        gsap.to(this.mTitleAry[i], { alpha: 1, duration: 1 }).delay(delay);
        delay += this.mTitleSndAry[i].duration;
      }
    });
  }

  titleInteractive() {
    for (let i = 0; i < this.mTitleAry.length; i++) {
      this.mTitleAry[i].interactive = true;
      this.mTitleAry[i].buttonMode = true;
      this.mTitleAry[i].on("pointertap", async () => {
        await this.stopAllTitleSnd();
        this.mTitleSndAry[i].play();
      });
    }
  }

  stopAllTitleSnd(): Promise<void> {
    return new Promise<void>((resolve) => {
      for (const titleSnd of this.mTitleSndAry) {
        titleSnd.stop();
      }
      resolve();
    });
  }
}
