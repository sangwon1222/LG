import gsap from "gsap/all";
import pixiSound from "pixi-sound";
import { InteractionEvent, resources } from "pixi.js";
import { ResourceManager } from "../core/resourceManager";
import { SceneBase } from "../core/sceneBase";
import config from "../utill/config";
import { Timer } from "../widget/Timer";
import { shuffleArray } from "../utill/gameUtil";
import { EOP } from "../widget/eopScene";
import { LgApp } from "../core/app";

export class ExBox extends PIXI.Sprite {
  private mShowFlag: boolean;
  private mAniTimeLine: any;
  private mLockFlag: boolean;
  private mClearFlag: boolean;
  private mCardSnd: pixiSound.Sound;

  get clearFlag(): boolean {
    return this.mClearFlag;
  }
  set clearFlag(v: boolean) {
    this.mClearFlag = v;
  }

  get lockFlag(): boolean {
    return this.mLockFlag;
  }
  set lockFlag(v: boolean) {
    this.mLockFlag = v;
  }

  get matchIdx(): { aryIdx: number; matchIdx: number } {
    return this.mMatchIdx;
  }
  set matchIdx(v: { aryIdx: number; matchIdx: number }) {
    this.mMatchIdx = v;
  }

  constructor(
    private mIdx: number,
    private mMatchIdx: { aryIdx: number; matchIdx: number }
  ) {
    super();

    this.mShowFlag = false;
    this.texture = ResourceManager.Handle.getCommon(
      `activity3_ex_${this.mIdx}.png`
    ).texture;
    this.anchor.set(0.5);

    this.interactive = false;
    this.buttonMode = false;
    //카드 클릭시의 처리를 나타낸다.
    this.on("pointertap", (evt: InteractionEvent) => {
      if (this.mLockFlag) return;
      if (this.mClearFlag) return;

      const tClickSnd = ResourceManager.Handle.getCommon("click.mp3").sound;
      tClickSnd.play();
      this.mShowFlag = !this.mShowFlag;
      this.mShowFlag ? this.openCard() : this.closeCard();
      this.onPointertap(evt);
    });
  }

  //카드 열기를 나타낸다.
  openCard() {
    if (this.mAniTimeLine) {
      this.mAniTimeLine.kill();
      this.mAniTimeLine = null;
    }
    this.mAniTimeLine = gsap.timeline();

    this.mAniTimeLine.to(this.scale, { x: 0, duration: 0.2 });
    gsap.delayedCall(0.2, () => {
      this.texture = ResourceManager.Handle.getCommon(
        `activity3_ex_${this.mIdx}.png`
      ).texture;
    });
    this.mAniTimeLine.to(this.scale, { x: 1, duration: 0.3 });
  }

  //카드 닫기를 나타낸다.
  closeCard() {
    this.mShowFlag = false;
    if (this.mAniTimeLine) {
      this.mAniTimeLine.kill();
      this.mAniTimeLine = null;
    }
    this.mAniTimeLine = gsap.timeline();

    this.mAniTimeLine.to(this.scale, { x: 0, duration: 0.2 });
    gsap.delayedCall(0.2, () => {
      this.texture = ResourceManager.Handle.getCommon(
        `matching_card1.png`
      ).texture;
    });
    this.mAniTimeLine.to(this.scale, { x: 1, duration: 0.3 });
  }

  //카드 클릭시의 오버라이드 처리를 나타낸다.
  onPointertap(evt: PIXI.InteractionEvent) {
    //
  }
}
export class Page12 extends SceneBase {
  private mBG: PIXI.Sprite;
  private mSpeaker: PIXI.Sprite;
  private mNextBtn: PIXI.Sprite;
  private mFingerSp: PIXI.Sprite;
  private mExBoxAry: Array<ExBox>;
  private mQuestExBoxAry: Array<number>;
  private mOpenMatch: { aryIdx: number; matchIdx: number };
  private mTimeOut: number;
  private mDarkBg: PIXI.Graphics;
  private mClearCnt: number;
  private mTimeOutHnd: Timer;
  private mAniTimeLine: any;
  private mAffodunce: boolean;
  private mClear: boolean;
  private mEop: EOP;

