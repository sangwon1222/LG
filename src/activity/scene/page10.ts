import gsap from "gsap/all";
import pixiSound from "pixi-sound";
import { InteractionEvent, resources } from "pixi.js";
import { ResourceManager } from "../core/resourceManager";
import { SceneBase } from "../core/sceneBase";
import config from "../utill/config";
import { Timer } from "../widget/Timer";

export class Page10 extends SceneBase {
  private mBG: PIXI.Sprite;
  private mTitleSp: PIXI.Sprite;
  private mQuestSp: PIXI.Sprite;
  private mSpeakerSp: PIXI.Sprite;
  private mFingerSp: PIXI.Sprite;
  private mNextBtn: PIXI.Sprite;
  private mAnswerOSp: PIXI.Sprite;
  private mAnswerXSp: PIXI.Sprite;
  private mBigXSp: PIXI.Sprite;
  private mTimeOutHnd: Timer;
  private mTimeOut: number;
  private mAniTimeLine: any;
  private mAffodunce: boolean;
  private mClear: boolean;

  constructor() {
    super("page10");
  }
  async onInit() {
    this.removeChildren();
    window.onkeydown = async (evt: KeyboardEvent) => {
      if (evt.key == "+") {
        window.onkeydown = () => null;
        await this.goScene("page11");
        this.onEnd();
      }
    };

    this.onEnd = async () => {
      await gsap.globalTimeline.clear();
      this.removeMotionDelay();
      await this.hideFingerGuide();
      this.mFingerSp = null;
      if (this.mAniTimeLine) {
        this.mAniTimeLine.kill();
        this.mAniTimeLine = null;
      }
      // if (this.mFingerSp != null && this.mFingerSp != undefined) this.mFingerSp.destroy();

      pixiSound.stopAll();
    };

    this.mAffodunce = false;
    this.mClear = false;
    this.mBG = new PIXI.Sprite(
      ResourceManager.Handle.getCommon("activity1_bg.png").texture
    );
    this.addChild(this.mBG);

    this.mTitleSp = new PIXI.Sprite(
      ResourceManager.Handle.getCommon("activity1_question.png").texture
    );
    this.mTitleSp.anchor.set(0.5);
    this.mTitleSp.position.set(640, 72.5);
    this.addChild(this.mTitleSp);

    this.mQuestSp = new PIXI.Sprite(
      ResourceManager.Handle.getCommon("activity1_ex.png").texture
    );
    this.mQuestSp.anchor.set(0.5);
    this.mQuestSp.position.set(640.5, 440);
    this.addChild(this.mQuestSp);

    this.mSpeakerSp = new PIXI.Sprite(
      ResourceManager.Handle.getCommon("speaker.png").texture
    );
    this.mSpeakerSp.anchor.set(0.5);
    this.mSpeakerSp.position.set(636, 209.5);
    this.addChild(this.mSpeakerSp);

    this.mAnswerOSp = new PIXI.Sprite(
      ResourceManager.Handle.getCommon("ex_o.png").texture
    );
    this.mAnswerOSp.anchor.set(0.5);
    this.mAnswerOSp.position.set(258.5, 442);
    this.addChild(this.mAnswerOSp);

    this.mAnswerXSp = new PIXI.Sprite(
      ResourceManager.Handle.getCommon("ex_x.png").texture
    );
    this.mAnswerXSp.anchor.set(0.5);
    this.mAnswerXSp.position.set(1024, 441.5);
    this.addChild(this.mAnswerXSp);

    this.mBigXSp = new PIXI.Sprite(
      ResourceManager.Handle.getCommon("big_x.png").texture
    );
    this.mBigXSp.anchor.set(0.5);
    this.mBigXSp.position.set(640, 400);
    this.mBigXSp.alpha = 0;
    this.addChild(this.mBigXSp);

    this.mFingerSp = new PIXI.Sprite(
      ResourceManager.Handle.getCommon("affordance.png").texture
    );
    this.mFingerSp.anchor.set(0.5, 0);
    this.addChild(this.mFingerSp);
    this.mFingerSp.visible = false;
  }

