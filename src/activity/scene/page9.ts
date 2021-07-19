import gsap, { Power0 } from "gsap/all";
import pixiSound from "pixi-sound";
import { InteractionEvent, resources } from "pixi.js";
import { ResourceManager } from "../core/resourceManager";
import { SceneBase } from "../core/sceneBase";
import config from "../utill/config";

export class Page9 extends SceneBase {
  private mBG: PIXI.Sprite;
  private mSpeaker: PIXI.Sprite;
  private mNextBtn: PIXI.Sprite;

  private mTitleSnd: PIXI.sound.Sound;
  private mSubSnd: PIXI.sound.Sound;
  private mTimeOut: number;
  private mSoundFuc: any;

  private mClear: boolean;
  // private mAffor: PIXI.Sprite;
  // private mAfforDelay: any;
  constructor() {
    super("page9");
  }
  async onInit() {
    window.onkeydown = async (evt: KeyboardEvent) => {
      if (evt.key == "+") {
        window.onkeydown = () => null;
        await this.goScene("page10");
        this.onEnd();
      }
    };

    this.onEnd = async () => {
      await this.removeMotionDelay();

      pixiSound.stopAll();
    };

    this.removeChildren();
    this.mBG = new PIXI.Sprite(
      ResourceManager.Handle.getCommon("page9.png").texture
    );
    this.addChild(this.mBG);

    this.mSpeaker = new PIXI.Sprite(
      ResourceManager.Handle.getCommon("speaker.png").texture
    );
    this.mSpeaker.position.set(543, 353);
    this.mSpeaker.anchor.set(0.5);
    this.addChild(this.mSpeaker);

    this.mTitleSnd = ResourceManager.Handle.getCommon(
      "00_activity_1.mp3"
    ).sound;
    this.mSubSnd = ResourceManager.Handle.getCommon("00_activity_2.mp3").sound;

    this.mClear = false;
  }
  async onStart() {
    if (window["bgm"].paused) window["bgm"].play({ loop: true });
    //이미지 아래 설명 글
    this.mSpeaker.interactive = true;
    this.mSpeaker.buttonMode = true;
    this.mSpeaker.on("pointertap", () => {
      this.mSpeaker.interactive = false;
      this.mSpeaker.buttonMode = false;
      window["clickSnd"].play();
      gsap.delayedCall(window["clickSnd"].duration, async () => {
        // gsap.killTweensOf(this.mAffor);
        // this.mAffor.visible = false;
        await this.playSound();
        this.mSpeaker.interactive = true;
        this.mSpeaker.buttonMode = true;
      });
    });

    this.playSound();

    // this.mAffor = new PIXI.Sprite(
    //   ResourceManager.Handle.getCommon("affordance.png").texture
    // );
    // this.mAffor.anchor.set(0.5);
    // this.addChild(this.mAffor);
    // this.mAffor.position.set(this.mSpeaker.x + 30, this.mSpeaker.y + 60);

    // gsap
    //   .to(this.mAffor, { angle: -15, duration: 1, ease: Power0.easeNone })
    //   .repeat(-1)
    //   .yoyo(true);

    // this.mAfforDelay = gsap.delayedCall(3, () => {
    //   gsap
    //     .to(this.mAffor, { angle: -15, duration: 1, ease: Power0.easeNone })
    //     .repeat(-1)
    //     .yoyo(true);
    // });
    // this.mAfforDelay.pause();
  }

  playSound(): Promise<void> {
    return new Promise<void>((resolve) => {
      if (this.mSoundFuc) {
        this.mSoundFuc.kill();
      }
      this.mTitleSnd.stop();
      this.mSubSnd.stop();

      this.mTitleSnd.play();

      this.mSoundFuc = gsap.delayedCall(this.mTitleSnd.duration + 0.5, () => {
        this.mSubSnd.play();
        gsap.delayedCall(this.mSubSnd.duration + 0.5, () => {
          if (!this.mClear) this.onClearMove();
          this.mClear = true;
          resolve();
        });
      });
    });
  }

  //완료후 다음 페이지로 이동 버튼 활성화를 나타낸다.
  async onClearMove() {
    this.mNextBtn = new PIXI.Sprite(
      ResourceManager.Handle.getCommon("popup_next_btn.png").texture
    );
    this.mNextBtn.anchor.set(0.5);
    this.mNextBtn.position.set(1189, 402);
    this.addChild(this.mNextBtn);

    this.mNextBtn.interactive = true;
    this.mNextBtn.buttonMode = true;
    const tClickSnd = ResourceManager.Handle.getCommon("click.mp3").sound;
    this.mNextBtn.on("pointertap", async () => {
      // tClickSnd.play();
      // await this.tweenMotion(0.5);
      gsap.killTweensOf(this.mNextBtn);
      await this.goScene("page10");
    });
    this.mNextBtn.alpha = 0;
    gsap.to(this.mNextBtn, {
      alpha: 1,
      duration: 0.5,
      repeatDelay: 0.5,
      yoyo: true,
      repeat: -1,
    });
  }

  //모션대기 설정하기를 나타낸다.
  tweenMotion(tData: any): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.mTimeOut = setTimeout(resolve, tData * 1000);
    });
  }

  //모션대기 타임아웃 제거를 나타낸다.
  removeMotionDelay() {
    clearTimeout(this.mTimeOut);
    this.mTimeOut = null;
  }
}
