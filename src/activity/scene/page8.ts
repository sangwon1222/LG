import * as PIXI from "pixi.js";
import gsap, { Power0 } from "gsap/all";
import { ResourceManager } from "../core/resourceManager";
import { SceneBase } from "../core/sceneBase";

export class DragAffor extends PIXI.Container {
  private mHand: PIXI.Sprite;
  private mLeftArrow: PIXI.Sprite;
  private mRightArrow: PIXI.Sprite;

  private mHandMotion: gsap.core.Timeline;

  constructor() {
    super();
  }

  createObject(): Promise<void> {
    return new Promise<void>((resolve) => {
      this.mHand = new PIXI.Sprite(
        ResourceManager.Handle.getCommon("affordance_hand.png").texture
      );
      this.mHand.scale.set(0.8);
      this.mHand.anchor.set(0.5);
      this.mHand.y = 60;

      this.mLeftArrow = new PIXI.Sprite(
        ResourceManager.Handle.getCommon("affordance_arrow.png").texture
      );
      this.mLeftArrow.angle = 180;
      this.mLeftArrow.anchor.set(0.5);
      this.mLeftArrow.x = -this.mLeftArrow.width / 2 - 50;

      this.mRightArrow = new PIXI.Sprite(
        ResourceManager.Handle.getCommon("affordance_arrow.png").texture
      );
      this.mRightArrow.anchor.set(0.5);
      this.mRightArrow.x = this.mRightArrow.width / 2 + 50;

      this.addChild(this.mHand, this.mLeftArrow, this.mRightArrow);
      resolve();
    });
  }

  async start() {
    this.removeChildren();
    await this.createObject();

    gsap
      .to(this.mHand, { x: 100, duration: 0.8, ease: Power0.easeNone })
      .eventCallback("onComplete", () => {
        this.mHandMotion = gsap.timeline({
          repeat: -1,
          yoyo: true,
        });
        this.mHandMotion.to(this.mHand, {
          x: this.mHand.x - 180,
          duration: 1.6,
          ease: Power0.easeNone,
        });
      });
  }

  async endAffor() {
    if (this.mHandMotion) {
      this.mHandMotion.kill();
      this.mHandMotion = null;
    }
    this.removeChildren();
  }
}
export class Page8 extends SceneBase {
  private mBG: PIXI.Sprite;
  private mSpine: PIXI.spine.Spine;

  private mSpineComplete: boolean;
  private mRainbowComplete: boolean;

  private mRainbow: PIXI.Sprite;

  private mTitle: PIXI.Sprite;
  private mTitleSnd: PIXI.sound.Sound;

  private mDragAffor: DragAffor;
  private mDragFlag: boolean;

  private mSleepSnd: PIXI.sound.Sound;

  constructor() {
    super("page8");
  }
  async onInit() {
    this.mSpineComplete = false;
    this.mRainbowComplete = false;
    this.removeChildren();
    this.mBG = new PIXI.Sprite(
      ResourceManager.Handle.getCommon("page8.png").texture
    );

    this.createSpine();
    this.mSpine.state.timeScale = 0;

    this.addChild(this.mBG, this.mSpine);
    this.sortableChildren = true;
    this.mBG.zIndex = 1;
    this.mSpine.zIndex = 3;
  }
  async onStart() {
    this.mTitleSnd = ResourceManager.Handle.getCommon("08_nar_1.mp3").sound;
    this.mSleepSnd = ResourceManager.Handle.getCommon("08_sfx_2.mp3").sound;

    if (window["bgm"].paused) window["bgm"].play({ loop: true });
    window.onkeydown = async (evt: KeyboardEvent) => {
      if (evt.key == "+") {
        window.onkeydown = () => null;
        await gsap.globalTimeline.clear();
        await this.registEvent();
      }
    };
    this.mSpine.state.timeScale = 1;
    //이미지 아래 설명 글
    await this.createImgText();
    this.registTitleSound();
    this.registEvent();
  }