  async onStart() {
    if (window["bgm"].paused) window["bgm"].play({ loop: true });
    //이미지 아래 설명 글

    const tTitleSnd = ResourceManager.Handle.getCommon("01_activity_1.mp3")
      .sound;
    tTitleSnd.play();

    gsap.delayedCall(tTitleSnd.duration, () => {
      if (this.mClear) return;
      this.mAffodunce = true;
      this.showFingerGuide();
    });

    this.mTitleSp.interactive = true;
    this.mTitleSp.buttonMode = true;
    this.mTitleSp.on("pointertap", (evt: InteractionEvent) => {
      pixiSound.stopAll();
      tTitleSnd.play();
    });

    const tQuestSnd = ResourceManager.Handle.getCommon("01_activity_2.mp3")
      .sound;
    const tClickSnd = ResourceManager.Handle.getCommon("click.mp3").sound;

    this.mSpeakerSp.interactive = true;
    this.mSpeakerSp.buttonMode = true;
    this.mSpeakerSp.on("pointertap", (evt: InteractionEvent) => {
      pixiSound.stopAll();
      tClickSnd.play();
      tQuestSnd.play();
    });

    const tCorrectSnd = ResourceManager.Handle.getCommon("correct.mp3").sound;
    this.mAnswerOSp.interactive = true;
    this.mAnswerOSp.buttonMode = true;
    this.mAnswerOSp.on("pointertap", (evt: InteractionEvent) => {
      this.lockAnswer(true);
      this.hideFingerGuide();
      pixiSound.stopAll();
      tClickSnd.play();
      // tCorrectSnd.play();
      this.correctAnswer(tCorrectSnd);
    });

    const tWrongSnd = ResourceManager.Handle.getCommon("wrong.mp3").sound;
    this.mAnswerXSp.interactive = true;
    this.mAnswerXSp.buttonMode = true;
    this.mAnswerXSp.on("pointertap", (evt: InteractionEvent) => {
      this.lockAnswer(true);
      this.hideFingerGuide();
      pixiSound.stopAll();
      tClickSnd.play();
      // tWrongSnd.play();
      this.wrongAnswer(tWrongSnd);
    });
  }

  private lockAnswer(tVal: boolean) {
    this.mBigXSp.alpha = 0;
    this.mAnswerOSp.interactive = !tVal;
    this.mAnswerOSp.buttonMode = !tVal;

    this.mAnswerXSp.interactive = !tVal;
    this.mAnswerXSp.buttonMode = !tVal;
  }

  private async correctAnswer(tCorrectSnd: pixiSound.Sound) {
    this.mClear = true;
    this.removeMotionDelay();
    const tBigOSp = new PIXI.Sprite(
      ResourceManager.Handle.getCommon("big_o.png").texture
    );
    tBigOSp.anchor.set(0.5);
    tBigOSp.position.set(640, 400);
    tBigOSp.alpha = 0;
    this.addChild(tBigOSp);

    if (this.mAniTimeLine) {
      this.mAniTimeLine.kill();
      this.mAniTimeLine = null;
    }
    this.mAniTimeLine = gsap.timeline();

    this.mAniTimeLine.to(this.mAnswerOSp.scale, {
      x: 1.2,
      y: 1.2,
      duration: 0.3,
      yoyo: true,
      repeat: 1,
    });

    this.mAniTimeLine.to(this.mAnswerOSp, { alpha: 0, duration: 0.5 });
    this.mAniTimeLine.to(this.mAnswerXSp, { alpha: 0, duration: 0.5 });

    // this.mAniTimeLine.to(tBigOSp, {y: 400, alpha: 1, duration: 1, ease: 'back.out(1.8)'});
    this.mAniTimeLine.to(tBigOSp, { alpha: 1, duration: 0.1 });
    this.mAniTimeLine.to(tBigOSp.scale, {
      x: 1.2,
      y: 1.2,
      duration: 0.3,
      yoyo: true,
      repeat: 1,
    });
    this.mAniTimeLine.to(tBigOSp, { alpha: 0, duration: 0.5, delay: 0.5 });
    await this.tweenMotion(1.5);
    tCorrectSnd.play();
    await this.tweenMotion(2);
    // gsap.delayedCall(2.5, () => {
    this.onClearMove();
    // });
  }