  constructor() {
    super("page12");
  }
  async onInit() {
    window.onkeydown = async (evt: KeyboardEvent) => {
      if (evt.key == "+") {
        window.onkeydown = () => null;
        await LgApp.Handle.eopFlag(true);
      }
    };

    this.onEnd = async () => {
      await gsap.globalTimeline.clear();
      this.removeMotionDelay();
      await this.hideFingerGuide();
      this.mFingerSp = null;
      this.mEop?.clearEop();

      for (let i = 0; i < 6; i++) {
        this.mExBoxAry[i]?.destroy();
        this.mExBoxAry[i] = null;
      }

      if (this.mAniTimeLine) {
        this.mAniTimeLine.kill();
        this.mAniTimeLine = null;
      }
      // gsap.killTweensOf(this.mFingerSp);
      // gsap.killTweensOf(this.mDarkBg);

      pixiSound.stopAll();

      // if (this.mFingerSp != null && this.mFingerSp != undefined) this.mFingerSp.destroy();
    };
    this.sortableChildren = true;
    this.mExBoxAry = [];
    this.mQuestExBoxAry = [0, 1, 2, 3, 4, 5];
    this.mOpenMatch = null;
    this.mClearCnt = 2;

    this.mBG = new PIXI.Sprite(
      ResourceManager.Handle.getCommon("matching_bg.png").texture
    );
    this.addChild(this.mBG);

    const tMatchAry = [1, 2, 1, 3, 3, 2];

    const tCorrectSnd = ResourceManager.Handle.getCommon("correct.mp3").sound;
    const tWrongSnd = ResourceManager.Handle.getCommon("wrong.mp3").sound;

    const tPopUpSnd = ResourceManager.Handle.getCommon("03_activity_sfx.mp3")
      .sound;

    for (let i = 0; i < 6; i++) {
      const tExBox = new ExBox(i + 1, { aryIdx: i, matchIdx: tMatchAry[i] });
      let tPosY = 600;
      if (i < 3) tPosY = 300;

      tExBox.position.set(340 * (i % 3) + 300, tPosY);
      this.addChild(tExBox);

      tExBox.onPointertap = async () => {
        this.hideFingerGuide();
        if (this.mOpenMatch === null) {
          //첫번째 카드 뒤집기를 나타낸다.
          this.mOpenMatch = { aryIdx: i, matchIdx: tMatchAry[i] };
          this.startTimeOut(5, true);
        } else {
          //두번째 카드 뒤집기를 나타낸다.
          this.lockExBox(true);
          if (this.mOpenMatch.aryIdx != i) {
            //두번째 카드가 첫번째 카드가 아님을 나타낸다.
            await this.tweenMotion(1);
            if (this.mOpenMatch.matchIdx === tMatchAry[i]) {
              //두번째 카드가 첫번째 카드와 같은 짝인경우를 나타낸다.
              tCorrectSnd.play();
              // this.mExBoxAry[this.mOpenMatch.aryIdx].clearFlag = true;
              tPopUpSnd.play();
              this.matchCardShow(
                tExBox,
                this.mExBoxAry[this.mOpenMatch.aryIdx]
              );
            } else {
              //두번째 카드가 첫번째 카드와 다른 짝인 경우를 나타낸다.
              tWrongSnd.play();
              tExBox.closeCard();
              this.mExBoxAry[this.mOpenMatch.aryIdx].closeCard();
              this.startTimeOut(5, true);
              this.lockExBox(false);
            }
          } else {
            this.startTimeOut(5, true);
            this.lockExBox(false);
          }

          this.mOpenMatch = null;
        }
      };
      this.mExBoxAry[i] = tExBox;
    }

    this.mFingerSp = new PIXI.Sprite(
      ResourceManager.Handle.getCommon("affordance.png").texture
    );
    this.mFingerSp.anchor.set(0.5, 0);
    this.addChild(this.mFingerSp);
    this.mFingerSp.visible = false;
    this.mFingerSp.zIndex = 10;

    this.mDarkBg = new PIXI.Graphics();
    this.mDarkBg.beginFill(0x000000, 0.8);
    this.mDarkBg.drawRect(0, 0, config.w, config.h);
    this.mDarkBg.endFill();
    this.mDarkBg.alpha = 0;
    this.addChild(this.mDarkBg);
  }

