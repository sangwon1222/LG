import gsap, { Power0, RoughEase } from "gsap/all";
import { ResourceManager } from "../core/resourceManager";
import { SceneBase } from "../core/sceneBase";
import config from "../utill/config";
import { getPos } from "../utill/gameUtil";

export class Page6 extends SceneBase {
  private mBG: PIXI.Sprite;

  private mSpine: PIXI.spine.Spine;

  private mTitleSnd1: PIXI.sound.Sound;
  private mTitleSnd2: PIXI.sound.Sound;
  private mTitleSnd3: PIXI.sound.Sound;

  private mTitleAry: Array<PIXI.Sprite>;
  private mTitle1: PIXI.Sprite;
  private mTitle2: PIXI.Sprite;
  private mTitle3: PIXI.Sprite;

  constructor() {
    super("page6");
  }
  async onInit() {
    this.removeChildren();
    this.mBG = new PIXI.Sprite(
      ResourceManager.Handle.getCommon("page6.png").texture
    );
    this.addChild(this.mBG);

    // 스파인
    this.mSpine = new PIXI.spine.Spine(
      ResourceManager.Handle.getCommon("6_p_motion.json").spineData
    );
    this.mSpine.stateData.defaultMix = 0.5;
    this.addChild(this.mSpine);
    this.mSpine.position.set(640, 398);
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

    this.mSpine.state.setAnimation(0, "6_1", true);

    this.mTitleSnd1 = ResourceManager.Handle.getCommon("06_nar_1.mp3").sound;
    this.mTitleSnd2 = ResourceManager.Handle.getCommon("06_nar_2.mp3").sound;
    this.mTitleSnd3 = ResourceManager.Handle.getCommon("06_nar_3.mp3").sound;

    // 이미지 아래 설명 글
    await this.createImgText();

    const sound = [this.mTitleSnd1, this.mTitleSnd2, this.mTitleSnd3];
    for (let i = 0; i < this.mTitleAry.length; i++) {
      this.mTitleAry[i].interactive = true;
      this.mTitleAry[i].buttonMode = true;
      this.mTitleAry[i].on("pointertap", () => {
        for (const snd of sound) {
          snd.stop();
        }
        sound[i].play();
      });
    }

    this.registEvent();
  }

  // 클릭이벤트
  async registEvent() {
    let affordance = new PIXI.spine.Spine(
      ResourceManager.Handle.getCommon("circle.json").spineData
    );
    this.addChild(affordance);
    affordance.position.set(962, 410);
    affordance.state.setAnimation(0, "animation", true);

    this.mSpine.interactive = true;
    this.mSpine.buttonMode = true;

    this.sortableChildren = true;
    this.mSpine.zIndex = 2;
    affordance.zIndex = 6;

    this.mSpine.once("pointertap", async () => {
      this.removeChild(affordance);
      affordance = null;
      window["clickSnd"].play();
      gsap.delayedCall(window["clickSnd"].duration, () => {
        //번개 효과
        this.thunderEffect();
        this.mSpine.state.setAnimation(0, "6_2", true);
        gsap.to(this.mTitle3, { alpha: 1, duration: 0.5 });

        this.mTitleSnd3.play();
        gsap.delayedCall(this.mTitleSnd3.duration, () => {
          let effectSnd = ResourceManager.Handle.getCommon("06_sfx_1.mp3")
            .sound;
          effectSnd.play();
          gsap.delayedCall(effectSnd.duration, async () => {
            effectSnd.stop();
            effectSnd = null;
            await this.goScene("page7");
          });
        });
      });
    });
  }

  // 번개 효과
  thunderEffect() {
    // const thumderAry = [];
    const pos = [
      { x: 1016, y: 398 },
      { x: 758, y: 34 },
      { x: 1050, y: 0 },
      { x: 1124, y: 148 },
      { x: 647, y: 416 },
      { x: 860, y: 294 },
    ];
    for (let i = 1; i <= 6; i++) {
      const thunder = new PIXI.Sprite(
        ResourceManager.Handle.getCommon(`6_eff${i}.png`).texture
      );
      this.addChild(thunder);
      thunder.position.set(pos[i - 1].x, pos[i - 1].y);
      thunder.alpha = 0;
      thunder.zIndex = 1;
      gsap
        .to(thunder, {
          alpha: 1,
          duration: 0.5,
          ease: RoughEase.ease.config({
            template: Power0.easeOut,
            strength: 1,
            points: 20,
            taper: "none",
            randomize: true,
            clamp: false,
          }),
        })
        .repeat(-1)
        .yoyo(true);

      // thunder.on("pointermove", (evt: PIXI.InteractionEvent) => {
      //   const pos = evt.data.global;
      //   console.log(pos.x, pos.y);
      //   thunder.position.set(pos.x, pos.y);
      // });
      // thumderAry.push(thunder);
    }
    // window.onkeyup = (evt: KeyboardEvent) => {
    //   if (evt.key == "1") thumderAry[0].interactive = true;
    //   if (evt.key == "2") thumderAry[1].interactive = true;
    //   if (evt.key == "3") thumderAry[2].interactive = true;
    //   if (evt.key == "4") thumderAry[3].interactive = true;
    //   if (evt.key == "5") thumderAry[4].interactive = true;
    //   if (evt.key == "6") thumderAry[5].interactive = true;

    //   if (evt.key == "l") {
    //     for (const th of thumderAry) {
    //       th.interactive = false;
    //     }
    //   }
    // };
    this.thunderTextScaleMotion();
  }

  thunderTextScaleMotion() {
    gsap.killTweensOf(this.mTitle3.scale);
    this.mTitle3.scale.set(1);
    gsap
      .to(this.mTitle3.scale, {
        x: 1.2,
        y: 1.2,
        duration: 0.5,
        ease: RoughEase.ease.config({
          template: Power0.easeOut,
          strength: 1,
          points: 20,
          taper: "none",
          randomize: true,
          clamp: false,
        }),
      })
      .repeat(-1)
      .yoyo(true);
  }
  // 이미지 아래 설명 글
  createImgText(): Promise<void> {
    return new Promise<void>((resolve) => {
      const titlePos = [
        { x: config.w / 2 / 2, y: 640 },
        { x: (config.w / 4) * 3 - 60, y: 740 },
        { x: (config.w / 4) * 3 + 220, y: 722 },
      ];
      this.mTitle1 = new PIXI.Sprite(
        ResourceManager.Handle.getCommon(`page6_title1.png`).texture
      );
      this.mTitle2 = new PIXI.Sprite(
        ResourceManager.Handle.getCommon(`page6_title2.png`).texture
      );
      this.mTitle3 = new PIXI.Sprite(
        ResourceManager.Handle.getCommon(`page6_title3.png`).texture
      );
      this.mTitleAry = [this.mTitle1, this.mTitle2, this.mTitle3];
      let i = 1;
      for (const title of this.mTitleAry) {
        title.anchor.set(0.5);
        title.position.set(titlePos[i - 1].x, titlePos[i - 1].y);
        title.alpha = 0;
        this.addChild(title);
        i += 1;
      }

      this.mTitleSnd1.play();
      gsap.to(this.mTitle1, { alpha: 1, duration: 0.5 });
      gsap.delayedCall(this.mTitleSnd1.duration, () => {
        gsap.to(this.mTitle2, { alpha: 1, duration: 0.5 });
        this.mTitleSnd2.play();
        gsap.delayedCall(this.mTitleSnd2.duration, () => {
          resolve();
        });
      });
    });
  }
}