  private async wrongAnswer(tWrongSnd: pixiSound.Sound) {
    this.mClear = true;
    this.removeMotionDelay();
    if (this.mAniTimeLine) {
      this.mAniTimeLine.kill();
      this.mAniTimeLine = null;
    }
    this.mAniTimeLine = gsap.timeline();
    // this.mAnswerXSp.position.x = 10
    this.mBigXSp.alpha = 0;
    this.mAniTimeLine.to(this.mAnswerXSp, {
      x: 1004,
      duration: 0.2,
      yoyo: true,
      repeat: 3,
    });
    this.mAniTimeLine.to(this.mAnswerXSp, { x: 1024, duration: 0.2 });

    this.mAniTimeLine.to(this.mBigXSp, { alpha: 1, duration: 0.5 });
    this.mAniTimeLine.to(this.mBigXSp, { alpha: 0, duration: 0.5 });
    await this.tweenMotion(1);
    tWrongSnd.play();
    await this.tweenMotion(1);

    // gsap.delayedCall(2, () => {
    this.mAffodunce = true;
    this.mAnswerXSp.position.x = 1024;
    this.mBigXSp.alpha = 0;
    gsap.killTweensOf(this.mAnswerXSp);
    gsap.killTweensOf(this.mBigXSp);
    this.startTimeOut(5, true);
    this.mClear = false;
    this.lockAnswer(false);
    // });
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
    this.mNextBtn.on("pointertap", async (evt: InteractionEvent) => {
      // tClickSnd.play();
      // await this.tweenMotion(0.5);
      gsap.killTweensOf(this.mNextBtn);
      this.goScene("page11");
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

  // 10초마다 손가락 디렉션 보여주기를 나타낸다.
  private startTimeOut(tTime: number, tStart?: boolean) {
    if (this.mTimeOutHnd !== null) {
      this.mTimeOutHnd?.clear();
      this.mTimeOutHnd = null;
    }

    this.mTimeOutHnd = new Timer(() => {
      this.showFingerGuide();
    }, 1000 * tTime);
  }

  private async showFingerGuide() {
    if (this.mFingerSp === null) return;
    if (this.mAffodunce === false) return;
    if (this.mClear) return;

    let tPosX = 0;
    const tPosY = 500;

    const tPosXAry = [258.5, 1024];

    tPosX = tPosXAry[0];
    this.mFingerSp.position.x = tPosX + 10;
    this.mFingerSp.position.y = tPosY + 20;
    this.mFingerSp.alpha = 1;
    this.mFingerSp.visible = true;
    this.mFingerSp.scale.set(1.2);
    // gsap.killTweensOf(this.mFingerSp);
    if (this.mAniTimeLine) {
      this.mAniTimeLine.kill();
      this.mAniTimeLine = null;
    }
    this.mAniTimeLine = gsap.timeline();

    this.mAniTimeLine.to(this.mFingerSp, { x: tPosX, y: tPosY, duration: 0.5 });
    this.mAniTimeLine.to(this.mFingerSp.scale, {
      x: 1,
      y: 1,
      duration: 0.2,
      repeat: 1,
      yoyo: true,
      // ease: 'back.out(4)',
    });
    this.mAniTimeLine.to(this.mFingerSp, {
      y: tPosY,
      alpha: 0,
      duration: 0.5,
      // ease: 'back.out(4)',
    });

    this.mAniTimeLine.to(this.mFingerSp, {
      x: tPosXAry[1] + 10,
      y: tPosY + 10,
      duration: 0.1,
    });
    this.mAniTimeLine.to(this.mFingerSp, {
      x: tPosXAry[1],
      y: tPosY,
      alpha: 1,
      duration: 0.5,
    });
    this.mAniTimeLine.to(this.mFingerSp.scale, {
      x: 1.2,
      y: 1.2,
      duration: 0.1,
    });
    this.mAniTimeLine.to(this.mFingerSp.scale, {
      x: 1,
      y: 1,
      duration: 0.2,
      repeat: 1,
      yoyo: true,
      // ease: 'back.out(4)',
    });
    this.mAniTimeLine.to(this.mFingerSp, {
      y: tPosY,
      alpha: 0,
      duration: 0.5,
      // ease: 'back.out(4)',
    });

    this.startTimeOut(5, true);
  }

  //손가락 감추기를 나타낸다.
  private hideFingerGuide(): Promise<void> {
    return new Promise<void>((resolve) => {
      // clearTimeout(this.mTimeOutHnd);
      this.mTimeOutHnd = null;
      if (this.mFingerSp) this.mFingerSp.visible = false;
      this.mAffodunce = false;
      resolve();
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
