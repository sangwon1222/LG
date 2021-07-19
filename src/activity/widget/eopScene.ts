import gsap from "gsap/all";
import pixiSound from "pixi-sound";
import { LgApp } from "../core/app";
import { ResourceManager } from "../core/resourceManager";
import config from "../utill/config";

export class Sprite extends PIXI.Sprite {
  // set alphaMode(v: boolean) {
  //   v ? (this.alpha = 0) : (this.alpha = 1);
  // }
  constructor(img: string) {
    super();
    this.texture = ResourceManager.Handle.getCommon(img).texture;
    this.anchor.set(0.5);
  }
  onInteractive() {
    this.interactive = true;
    this.buttonMode = true;
    this.on("pointertap", () => {
      this.registEvent();
    });
  }

  registEvent() {
    //
  }
}

export class EOP extends PIXI.Container {
  private mDimmed: PIXI.Graphics;
  private mFlower: Sprite;
  private mCharactor: Sprite;
  private mHomeBtn: Sprite;
  private mDoneBtn: Sprite;
  constructor() {
    super();
  }

  async onInit() {
    await gsap.globalTimeline.clear();
    pixiSound.stopAll();
    // 딤드 화면
    this.mDimmed = new PIXI.Graphics();
    this.mDimmed.beginFill(0x000000, 1);
    this.mDimmed.drawRect(0, 0, config.w, config.h);
    this.mDimmed.endFill();
    this.mDimmed.alpha = 0;
    this.mDimmed.interactive = true;

    this.mFlower = new Sprite("effect.png");
    this.mCharactor = new Sprite("cha.png");
    this.mHomeBtn = new Sprite("btn_home.png");
    this.mDoneBtn = new Sprite("btn_done.png");

    this.mFlower.position.set(config.w / 2, config.h * 1.5);
    this.mCharactor.position.set(config.w / 2, config.h / 2 - 100);
    this.mHomeBtn.position.set(config.w / 2 + 200, config.h / 2 + 240);
    this.mDoneBtn.position.set(config.w / 2 - 200, config.h / 2 + 240);

    this.mCharactor.scale.set(0, 0);
    this.mHomeBtn.alpha = 0;
    this.mDoneBtn.alpha = 0;

    this.addChild(
      this.mDimmed,
      this.mFlower,
      this.mCharactor,
      this.mHomeBtn,
      this.mDoneBtn
    );
  }
  async onStart() {
    // 딤드 까매지고
    gsap.to(this.mDimmed, { alpha: 0.6, duration: 0.5 });
    // 꽃가루 날리고
    gsap
      .to(this.mFlower, {
        y: this.mFlower.height / 2,
        duration: 0.5,
        ease: "back",
      })
      .yoyo(true)
      .delay(0.5);
    // 메인 캐릭터 나오고
    gsap.delayedCall(1, () => {
      ResourceManager.Handle.getCommon("eop.mp3").sound.play();
    });
    gsap.to(this.mCharactor.scale, { x: 1, y: 1, duration: 0.5 }).delay(1);
    // eop 두 버튼 나오고
    gsap.to(this.mHomeBtn, { alpha: 1, duration: 0.5 }).delay(1.5);
    gsap
      .to(this.mDoneBtn, { alpha: 1, duration: 0.5 })
      .delay(1.5)
      .eventCallback("onComplete", () => {
        // 모션 다 끝나면 interactive 켜주기
        this.mHomeBtn.onInteractive();
        this.mHomeBtn.registEvent = () => {
          gsap
            .to(this.mHomeBtn.scale, { x: 1.1, y: 1.1, duration: 0.25 })
            .yoyo(true)
            .repeat(1)
            .eventCallback("onComplete", async () => {
              await LgApp.Handle.eopFlag(false);
              location.reload();
            });
        };
        this.mDoneBtn.onInteractive();
        this.mDoneBtn.registEvent = () => {
          this.mDoneBtn.registEvent = () => null;
          gsap
            .to(this.mDoneBtn.scale, { x: 1.1, y: 1.1, duration: 0.25 })
            .yoyo(true)
            .repeat(1)
            .eventCallback("onComplete", async () => {
              await LgApp.Handle.eopFlag(false);
              await LgApp.Handle.goScene("page1", true);
            });
        };
      });
  }

  async clearEop() {
    this.mDimmed?.destroy();
    this.mFlower?.destroy();
    this.mCharactor?.destroy();
    this.mHomeBtn?.destroy();
    this.mDoneBtn?.destroy();

    this.mDimmed = null;
    this.mFlower = null;
    this.mCharactor = null;
    this.mHomeBtn = null;
    this.mDoneBtn = null;
  }
}