  // 어포던스 및 캐릭터 클릭했을때 이벤트
  async registEvent() {
    let affordance = new PIXI.spine.Spine(
      ResourceManager.Handle.getCommon("circle.json").spineData
    );
    affordance.position.set(890, 560);
    affordance.state.setAnimation(0, "animation", true);
    affordance.zIndex = 6;

    // 무지개 문지르는 어포던스
    this.mDragAffor = new DragAffor();
    this.mDragAffor.position.set(640, 188);
    this.mDragAffor.zIndex = 6;
    await this.mDragAffor.start();

    this.addChild(affordance, this.mDragAffor);

    this.mRainbow = new PIXI.Sprite(
      ResourceManager.Handle.getCommon("8_rainbow.png").texture
    );
    this.mRainbow.zIndex = 2;
    this.mRainbow.alpha = 0;
    this.addChild(this.mRainbow);
    this.showRainbow();

    this.mSpine.interactive = true;
    this.mSpine.buttonMode = true;
    this.mSpine.once("pointertap", () => {
      this.removeChild(affordance);
      affordance = null;
      window["clickSnd"].play();
      gsap.delayedCall(window["clickSnd"].duration, () => {
        this.mSleepSnd.play({ loop: true });
      });
      this.mSpine.state.setAnimation(0, "8_2", true);
      this.mSpineComplete = true;
      this.checkComplete();
    });
  }

  // 문질러서 무지개 나오게하는 함수 등록
  showRainbow() {
    this.mRainbow.interactive = true;
    this.mRainbow.buttonMode = true;
    this.mRainbow.hitArea = new PIXI.Rectangle(204, 0, 868, 410);
    this.mDragFlag = false;
    this.mRainbow
      .on("pointerdown", () => {
        this.mDragFlag = true;
        if (this.mDragAffor) {
          this.mDragAffor.visible = false;
        }
      })
      .on("pointermove", async () => {
        if (!this.mDragFlag) {
          return;
        }
        if (this.mRainbow.alpha >= 1) {
          this.mRainbowComplete = true;
          this.mRainbow.interactive = false;
          this.mRainbow.buttonMode = false;

          ResourceManager.Handle.getCommon("08_sfx_1.mp3").sound.play();

          if (this.mDragAffor) {
            await this.mDragAffor.endAffor();
            this.removeChild(this.mDragAffor);
            this.mDragAffor = null;
          }

          this.checkComplete();
        } else {
          this.mRainbow.alpha += 0.01;
        }
      })
      .on("pointerout", async () => {
        await this.cancleDrag();
      })
      .on("touchend", async () => {
        await this.cancleDrag();
      })
      .on("touchcancel", async () => {
        await this.cancleDrag();
      });
  }

  private async cancleDrag() {
    if (!this.mDragFlag) {
      return;
    }
    this.mDragFlag = false;
    if (this.mDragAffor) {
      this.mDragAffor.visible = true;
      await this.mDragAffor.start();
    }
  }

  // 1.문질러서 무지개 나왔는지
  // 2. 클릭해서 자는 스파인 나왔는지
  // 두 조건 확인 후 다음페이지로 보낸다.
  checkComplete() {
    if (this.mSpineComplete && this.mRainbowComplete) {
      gsap.delayedCall(4, async () => {
        this.mSleepSnd.stop();
        await this.goScene("page9");
      });
    }
  }

  //캐릭터가 홍학 위에서 자는 스파인
  createSpine() {
    this.mSpine = new PIXI.spine.Spine(
      ResourceManager.Handle.getCommon("8_p_motion.json").spineData
    );
    this.mSpine.stateData.defaultMix = 0.5;
    this.mSpine.state.setAnimation(0, "8_1", true);
    this.mSpine.position.set(660, 400);
  }

  // 이미지 아래 설명 글
  createImgText(): Promise<void> {
    return new Promise<void>((resolve) => {
      this.mTitle = new PIXI.Sprite(
        ResourceManager.Handle.getCommon(`page8_title.png`).texture
      );
      this.mTitle.anchor.set(0.5);
      this.mTitle.position.set(280, 730);
      this.mTitle.alpha = 0;
      this.mTitle.zIndex = 2;
      this.addChild(this.mTitle);

      gsap.to(this.mTitle, { alpha: 1, duration: 0.5 });
      let titleSnd = ResourceManager.Handle.getCommon("08_nar_1.mp3").sound;
      titleSnd.play();
      gsap.delayedCall(titleSnd.duration, () => {
        titleSnd = null;
        resolve();
      });
    });
  }

  // 타이틀 글자를 클릭했을 때, 사운드 나오게하는 이벤트 등록
  registTitleSound() {
    this.mTitle.interactive = true;
    this.mTitle.buttonMode = true;
    this.mTitle.on("pointertap", () => [this.playTitleSound()]);
  }

  // 타이틀 사운드 재생
  playTitleSound() {
    if (this.mTitleSnd) {
      this.mTitleSnd.stop();
    }
    this.mTitleSnd.play();
  }
}
