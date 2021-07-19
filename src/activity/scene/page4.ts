import gsap, { Power0 } from "gsap/all";
import { Rectangle } from "pixi.js";
import { ResourceManager } from "../core/resourceManager";
import { SceneBase } from "../core/sceneBase";
import config from "../utill/config";
import { debugLine, getPos } from "../utill/gameUtil";

export class Page4 extends SceneBase {
  private mBG: PIXI.Sprite;

  private mCha: PIXI.spine.Spine;
  private smokeAry: Array<PIXI.Sprite>;

  private mTitle1: PIXI.Sprite;
  private mTitle2: PIXI.Sprite;

  //좌측 글 사운드
  private mTitleSnd1: PIXI.sound.Sound;
  //우측 글 사운드
  private mTitleSnd2: PIXI.sound.Sound;
  constructor() {
    super("page4");
  }
  async onInit() {
    this.removeChildren();
    this.mBG = new PIXI.Sprite(
      ResourceManager.Handle.getCommon("page4.png").texture
    );
    this.mCha = new PIXI.spine.Spine(
      ResourceManager.Handle.getCommon("4_p_motion.json").spineData
    );
    this.mCha.position.set(640, 400);
    this.mCha.stateData.defaultMix = 0.5;

    this.addChild(this.mBG, this.mCha);
  }
  async onStart() {
    window.onkeydown = async (evt: KeyboardEvent) => {
      if (evt.key == "+") {
        window.onkeydown = () => null;
        await gsap.globalTimeline.clear();
        await this.registEvent();
      }
    };
    this.mTitleSnd1 = ResourceManager.Handle.getCommon("04_nar_1.mp3").sound;
    this.mTitleSnd2 = ResourceManager.Handle.getCommon("04_nar_2.mp3").sound;

    if (window["bgm"].paused) window["bgm"].play({ loop: true });
    this.mCha.state.setAnimation(0, "4_1", true);
    await this.showText();

    await this.registEvent();
  }

  async registEvent() {
    let affordance = new PIXI.spine.Spine(
      ResourceManager.Handle.getCommon("circle.json").spineData
    );
    this.addChild(affordance);
    affordance.position.set(982, 406);
    affordance.state.setAnimation(0, "animation", true);
    // getPos(affordance);

    this.mTitle1.interactive = true;
    this.mTitle1.buttonMode = true;
    this.mTitle1.on("pointertap", () => {
      this.mTitleSnd1.stop();
      this.mTitleSnd2.stop();
      this.mTitleSnd1.play();
    });
    this.mTitle2.interactive = true;
    this.mTitle2.buttonMode = true;
    this.mTitle2.on("pointertap", () => {
      this.mTitleSnd1.stop();
      this.mTitleSnd2.stop();
      this.mTitleSnd2.play();
    });

    this.mCha.interactive = true;
    this.mCha.buttonMode = true;

    this.mCha.once("pointertap", () => {
      this.removeChild(affordance);
      affordance = null;
      window["clickSnd"].play();
      gsap.delayedCall(1, () => {
        ResourceManager.Handle.getCommon("04_sfx_1.mp3").sound.play({
          loop: true,
        });

        this.mCha.state.setAnimation(0, "4_2", true);
        this.createSmoke();
      });
    });
  }

  showText(): Promise<void> {
    return new Promise<void>((resolve) => {
      const titlePos = [
        { x: config.w / 2 / 2, y: 640 },
        { x: (config.w / 4) * 3, y: 640 },
      ];
      this.mTitle1 = new PIXI.Sprite(
        ResourceManager.Handle.getCommon(`page4_title1.png`).texture
      );
      this.mTitle2 = new PIXI.Sprite(
        ResourceManager.Handle.getCommon(`page4_title2.png`).texture
      );
      const titleAry = [this.mTitle1, this.mTitle2];
      let i = 1;
      for (const title of titleAry) {
        title.position.set(
          titlePos[i - 1].x,
          titlePos[i - 1].y + title.height / 2
        );
        title.anchor.set(0.5);

        const mask = new PIXI.Graphics();
        mask.beginFill(0x000000, 1);
        mask.drawCircle(0, 0, title.width);
        mask.endFill();
        mask.position.set(title.x - 100, title.y - 100);
        mask.alpha = 0.5;
        mask.pivot.set(mask.width / 2, mask.height / 2);

        this.addChild(title, mask);
        title.mask = mask;
        let d = this.mTitleSnd1.duration;
        i == 1 ? (d = 0) : (d = this.mTitleSnd1.duration);
        gsap
          .to(mask, {
            x: title.x + mask.width / 2,
            y: title.y + mask.height / 2,
            duration: 3,
          })
          .delay(d);

        i += 1;
      }
      this.mTitleSnd1.play();
      gsap.delayedCall(this.mTitleSnd1.duration, () => {
        this.mTitleSnd2.play();
        gsap.delayedCall(this.mTitleSnd2.duration, () => {
          resolve();
        });
      });
    });
  }

  createSmoke() {
    const mask = new PIXI.Graphics();
    mask.beginFill(0xff0000, 1);
    mask.drawRect(0, 0, 540, 574);
    mask.endFill();
    mask.position.set(696, 42);
    this.addChild(mask);
    this.smokeAry = [];
    let xValue = 644;
    for (let i = 1; i <= 3; i++) {
      const smoke = new PIXI.Sprite(
        ResourceManager.Handle.getCommon(`page4_smoke.png`).texture
      );
      smoke.position.set(xValue, 600);
      xValue += 60;
      smoke.mask = mask;
      this.addChild(smoke);
      this.smokeAry.push(smoke);
      gsap
        .to(smoke, {
          y: -300,
          duration: 6,
          ease: Power0.easeNone,
        })
        .delay(i)
        .repeat(-1);
    }

    gsap.delayedCall(6, async () => {
      await this.goScene("page5");
    });
  }
}