  async onStart() {
    const tTitleSnd = ResourceManager.Handle.getCommon("03_activity_1.mp3")
      .sound;
    tTitleSnd.play();

    await this.tweenMotion(tTitleSnd.duration);
    const tCardSnd = ResourceManager.Handle.getCommon("03_activitysfx_1.mp3")
      .sound;
    tCardSnd.play();

    for (let i = 0; i < 6; i++) {
      this.mExBoxAry[i].closeCard();
      await this.tweenMotion(0.25);
    }

    this.lockExBox(false);

    this.startTimeOut(5, true);
  }

  //카드 클릭 방지를 나타낸다.
  private lockExBox(tVal: boolean) {
    for (let i = 0; i < 6; i++) {
      this.mExBoxAry[i].lockFlag = tVal;

      this.mExBoxAry[i].interactive = !tVal;
      this.mExBoxAry[i].buttonMode = !tVal;
    }
  }

  //카드 짝을 찾았을때의 처리를 나타낸다.
  async matchCardShow(tExBox1: ExBox, tExBox2: ExBox) {
    this.lockExBox(true);

    this.hideFingerGuide();

    tExBox1.clearFlag = true;
    tExBox2.clearFlag = true;

    gsap.to(tExBox1, { alpha: 0, duration: 0.5 });
    gsap.to(tExBox2, { alpha: 0, duration: 0.5 });

    this.mDarkBg.alpha = 0;
    gsap.to(this.mDarkBg, { alpha: 0.8, duration: 0.5 });

    await this.tweenMotion(0.5);

    tExBox2.position.set(400, 400);
    tExBox1.position.set(900, 400);

    tExBox1.zIndex = 5;
    tExBox2.zIndex = 5;

    gsap.to(tExBox1, { alpha: 1, duration: 0.5 });
    gsap.to(tExBox2, { alpha: 1, duration: 0.5 });

    const tExBoxText1 = new PIXI.Sprite(
      ResourceManager.Handle.getCommon(
        `activity3_text_${tExBox1.matchIdx.aryIdx + 1}.png`
      ).texture
    );
    const tExBoxText2 = new PIXI.Sprite(
      ResourceManager.Handle.getCommon(
        `activity3_text_${tExBox2.matchIdx.aryIdx + 1}.png`
      ).texture
    );
    tExBoxText1.anchor.set(0.5);
    tExBoxText2.anchor.set(0.5);
    tExBoxText1.position.set(900, 600);
    tExBoxText2.position.set(400, 600);
    tExBoxText1.alpha = 0;
    tExBoxText2.alpha = 0;
    this.addChild(tExBoxText1, tExBoxText2);

    gsap.to(tExBoxText1, { alpha: 1, duration: 0.5 });
    gsap.to(tExBoxText2, { alpha: 1, duration: 0.5 });

    await this.tweenMotion(0.5);

    const tExBox1Snd = ResourceManager.Handle.getCommon(
      `03_activity_${tExBox1.matchIdx.aryIdx + 2}.mp3`
    ).sound;
    const tExBox2Snd = ResourceManager.Handle.getCommon(
      `03_activity_${tExBox2.matchIdx.aryIdx + 2}.mp3`
    ).sound;

    gsap.to(tExBox2.scale, {
      x: 1.2,
      y: 1.2,
      duration: 0.5,
      yoyo: true,
      repeat: 1,
    });
    tExBox2Snd.play();
    await this.tweenMotion(tExBox2Snd.duration + 0.5);

    gsap.to(tExBox1.scale, {
      x: 1.2,
      y: 1.2,
      duration: 0.5,
      yoyo: true,
      repeat: 1,
    });
    tExBox1Snd.play();
    await this.tweenMotion(tExBox1Snd.duration + 0.5);

    gsap.to(tExBox1, { alpha: 0, duration: 0.5 });
    gsap.to(tExBox2, { alpha: 0, duration: 0.5 });
    gsap.to(tExBoxText1, { alpha: 0, duration: 0.5 });
    gsap.to(tExBoxText2, { alpha: 0, duration: 0.5 });

    this.mClearCnt--;

    const tExBox1Idx = this.mQuestExBoxAry.indexOf(tExBox1.matchIdx.aryIdx);
    this.mQuestExBoxAry.splice(tExBox1Idx, 1);
    const tExBox2Idx = this.mQuestExBoxAry.indexOf(tExBox2.matchIdx.aryIdx);
    this.mQuestExBoxAry.splice(tExBox2Idx, 1);

    this.mDarkBg.alpha = 0.8;
    gsap.to(this.mDarkBg, { alpha: 0, duration: 0.5 });

    tExBox1.visible = false;
    tExBox2.visible = false;

    tExBoxText1.destroy();
    tExBoxText2.destroy();

    if (this.mClearCnt < 0) {
      this.onClearMove();
    } else {
      // await this.tweenMotion(0.5);

      this.startTimeOut(5, true);
    }
    this.lockExBox(false);
  }

  //완료후 다음 페이지로 이동 버튼 활성화를 나타낸다.
  async onClearMove() {
    this.mNextBtn = new PIXI.Sprite(
      ResourceManager.Handle.getCommon("popup_next_btn.png").texture
    );
    this.mNextBtn.anchor.set(0.5);
    this.mNextBtn.position.set(1189, 402);
    this.addChild(this.mNextBtn);

    await this.tweenMotion(0.5);
    await pixiSound.stopAll();
    await gsap.globalTimeline.clear();
    await LgApp.Handle.eopFlag(true);
    // this.mEop = new EOP();
    // this.mEop.zIndex = 20;
    // this.addChild(this.mEop);
    // await this.mEop.onInit();
    // await this.mEop.onStart();
  }

  // 10초마다 손가락 디렉션 보여주기를 나타낸다.
  private startTimeOut(tTime: number, tStart?: boolean) {
    if (this.mTimeOutHnd !== null) {
      this.mTimeOutHnd?.clear();
      this.mTimeOutHnd = null;
    }
    this.mAffodunce = true;

    this.mTimeOutHnd = new Timer(() => {
      this.showFingerGuide();
    }, 1000 * tTime);
  }

  private async showFingerGuide() {
    if (this.mFingerSp === null) return;
    if (this.mAffodunce === false) return;
    if (this.mClear) return;

    // const tPosY = 600;
    this.mQuestExBoxAry = shuffleArray(this.mQuestExBoxAry);

    const tIdx1 = this.mQuestExBoxAry[0];
    const tIdx2 = this.mQuestExBoxAry[1];

    const tPosX1 = this.mExBoxAry[tIdx1].position.x;
    const tPosY1 = this.mExBoxAry[tIdx1].position.y;
    const tPosX2 = this.mExBoxAry[tIdx2].position.x;
    const tPosY2 = this.mExBoxAry[tIdx2].position.y;

    this.mFingerSp.position.x = tPosX1 + 10;
    this.mFingerSp.position.y = tPosY1 + 20;
    this.mFingerSp.alpha = 1;
    this.mFingerSp.visible = true;
    this.mFingerSp.scale.set(1.2);
    // gsap.killTweensOf(this.mFingerSp);
    if (this.mAniTimeLine) {
      this.mAniTimeLine.kill();
      this.mAniTimeLine = null;
    }
    this.mAniTimeLine = gsap.timeline();

    this.mAniTimeLine.to(this.mFingerSp, {
      x: tPosX1,
      y: tPosY1,
      duration: 0.5,
    });
    this.mAniTimeLine.to(this.mFingerSp.scale, {
      x: 1,
      y: 1,
      duration: 0.5,
      delay: 0.2,
    });
    this.mAniTimeLine.to(this.mFingerSp, {
      // y: tPosY -100,
      alpha: 0,
      duration: 0.5,
      // ease: 'back.out(4)',
    });

    // await this.tweenMotion(0.5);

    this.mAniTimeLine.to(this.mFingerSp, {
      x: tPosX2 + 10,
      y: tPosY2 + 10,
      duration: 0.1,
    });
    this.mAniTimeLine.to(this.mFingerSp.scale, {
      x: 1.2,
      y: 1.2,
      duration: 0.1,
    });
    this.mAniTimeLine.to(this.mFingerSp, {
      x: tPosX2,
      y: tPosY2,
      alpha: 1,
      duration: 0.5,
    });
    this.mAniTimeLine.to(this.mFingerSp.scale, {
      x: 1,
      y: 1,
      duration: 0.2,
      // repeat: 1,
      // yoyo: true,
      // ease: 'back.out(4)',
    });
    this.mAniTimeLine.to(this.mFingerSp, {
      // y: tPosY,
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
